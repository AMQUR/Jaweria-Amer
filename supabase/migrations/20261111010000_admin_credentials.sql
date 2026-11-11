-- Durable admin credential and password-reset store for the marketing site.
--
-- Why: the previous store wrote JSON files next to the app. Vercel's filesystem
-- is read-only, so a password reset could never complete in production.
--
-- Shape: a private schema that the API does not expose. The only way in is the
-- security-invoker functions below, executable by service_role alone (the
-- website server). anon and authenticated have no access to the schema, the
-- tables or the functions. Only hashes are stored: a scrypt password hash and
-- SHA-256 hashes of reset tokens. No plaintext password or usable token ever
-- reaches the database.
--
-- Not applied automatically. See docs/admin-password-reset.md for the deployment
-- order and the rollback statement.

create schema if not exists admin_private;
revoke all on schema admin_private from public, anon, authenticated;
grant usage on schema admin_private to service_role;

-- At most one row. No row means "no reset has ever completed": the site then
-- accepts the ADMIN_PASSWORD environment value. Once a row exists it is the
-- only accepted password.
create table admin_private.credential (
  singleton boolean primary key default true check (singleton),
  password_hash text not null check (password_hash ~ '^[A-Za-z0-9+/]{40,200}={0,2}$'),
  password_salt text not null check (password_salt ~ '^[A-Za-z0-9+/]{16,100}={0,2}$'),
  kdf text not null check (kdf in ('scrypt-16384-8-1-64')),
  version integer not null check (version >= 1),
  updated_at timestamptz not null default now()
);

create table admin_private.reset_tokens (
  token_hash text primary key check (token_hash ~ '^[a-f0-9]{64}$'),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz
);

create table admin_private.counters (
  key text primary key,
  attempts integer not null default 0 check (attempts >= 0),
  expires_at timestamptz not null
);

alter table admin_private.credential enable row level security;
alter table admin_private.reset_tokens enable row level security;
alter table admin_private.counters enable row level security;
revoke all on admin_private.credential, admin_private.reset_tokens, admin_private.counters
  from public, anon, authenticated;
grant select, insert, update, delete
  on admin_private.credential, admin_private.reset_tokens, admin_private.counters
  to service_role;

-- 0 until the first completed reset, then 1, 2, … Sessions carry the version
-- they were issued under; a session from an older version is rejected.
create function public.admin_credential_version()
returns integer
language sql stable security invoker set search_path = '' as $$
  select coalesce((select c.version from admin_private.credential c), 0);
$$;

create function public.admin_credential()
returns table(password_hash text, password_salt text, kdf text, version integer)
language sql stable security invoker set search_path = '' as $$
  select c.password_hash, c.password_salt, c.kdf, c.version
    from admin_private.credential c;
$$;

-- Issue a reset token. Returns 'created' or 'limited'.
-- Limits: 3 requests an hour per network, 6 an hour in total.
-- Issuing a new link retires every earlier unused link.
create function public.admin_request_password_reset(
  new_token_hash text,
  network_hash text,
  ttl_seconds integer default 1200
) returns text
language plpgsql security invoker set search_path = '' as $$
declare
  hour_key text := to_char(now() at time zone 'UTC', 'YYYYMMDDHH24');
  net_key text;
  all_key text;
begin
  if new_token_hash is null or new_token_hash !~ '^[a-f0-9]{64}$'
     or network_hash is null or network_hash !~ '^[a-f0-9]{64}$'
     or ttl_seconds is null or ttl_seconds not between 60 and 3600
  then
    raise exception 'invalid reset request';
  end if;
  perform pg_advisory_xact_lock(73110901);
  delete from admin_private.counters where expires_at < now();
  delete from admin_private.reset_tokens where expires_at < now() - interval '1 day';
  net_key := 'reset-request:net:' || network_hash || ':' || hour_key;
  all_key := 'reset-request:all:' || hour_key;
  if coalesce((select attempts from admin_private.counters where key = net_key), 0) >= 3
     or coalesce((select attempts from admin_private.counters where key = all_key), 0) >= 6
  then
    return 'limited';
  end if;
  insert into admin_private.counters (key, attempts, expires_at)
  values (net_key, 1, now() + interval '2 hours'), (all_key, 1, now() + interval '2 hours')
  on conflict (key) do update set attempts = admin_private.counters.attempts + 1;
  update admin_private.reset_tokens set used_at = now() where used_at is null;
  insert into admin_private.reset_tokens (token_hash, expires_at)
  values (new_token_hash, now() + make_interval(secs => ttl_seconds));
  return 'created';
