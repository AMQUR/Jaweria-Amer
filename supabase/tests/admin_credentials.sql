-- Run inside a transaction against a database that has the migration applied.
-- Raises on the first failed expectation; rolls back everything it wrote.
begin;
do $$
declare
  r text; v integer; n integer;
  net text := repeat('a', 64);
  net2 text := repeat('b', 64);
  h text := 'c2NyeXB0LWhhc2gtZm9yLXRlc3RzLW9ubHktMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OQ==';
  s text := 'c2FsdC1mb3ItdGVzdHMtMTIzNA==';
  k text := 'scrypt-16384-8-1-64';
  t1 text := repeat('1', 64); t2 text := repeat('2', 64); t3 text := repeat('3', 64);
begin
  -- access: nothing for anon / authenticated
  if has_schema_privilege('anon', 'admin_private', 'USAGE')
     or has_schema_privilege('authenticated', 'admin_private', 'USAGE') then raise exception 'private schema exposed'; end if;
  if has_table_privilege('anon', 'admin_private.credential', 'SELECT')
     or has_table_privilege('authenticated', 'admin_private.reset_tokens', 'SELECT') then raise exception 'table exposed'; end if;
  if has_function_privilege('anon', 'public.admin_credential()', 'EXECUTE')
     or has_function_privilege('authenticated', 'public.admin_credential()', 'EXECUTE')
     or has_function_privilege('anon', 'public.admin_redeem_password_reset(text,text,text,text,text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.admin_request_password_reset(text,text,integer)', 'EXECUTE')
     or has_function_privilege('anon', 'public.admin_reset_token_status(text)', 'EXECUTE')
     or has_function_privilege('anon', 'public.admin_credential_version()', 'EXECUTE') then raise exception 'function exposed'; end if;
  if not has_function_privilege('service_role', 'public.admin_redeem_password_reset(text,text,text,text,text)', 'EXECUTE') then raise exception 'service_role cannot redeem'; end if;
  if not (select relrowsecurity from pg_class where oid = 'admin_private.credential'::regclass)
     or not (select relrowsecurity from pg_class where oid = 'admin_private.reset_tokens'::regclass) then raise exception 'RLS missing'; end if;

  -- empty store
  if public.admin_credential_version() <> 0 then raise exception 'version should start at 0'; end if;
  if exists (select 1 from public.admin_credential()) then raise exception 'credential should be empty'; end if;

  -- malformed tokens
  if public.admin_reset_token_status('nope') <> 'invalid' then raise exception 'malformed status'; end if;
  if public.admin_reset_token_status(repeat('f', 64)) <> 'invalid' then raise exception 'unknown status'; end if;
  if public.admin_redeem_password_reset('nope', h, s, k, net) <> 'invalid' then raise exception 'malformed redeem'; end if;
  if public.admin_redeem_password_reset(repeat('f', 64), h, s, k, net) <> 'invalid' then raise exception 'unknown redeem'; end if;
  if public.admin_credential_version() <> 0 then raise exception 'failed redeem changed credential'; end if;

  -- issue, then a newer link retires the older one
  if public.admin_request_password_reset(t1, net) <> 'created' then raise exception 'issue 1'; end if;
  if public.admin_reset_token_status(t1) <> 'ok' then raise exception 'status 1'; end if;
  if public.admin_request_password_reset(t2, net) <> 'created' then raise exception 'issue 2'; end if;
  if public.admin_reset_token_status(t1) <> 'used' then raise exception 'older link not retired'; end if;

  -- expiry
  update admin_private.reset_tokens set expires_at = now() - interval '1 second' where token_hash = t2;
  if public.admin_reset_token_status(t2) <> 'expired' then raise exception 'expired status'; end if;
  if public.admin_redeem_password_reset(t2, h, s, k, net) <> 'expired' then raise exception 'expired redeem'; end if;
  if public.admin_credential_version() <> 0 then raise exception 'expired redeem changed credential'; end if;

  -- success: token consumed and password written together, version bumped
  if public.admin_request_password_reset(t3, net) <> 'created' then raise exception 'issue 3'; end if;
  if public.admin_redeem_password_reset(t3, h, s, k, net) <> 'ok' then raise exception 'redeem ok'; end if;
  if public.admin_credential_version() <> 1 then raise exception 'version not bumped'; end if;
  if (select c.password_hash from public.admin_credential() c) <> h then raise exception 'hash not stored'; end if;
  if (select used_at from admin_private.reset_tokens where token_hash = t3) is null then raise exception 'token not consumed'; end if;
  -- replay
  if public.admin_redeem_password_reset(t3, h, s, k, net) <> 'used' then raise exception 'replay accepted'; end if;
  if public.admin_credential_version() <> 1 then raise exception 'replay bumped version'; end if;

  -- request rate limit: 3 an hour per network (3 already used above)
  if public.admin_request_password_reset(repeat('4', 64), net) <> 'limited' then raise exception 'network request cap missed'; end if;
  if exists (select 1 from admin_private.reset_tokens where token_hash = repeat('4', 64)) then raise exception 'limited request stored a token'; end if;
  -- another network still works until the global cap of 6
  if public.admin_request_password_reset(repeat('5', 64), net2) <> 'created' then raise exception 'second network blocked'; end if;
  if public.admin_request_password_reset(repeat('6', 64), net2) <> 'created' then raise exception 'second network blocked 2'; end if;
  if public.admin_request_password_reset(repeat('7', 64), net2) <> 'created' then raise exception 'second network blocked 3'; end if;
  if public.admin_request_password_reset(repeat('8', 64), repeat('c', 64)) <> 'limited' then raise exception 'global request cap missed'; end if;

  -- a second successful reset bumps the version again and retires other links
  if public.admin_redeem_password_reset(repeat('7', 64), h, s, k, net2) <> 'ok' then raise exception 'second reset'; end if;
  if public.admin_credential_version() <> 2 then raise exception 'second bump'; end if;
  if (select count(*) from admin_private.credential) <> 1 then raise exception 'credential not singleton'; end if;
  if exists (select 1 from admin_private.reset_tokens where used_at is null) then raise exception 'unused link survived a reset'; end if;

  -- redeem attempt limit: 10 per network per 15 minutes
  delete from admin_private.counters where key like 'reset-redeem:%';
  for n in 1..10 loop
    r := public.admin_redeem_password_reset(repeat('f', 64), h, s, k, repeat('d', 64));
    if r <> 'invalid' then raise exception 'attempt % should be invalid, got %', n, r; end if;
  end loop;
  if public.admin_redeem_password_reset(repeat('f', 64), h, s, k, repeat('d', 64)) <> 'limited' then raise exception 'redeem cap missed'; end if;

  -- rejected inputs never store anything
  begin
    perform public.admin_redeem_password_reset(t1, 'plaintext password', s, k, net);
    raise exception 'bad hash accepted';
  exception when others then
    if sqlerrm = 'bad hash accepted' then raise; end if;
  end;
  begin
    perform public.admin_request_password_reset('not-a-hash', net);
    raise exception 'bad token hash accepted';
  exception when others then
    if sqlerrm = 'bad token hash accepted' then raise; end if;
  end;
  raise notice 'admin credential store: all checks passed';
end $$;
rollback;
