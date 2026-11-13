-- Contact phone / WhatsApp number for website enquiries.
--
-- Additive and backward compatible:
--   * `phone` is NULLABLE. The 150+ historical enquiries keep phone = NULL; nothing is
--     invented or back-filled, and no NOT NULL is placed on historical rows.
--   * Every NEW enquiry must carry a phone: the new `submit_registration_interest_v2`
--     rejects a missing or malformed number inside the same transaction as the insert.
--   * Existing functions (`submit_registration_interest`, `list_registration_interest`,
--     `list_registration_interest_page`, `claim_registration_notifications`) are left
--     untouched, so the deployed application keeps working until the new build ships and
--     there is no overload ambiguity. The v2 functions add the phone column.
--   * The 180-day retention rule, rate limits, duplicate protection and the
--     service_role-only execute grants are carried over unchanged.

alter table registration_private.leads
  add column if not exists phone text;

-- Normalised E.164: "+", a non-zero country digit, 7-14 more digits (8-15 digits in total).
alter table registration_private.leads
  drop constraint if exists leads_phone_format;
alter table registration_private.leads
  add constraint leads_phone_format
  check (phone is null or phone ~ '^\+[1-9][0-9]{7,14}$');

create or replace function public.submit_registration_interest_v2(
  student_name text,
  student_email text,
  student_phone text,
  syllabus text,
  network_hash text,
  request_id uuid,
  batch_letter text default null,
  destination_name text default null,
  routing_status text default 'received'
)
returns text
language plpgsql
set search_path = ''
as $function$
declare ip_key text; day_key text;
begin
  if student_name is null or length(student_name) not between 1 and 80
     or student_email is null or length(student_email) not between 3 and 254
     or student_phone is null or student_phone !~ '^\+[1-9][0-9]{7,14}$'
     or network_hash is null or network_hash !~ '^[a-f0-9]{64}$'
     or request_id is null
     or (batch_letter is not null and batch_letter not in ('A', 'B', 'C'))
     or routing_status not in ('received', 'pending_account', 'needs_review', 'pending_resolution', 'not_applicable')
     or (destination_name is not null and length(destination_name) not between 1 and 160)
  then
    raise exception 'invalid registration';
  end if;
  perform pg_advisory_xact_lock(73110827);
  delete from registration_private.counters where expires_at < now();
  delete from registration_private.leads where created_at < now() - interval '180 days';
  if exists (
    select 1 from registration_private.leads as existing_lead
    where existing_lead.id = request_id
      and existing_lead.name = student_name
      and existing_lead.email = student_email
      and existing_lead.course = syllabus
      and existing_lead.batch_letter is not distinct from submit_registration_interest_v2.batch_letter
      and existing_lead.phone is not distinct from student_phone
  ) then
    update registration_private.leads
       set destination_name = submit_registration_interest_v2.destination_name,
           routing_status = submit_registration_interest_v2.routing_status
     where id = request_id;
    return 'saved';
  end if;
  if exists (
    select 1 from registration_private.leads
    where id = request_id or (email = student_email and created_at > now() - interval '24 hours')
  ) then
    return 'limited';
  end if;
  ip_key := 'ip:' || network_hash || ':' || to_char(now() at time zone 'UTC', 'YYYYMMDDHH24');
  day_key := 'day:' || to_char(now() at time zone 'UTC', 'YYYYMMDD');
  if coalesce((select attempts from registration_private.counters where key = ip_key), 0) >= 5
     or coalesce((select attempts from registration_private.counters where key = day_key), 0) >= 50
  then
    return 'limited';
  end if;
  insert into registration_private.leads (id, name, email, phone, course, batch_letter, destination_name, routing_status)
  values (request_id, student_name, student_email, student_phone, syllabus, batch_letter, destination_name, routing_status);
  insert into registration_private.counters (key, attempts, expires_at)
  values (ip_key, 1, now() + interval '2 hours'), (day_key, 1, now() + interval '2 days')
  on conflict (key) do update set attempts = registration_private.counters.attempts + 1;
  return 'saved';
end; $function$;

create or replace function public.list_registration_interest_v2()
returns table(
  id uuid, name text, email text, phone text, course text, created_at timestamptz,
  batch_letter text, destination_name text, routing_status text
)
language plpgsql
set search_path = ''
as $function$
begin
  delete from registration_private.leads where leads.created_at < now() - interval '180 days';
  return query
    select l.id, l.name, l.email, l.phone, l.course, l.created_at,
           l.batch_letter, l.destination_name, l.routing_status
    from registration_private.leads l
    order by l.created_at desc
    limit 200;
end; $function$;

create or replace function public.list_registration_interest_page_v2(
  page_size integer default 500,
  before_created_at timestamptz default null,
  before_id uuid default null
)
returns table(
  id uuid, name text, email text, phone text, course text, created_at timestamptz,
  batch_letter text, destination_name text, routing_status text
)
language sql stable
set search_path = ''
as $function$
  select l.id, l.name, l.email, l.phone, l.course, l.created_at,
         l.batch_letter, l.destination_name, l.routing_status
    from registration_private.leads l
   where before_created_at is null
      or (l.created_at, l.id) < (before_created_at, before_id)
   order by l.created_at desc, l.id desc
   limit least(greatest(coalesce(page_size, 500), 1), 1000);
$function$;

create or replace function public.claim_registration_notifications_v2(
  max_rows integer default 10,
  lease_seconds integer default 120
)
returns table(
  id uuid, name text, email text, phone text, course text, created_at timestamptz,
  batch_letter text, notify_attempts integer
)
language plpgsql
set search_path = ''
as $function$
begin
  return query
  with due as (
    select l.id from registration_private.leads l
    where l.notify_status in ('pending', 'failed', 'sending')
      and l.notify_next_at <= now()
      and (l.notify_claimed_until is null or l.notify_claimed_until < now())
    order by l.created_at asc
    limit least(greatest(max_rows, 1), 50)
    for update skip locked
  )
  update registration_private.leads l
     set notify_status = 'sending',
         notify_attempts = l.notify_attempts + 1,
         notify_claimed_until = now() + make_interval(secs => lease_seconds)
    from due
   where l.id = due.id
  returning l.id, l.name, l.email, l.phone, l.course, l.created_at, l.batch_letter, l.notify_attempts;
end; $function$;

-- Same exposure as the v1 functions: callable by the server's service role only.
revoke all on function public.submit_registration_interest_v2(text, text, text, text, text, uuid, text, text, text) from public, anon, authenticated;
revoke all on function public.list_registration_interest_v2() from public, anon, authenticated;
revoke all on function public.list_registration_interest_page_v2(integer, timestamptz, uuid) from public, anon, authenticated;
revoke all on function public.claim_registration_notifications_v2(integer, integer) from public, anon, authenticated;
grant execute on function public.submit_registration_interest_v2(text, text, text, text, text, uuid, text, text, text) to service_role;
grant execute on function public.list_registration_interest_v2() to service_role;
grant execute on function public.list_registration_interest_page_v2(integer, timestamptz, uuid) to service_role;
grant execute on function public.claim_registration_notifications_v2(integer, integer) to service_role;
