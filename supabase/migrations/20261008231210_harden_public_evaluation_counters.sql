-- Harden allocation order; all quota checks precede counter creation.
create or replace function public.reserve_public_evaluation(email_hash text, session_hash text, ip_hash text, lifetime_limit integer)
returns text language plpgsql security invoker set search_path = '' as $$
declare
  t timestamptz := now();
  hour_key text := 'ip:' || ip_hash || ':' || to_char(t at time zone 'UTC', 'YYYYMMDDHH24');
  day_key text := 'day:' || to_char(t at time zone 'UTC', 'YYYYMMDD');
  email_key text := 'email:' || email_hash;
  browser_key text := 'browser:' || session_hash;
begin
  if email_hash !~ '^[0-9a-f]{64}$' or session_hash !~ '^[0-9a-f]{64}$' or ip_hash !~ '^[0-9a-f]{64}$' or lifetime_limit not in (1,2) then
    raise exception 'invalid evaluation identity';
  end if;
  -- One lock protects all quota checks from races, across server instances.
  perform pg_catalog.pg_advisory_xact_lock(73110826);
  delete from evaluation_private.counters where expires_at < t;
  if exists(select 1 from evaluation_private.counters where key in (email_key,browser_key) and attempts >= lifetime_limit) then return 'limit'; end if;
  if exists(select 1 from evaluation_private.counters where key in (email_key,browser_key) and attempts > 0 and last_attempt > t - interval '5 minutes') then return 'cooldown'; end if;
  if exists(select 1 from evaluation_private.counters where (key = hour_key and attempts >= 5) or (key = day_key and attempts >= 50)) then return 'busy'; end if;
  -- Rejected attempts must not allocate permanent identity rows.
  insert into evaluation_private.counters(key, expires_at) values
    (email_key, null), (browser_key, null), (hour_key, t + interval '2 hours'), (day_key, t + interval '2 days')
    on conflict (key) do nothing;
  update evaluation_private.counters set attempts = attempts + 1, last_attempt = t where key in (email_key,browser_key,hour_key,day_key);
  return 'allowed';
end;
$$;
revoke all on function public.reserve_public_evaluation(text,text,text,integer) from public, anon, authenticated;
grant execute on function public.reserve_public_evaluation(text,text,text,integer) to service_role;
