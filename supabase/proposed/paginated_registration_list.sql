-- PROPOSED — NOT APPLIED. Needs owner review before it is run.
-- This file is deliberately outside supabase/migrations so no tooling applies it.
--
-- Why: public.list_registration_interest() returns only the newest 200 enquiries
-- and takes no arguments, so the website admin and the Excel export cannot reach
-- older rows. This adds a read-only, keyset-paginated companion. The website
-- already calls it when it exists and falls back to the old function when it
-- does not (src/lib/registration/server.ts, listAllRegistrations).
--
-- What it does not do: it does not alter the table, change the existing
-- functions, widen any grant beyond service_role, or expose the private schema.
-- Unlike the existing list function it performs no retention delete; it only reads.
--
-- To apply after review: move this file into supabase/migrations with a
-- timestamped name and run it through the usual migration process.

create function public.list_registration_interest_page(
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
