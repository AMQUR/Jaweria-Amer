-- Durable teacher notifications for website enquiries. Additive and backward compatible:
-- existing columns, RPC signatures and the 200-row admin list are untouched.

alter table registration_private.leads
  add column if not exists notify_status text not null default 'historical'
    check (notify_status in ('historical', 'pending', 'sending', 'sent', 'failed', 'dead')),
  add column if not exists notify_attempts integer not null default 0,
  add column if not exists notify_next_at timestamptz not null default now(),
  add column if not exists notify_claimed_until timestamptz,
  add column if not exists notify_last_error text check (notify_last_error is null or char_length(notify_last_error) <= 300),
  add column if not exists notify_provider_id text,
  add column if not exists notify_sent_at timestamptz;

-- Rows that exist now are covered by the one consolidated historical workbook, not 141 emails.
-- New enquiries start as 'pending'.
alter table registration_private.leads alter column notify_status set default 'pending';

create index if not exists leads_notify_due_idx
  on registration_private.leads (notify_next_at)
  where notify_status in ('pending', 'failed', 'sending');

create table if not exists registration_private.enquiry_exports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('historical', 'update')),
  enquiry_count integer not null check (enquiry_count >= 0),
  provider text not null default 'resend',
  provider_id text,
  provider_accepted boolean not null,
  detail text check (detail is null or char_length(detail) <= 300),
  created_at timestamptz not null default now()
);
alter table registration_private.enquiry_exports enable row level security;
revoke all on registration_private.enquiry_exports from public, anon, authenticated;

-- Keyset-paginated read of every retained enquiry (newest first). Promoted from supabase/proposed.
create or replace function public.list_registration_interest_page(
  page_size integer default 500,
  before_created_at timestamptz default null,
  before_id uuid default null
)
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
language sql stable security invoker set search_path = '' as $$
  select l.id, l.name, l.email, l.course, l.created_at,
         l.batch_letter, l.destination_name, l.routing_status
    from registration_private.leads l
   where before_created_at is null
      or (l.created_at, l.id) < (before_created_at, before_id)
   order by l.created_at desc, l.id desc
   limit least(greatest(coalesce(page_size, 500), 1), 1000);
$$;

revoke all on function public.list_registration_interest_page(integer, timestamptz, uuid)
  from public, anon, authenticated;
grant execute on function public.list_registration_interest_page(integer, timestamptz, uuid)
  to service_role;

-- Lease due notifications. skip locked + lease makes concurrent runs safe; one lease per lead.
create or replace function public.claim_registration_notifications(max_rows integer default 10, lease_seconds integer default 120)
returns table(
  id uuid, name text, email text, course text, created_at timestamptz,
  batch_letter text, notify_attempts integer
)
language plpgsql security invoker set search_path = '' as $$
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
  returning l.id, l.name, l.email, l.course, l.created_at, l.batch_letter, l.notify_attempts;
end; $$;
revoke all on function public.claim_registration_notifications(integer, integer) from public, anon, authenticated;
grant execute on function public.claim_registration_notifications(integer, integer) to service_role;

-- Record the provider outcome. Transient failures back off (5m, 10m, 20m ... capped at 6h);
-- after 8 attempts the lead becomes 'dead' and is surfaced for administrative attention.
create or replace function public.finish_registration_notifications(lead_ids uuid[], accepted boolean, provider_id text default null, failure text default null)
returns integer
language plpgsql security invoker set search_path = '' as $$
declare n integer;
begin
  if accepted then
    update registration_private.leads
       set notify_status = 'sent', notify_provider_id = provider_id, notify_sent_at = now(),
           notify_claimed_until = null, notify_last_error = null
     where id = any(lead_ids) and notify_status = 'sending';
  else
    update registration_private.leads
       set notify_status = case when notify_attempts >= 8 then 'dead' else 'failed' end,
           notify_next_at = now() + make_interval(mins => least(5 * power(2, greatest(notify_attempts - 1, 0))::integer, 360)),
           notify_claimed_until = null,
           notify_last_error = left(coalesce(failure, 'unknown'), 300)
     where id = any(lead_ids) and notify_status = 'sending';
  end if;
  get diagnostics n = row_count;
  return n;
end; $$;
revoke all on function public.finish_registration_notifications(uuid[], boolean, text, text) from public, anon, authenticated;
grant execute on function public.finish_registration_notifications(uuid[], boolean, text, text) to service_role;

create or replace function public.registration_notification_health()
returns table(pending integer, failed integer, dead integer, sent integer, last_sent_at timestamptz, last_error text)
language sql security invoker set search_path = '' as $$
  select
    count(*) filter (where notify_status in ('pending', 'sending'))::integer,
    count(*) filter (where notify_status = 'failed')::integer,
    count(*) filter (where notify_status = 'dead')::integer,
    count(*) filter (where notify_status = 'sent')::integer,
    max(notify_sent_at),
    (select l2.notify_last_error from registration_private.leads l2
      where l2.notify_last_error is not null order by l2.created_at desc limit 1)
  from registration_private.leads;
$$;
revoke all on function public.registration_notification_health() from public, anon, authenticated;
grant execute on function public.registration_notification_health() to service_role;

create or replace function public.log_enquiry_export(export_kind text, export_count integer, accepted boolean, export_provider_id text default null, export_detail text default null)
returns text
language plpgsql security invoker set search_path = '' as $$
begin
  insert into registration_private.enquiry_exports (kind, enquiry_count, provider_accepted, provider_id, detail)
  values (export_kind, export_count, accepted, export_provider_id, left(export_detail, 300));
  return 'logged';
end; $$;
revoke all on function public.log_enquiry_export(text, integer, boolean, text, text) from public, anon, authenticated;
grant execute on function public.log_enquiry_export(text, integer, boolean, text, text) to service_role;

create or replace function public.historical_export_done()
returns boolean
language sql security invoker set search_path = '' as $$
  select exists (select 1 from registration_private.enquiry_exports where kind = 'historical' and provider_accepted);
$$;
revoke all on function public.historical_export_done() from public, anon, authenticated;
grant execute on function public.historical_export_done() to service_role;
