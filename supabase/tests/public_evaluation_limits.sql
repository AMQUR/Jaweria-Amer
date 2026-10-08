-- Run after the migration. Everything is rolled back, including fixture counters.
begin;
do $test$
declare e text := repeat('a',64); s text := repeat('b',64); ip text := repeat('c',64); r text;
begin
  -- This test is intended for an empty evaluation subsystem before activation.
  if exists(select 1 from evaluation_private.counters) then raise exception 'Run on an empty evaluation subsystem'; end if;
  r := public.reserve_public_evaluation(e,s,ip,1);
  if r <> 'allowed' then raise exception 'first not allowed'; end if;
  r := public.reserve_public_evaluation(e,s,ip,1);
  if r <> 'limit' then raise exception 'lifetime not enforced'; end if;
  delete from evaluation_private.counters;
  r := public.reserve_public_evaluation(e,s,ip,2);
  if r <> 'allowed' then raise exception 'first of two'; end if;
  r := public.reserve_public_evaluation(e,s,ip,2);
  if r <> 'cooldown' then raise exception 'cooldown'; end if;
  update evaluation_private.counters set last_attempt = now() - interval '6 minutes';
  r := public.reserve_public_evaluation(e,s,ip,2);
  if r <> 'allowed' then raise exception 'second not allowed'; end if;
  r := public.reserve_public_evaluation(e,s,ip,2);
  if r <> 'limit' then raise exception 'third not blocked'; end if;
  -- A different browser does not reset the email allowance.
  r := public.reserve_public_evaluation(e,repeat('d',64),ip,2);
  if r <> 'limit' then raise exception 'browser reset bypassed email'; end if;
  r := public.reserve_public_evaluation(repeat('d',64),s,ip,2);
  if r <> 'limit' then raise exception 'email reset bypassed browser'; end if;
  delete from evaluation_private.counters;
  for i in 1..5 loop
    r := public.reserve_public_evaluation(md5('email'||i)||md5('email'||i), md5('session'||i)||md5('session'||i),ip,1);
    if r <> 'allowed' then raise exception 'ip first five'; end if;
  end loop;
  r := public.reserve_public_evaluation(e,s,ip,1);
  if r <> 'busy' then raise exception 'ip cap'; end if;
  delete from evaluation_private.counters;
  insert into evaluation_private.counters (key,attempts) values ('day:'||to_char(now() at time zone 'UTC','YYYYMMDD'),50);
  r := public.reserve_public_evaluation(e,s,ip,1);
  if r <> 'busy' then raise exception 'global cap'; end if;
  if has_function_privilege('anon','public.reserve_public_evaluation(text,text,text,integer)','EXECUTE') then raise exception 'anon executable'; end if;
  if has_function_privilege('authenticated','public.reserve_public_evaluation(text,text,text,integer)','EXECUTE') then raise exception 'authenticated executable'; end if;
  if has_schema_privilege('anon','evaluation_private','USAGE') then raise exception 'anon schema accessible'; end if;
  if not (select relrowsecurity from pg_class where oid='evaluation_private.counters'::regclass) then raise exception 'RLS disabled'; end if;
  delete from evaluation_private.counters;
end $test$;
set local role service_role;
select public.reserve_public_evaluation(repeat('d',64),repeat('e',64),repeat('f',64),1) as service_role_result;
reset role;
rollback;
