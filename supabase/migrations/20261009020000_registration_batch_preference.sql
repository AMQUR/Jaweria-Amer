-- Store the batch preference with an enquiry. This does not create an LMS account.
alter table registration_private.leads
  add column batch_letter text check (batch_letter is null or batch_letter in ('A', 'B', 'C')),
  add column destination_name text check (destination_name is null or char_length(destination_name) between 1 and 160),
  add column routing_status text not null default 'received'
    check (routing_status in ('received', 'pending_account', 'needs_review', 'pending_resolution', 'not_applicable'));

drop function public.submit_registration_interest(text, text, text, text, uuid);
create function public.submit_registration_interest(
  student_name text,
  student_email text,
  syllabus text,
  network_hash text,
  request_id uuid,
  batch_letter text default null,
  destination_name text default null,
  routing_status text default 'received'
) returns text
language plpgsql security invoker set search_path = '' as $$
declare ip_key text; day_key text;
begin
  if student_name is null or length(student_name) not between 1 and 80
     or student_email is null or length(student_email) not between 3 and 254
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
      and existing_lead.batch_letter is not distinct from submit_registration_interest.batch_letter
  ) then
    update registration_private.leads
       set destination_name = submit_registration_interest.destination_name,
           routing_status = submit_registration_interest.routing_status
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
  insert into registration_private.leads (id, name, email, course, batch_letter, destination_name, routing_status)
  values (request_id, student_name, student_email, syllabus, batch_letter, destination_name, routing_status);
  insert into registration_private.counters (key, attempts, expires_at)
  values (ip_key, 1, now() + interval '2 hours'), (day_key, 1, now() + interval '2 days')
  on conflict (key) do update set attempts = registration_private.counters.attempts + 1;
  return 'saved';
end; $$;
revoke all on function public.submit_registration_interest(text, text, text, text, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.submit_registration_interest(text, text, text, text, uuid, text, text, text) to service_role;

drop function public.list_registration_interest();
create function public.list_registration_interest()
returns table(
  id uuid,
  name text,
  email text,
  course text,
  created_at timestamptz,
  batch_letter text,
  destination_name text,
  routing_status text
)
language plpgsql security invoker set search_path = '' as $$
begin
  delete from registration_private.leads where leads.created_at < now() - interval '180 days';
  return query
    select l.id, l.name, l.email, l.course, l.created_at, l.batch_letter, l.destination_name, l.routing_status
    from registration_private.leads l
    order by l.created_at desc
    limit 200;
end; $$;
revoke all on function public.list_registration_interest() from public, anon, authenticated;
grant execute on function public.list_registration_interest() to service_role;

create function public.update_registration_routing(lead_id uuid, next_destination text, next_status text)
returns text
language plpgsql security invoker set search_path = '' as $$
begin
  if lead_id is null
     or next_status not in ('received', 'pending_account', 'needs_review', 'pending_resolution', 'not_applicable')
     or (next_destination is not null and length(next_destination) not between 1 and 160)
  then
    raise exception 'invalid registration';
  end if;
  update registration_private.leads
     set destination_name = next_destination,
         routing_status = next_status
   where id = lead_id;
  if not found then return 'missing'; end if;
  return 'updated';
end; $$;
revoke all on function public.update_registration_routing(uuid, text, text) from public, anon, authenticated;
grant execute on function public.update_registration_routing(uuid, text, text) to service_role;
