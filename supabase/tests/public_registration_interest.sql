begin;
do $$
declare result text; n integer;
begin
 if has_function_privilege('anon','public.submit_registration_interest(text,text,text,text,uuid)','EXECUTE') or has_function_privilege('authenticated','public.list_registration_interest()','EXECUTE') then raise exception 'public RPC access'; end if;
 if has_schema_privilege('anon','registration_private','USAGE') or has_table_privilege('authenticated','registration_private.leads','SELECT') then raise exception 'private data access'; end if;
 if not (select relrowsecurity from pg_class where oid='registration_private.leads'::regclass) then raise exception 'RLS missing'; end if;
 result := public.submit_registration_interest('Phase 2 database test','phase2-db@example.invalid','O Level English Language 1123',repeat('b',64),'44444444-4444-4444-8444-444444444444');
 if result <> 'saved' then raise exception 'first rejected'; end if;
 result := public.submit_registration_interest('Phase 2 database test','phase2-db@example.invalid','O Level English Language 1123',repeat('b',64),'44444444-4444-4444-8444-444444444444');
 if result <> 'saved' then raise exception 'retry not idempotent'; end if;
 result := public.submit_registration_interest('Phase 2 database test','phase2-db@example.invalid','O Level English Language 1123',repeat('b',64),'55555555-5555-4555-8555-555555555555');
 if result <> 'limited' then raise exception 'email duplicate accepted'; end if;
 for n in 1..4 loop
 result := public.submit_registration_interest('Phase 2 rate test','phase2-rate-' || n || '@example.invalid','O Level English Language 1123',repeat('b',64),gen_random_uuid());
 if result <> 'saved' then raise exception 'valid network submission rejected'; end if;
 end loop;
 result := public.submit_registration_interest('Phase 2 rate test','phase2-rate-blocked@example.invalid','O Level English Language 1123',repeat('b',64),gen_random_uuid());
 if result <> 'limited' then raise exception 'network cap missed'; end if;
 if exists(select 1 from registration_private.leads where email='phase2-rate-blocked@example.invalid') then raise exception 'rejected lead persisted'; end if;
 update registration_private.counters set attempts=50 where key like 'day:%';
 result := public.submit_registration_interest('Phase 2 global test','phase2-global-blocked@example.invalid','O Level English Language 1123',repeat('c',64),gen_random_uuid());
 if result <> 'limited' then raise exception 'global cap missed'; end if;
 if exists(select 1 from registration_private.counters where key like 'ip:' || repeat('c',64) || ':%') then raise exception 'rejected counter allocated'; end if;
 insert into registration_private.leads values(gen_random_uuid(),'Expired test','phase2-expired@example.invalid','O Level English Language 1123',now()-interval '181 days');
 perform public.list_registration_interest();
 if exists(select 1 from registration_private.leads where email='phase2-expired@example.invalid') then raise exception 'retention missed'; end if;
end; $$;
set local role service_role;
select count(*) from public.list_registration_interest();
reset role;
rollback;
