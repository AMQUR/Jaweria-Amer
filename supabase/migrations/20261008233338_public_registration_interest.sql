-- First-party interest only. No LMS accounts, and no anonymous database access.
create schema if not exists registration_private;
revoke all on schema registration_private from public, anon, authenticated;
grant usage on schema registration_private to service_role;
create table registration_private.leads (
  id uuid primary key,
  name text not null check (length(name) between 1 and 80),
  email text not null check (length(email) between 3 and 254),
  course text not null check (course in ('O Level English Language 1123', 'IGCSE English as a First Language 0500', 'IGCSE English as a Second Language 0510/0511', 'AS Level English Language 9093')),
  created_at timestamptz not null default now()
);
create index registration_leads_email_created on registration_private.leads (email, created_at);
create index registration_leads_created on registration_private.leads (created_at);
create table registration_private.counters (
  key text primary key, attempts integer not null default 0 check (attempts >= 0), expires_at timestamptz not null
);
alter table registration_private.leads enable row level security;
alter table registration_private.counters enable row level security;
revoke all on registration_private.leads, registration_private.counters from public, anon, authenticated;
grant select, insert, update, delete on registration_private.leads, registration_private.counters to service_role;
create function public.submit_registration_interest(student_name text, student_email text, syllabus text, network_hash text, request_id uuid)
returns text language plpgsql security invoker set search_path = '' as $$
declare ip_key text; day_key text;
begin
  if student_name is null or length(student_name) not between 1 and 80 or student_email is null or length(student_email) not between 3 and 254 or network_hash is null or network_hash !~ '^[a-f0-9]{64}$' or request_id is null then raise exception 'invalid registration'; end if;
  perform pg_advisory_xact_lock(73110827);
  delete from registration_private.counters where expires_at < now();
  delete from registration_private.leads where created_at < now() - interval '180 days';
  if exists (select 1 from registration_private.leads where id=request_id and name=student_name and email=student_email and course=syllabus) then return 'saved'; end if;
  if exists (select 1 from registration_private.leads where id=request_id or (email=student_email and created_at > now()-interval '24 hours')) then return 'limited'; end if;
  ip_key := 'ip:' || network_hash || ':' || to_char(now() at time zone 'UTC', 'YYYYMMDDHH24');
  day_key := 'day:' || to_char(now() at time zone 'UTC', 'YYYYMMDD');
  if coalesce((select attempts from registration_private.counters where key=ip_key),0) >= 5 or coalesce((select attempts from registration_private.counters where key=day_key),0) >= 50 then return 'limited'; end if;
  insert into registration_private.leads(id,name,email,course) values(request_id,student_name,student_email,syllabus);
  insert into registration_private.counters(key,attempts,expires_at) values(ip_key,1,now()+interval '2 hours'),(day_key,1,now()+interval '2 days') on conflict(key) do update set attempts=registration_private.counters.attempts+1;
  return 'saved';
end; $$;
revoke all on function public.submit_registration_interest(text,text,text,text,uuid) from public, anon, authenticated;
grant execute on function public.submit_registration_interest(text,text,text,text,uuid) to service_role;
create function public.list_registration_interest()
returns table(id uuid,name text,email text,course text,created_at timestamptz)
language plpgsql security invoker set search_path = '' as $$
begin
  delete from registration_private.leads where leads.created_at < now()-interval '180 days';
  return query select l.id,l.name,l.email,l.course,l.created_at from registration_private.leads l order by l.created_at desc limit 200;
end; $$;
revoke all on function public.list_registration_interest() from public, anon, authenticated;
grant execute on function public.list_registration_interest() to service_role;