end; $$;

-- Read-only status for the reset page: 'ok' | 'expired' | 'used' | 'invalid'.
create function public.admin_reset_token_status(candidate_hash text)
returns text
language plpgsql stable security invoker set search_path = '' as $$
declare t admin_private.reset_tokens%rowtype;
begin
  if candidate_hash is null or candidate_hash !~ '^[a-f0-9]{64}$' then
    return 'invalid';
  end if;
  select * into t from admin_private.reset_tokens where token_hash = candidate_hash;
  if not found then return 'invalid'; end if;
  if t.used_at is not null then return 'used'; end if;
  if t.expires_at <= now() then return 'expired'; end if;
  return 'ok';
end; $$;

-- Redeem a token and set the new password in ONE transaction.
-- Returns 'ok' | 'expired' | 'used' | 'invalid' | 'limited'.
--
-- The UPDATE below is the single point of truth: it claims the token only if it
-- is unused and unexpired. Two simultaneous calls contend on the row lock; the
-- loser re-checks `used_at is null`, matches nothing, and returns 'used'. The
-- password row is written only by the winner, in the same transaction, so a
-- token can never be consumed without the password changing, or the password
-- change without the token being consumed. Every other outstanding token is
-- retired, and the version bump invalidates every existing session.
-- Limit: 10 attempts per network per 15 minutes, counted before the check.
create function public.admin_redeem_password_reset(
  candidate_hash text,
  new_password_hash text,
  new_password_salt text,
  new_kdf text,
  network_hash text
) returns text
language plpgsql security invoker set search_path = '' as $$
declare
  window_key text := to_char(now() at time zone 'UTC', 'YYYYMMDDHH24')
    || lpad((extract(minute from now() at time zone 'UTC')::integer / 15)::text, 2, '0');
  net_key text;
  claimed text;
begin
  if network_hash is null or network_hash !~ '^[a-f0-9]{64}$'
     or new_password_hash is null or new_password_hash !~ '^[A-Za-z0-9+/]{40,200}={0,2}$'
     or new_password_salt is null or new_password_salt !~ '^[A-Za-z0-9+/]{16,100}={0,2}$'
     or new_kdf is null or new_kdf <> 'scrypt-16384-8-1-64'
  then
    raise exception 'invalid reset redemption';
  end if;
  if candidate_hash is null or candidate_hash !~ '^[a-f0-9]{64}$' then
    return 'invalid';
  end if;
  net_key := 'reset-redeem:net:' || network_hash || ':' || window_key;
  insert into admin_private.counters as c (key, attempts, expires_at)
  values (net_key, 1, now() + interval '30 minutes')
  on conflict (key) do update set attempts = c.attempts + 1;
  if (select attempts from admin_private.counters where key = net_key) > 10 then
    return 'limited';
  end if;

  update admin_private.reset_tokens t
     set used_at = now()
   where t.token_hash = candidate_hash
     and t.used_at is null
     and t.expires_at > now()
  returning t.token_hash into claimed;
  if claimed is null then
    return public.admin_reset_token_status(candidate_hash);
  end if;

  insert into admin_private.credential as c (singleton, password_hash, password_salt, kdf, version)
  values (true, new_password_hash, new_password_salt, new_kdf, 1)
  on conflict (singleton) do update
     set password_hash = excluded.password_hash,
         password_salt = excluded.password_salt,
         kdf = excluded.kdf,
         version = c.version + 1,
         updated_at = now();
  update admin_private.reset_tokens set used_at = now() where used_at is null;
  return 'ok';
end; $$;

revoke all on function public.admin_credential_version() from public, anon, authenticated;
revoke all on function public.admin_credential() from public, anon, authenticated;
revoke all on function public.admin_request_password_reset(text, text, integer) from public, anon, authenticated;
revoke all on function public.admin_reset_token_status(text) from public, anon, authenticated;
revoke all on function public.admin_redeem_password_reset(text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.admin_credential_version() to service_role;
grant execute on function public.admin_credential() to service_role;
grant execute on function public.admin_request_password_reset(text, text, integer) to service_role;
grant execute on function public.admin_reset_token_status(text) to service_role;
grant execute on function public.admin_redeem_password_reset(text, text, text, text, text) to service_role;
