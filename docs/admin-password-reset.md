# Admin password reset — design, deployment and rollback

## What was wrong

- Reset tokens were written to `data/password-reset-tokens.json` and a changed password to
  `data/admin-password.json`. Vercel's filesystem is read-only, so requesting a reset returned
  HTTP 500 before any e-mail was sent, and a reset could never be completed.
- The reset action changed the password first and marked the token used afterwards, as two
  separate steps. A crash between them, or two simultaneous submissions, could change the
  password while leaving the link usable.
- A password change did not end existing sessions: a signed session cookie stayed valid for its
  full 24 hours.

## Design

| Concern | Decision |
|---|---|
| Storage | The website's existing Supabase project. Private schema `admin_private`, not exposed to the API. Access only through five `security invoker` functions executable by `service_role`; `anon` and `authenticated` have no access to the schema, tables or functions. RLS is enabled on every table with no policies. |
| What is stored | One scrypt hash + salt (`scrypt-16384-8-1-64`), SHA-256 hashes of reset tokens, and rate-limit counters keyed by a keyed hash of the caller's network address. Never a plaintext password, a usable token, or an IP address. |
| Token | 256 bits from the OS CSPRNG, e-mailed once, valid 20 minutes, single use. A later request does not cancel an earlier link (the form is unauthenticated and the admin address is public, so that would let anyone block recovery). All outstanding links are retired when one is redeemed. |
| Redemption | One database function claims the token (`UPDATE … WHERE used_at IS NULL AND expires_at > now()`) and writes the new hash in the same transaction. Concurrent calls contend on the row lock; exactly one wins and the rest get `used`. There is no check-then-act sequence in the application. |
| Sessions | Each session cookie carries the credential version it was issued under. A reset increments the version. The proxy and `getSession` both reject a session whose version is not current. The version is cached for 30 seconds per server instance; the instance that performs the reset drops its cache at once. |
| `ADMIN_PASSWORD` | Still the password until the first reset completes (no stored row). Once a row exists it is the only accepted password and `ADMIN_PASSWORD` is ignored. |
| Store unreachable | Sign-in is refused and sessions are rejected (a version read in the last 10 minutes is reused). It never falls back to `ADMIN_PASSWORD`, because the store may hold a newer password. |
| Migration not applied | The functions do not exist (PostgREST `PGRST202`). Sign-in works with `ADMIN_PASSWORD` as today; reset requests do nothing and reset attempts say the feature is unavailable. So the code is safe to deploy before the migration. |
| Rate limits | Reset requests: 3 an hour per network, 10 an hour in total (this also caps e-mails to the admin address). Redemption attempts: 10 per network per 15 minutes. Enforced in the database. |
| Account discovery | The request form gives the same reply for every address, and the store call and e-mail run after the response is sent, so timing does not depend on the address. |
| Logging | Outcomes only (`link issued`, `request rate limited`, `redemption refused: used`, `password changed`, `sign-in failed`). No address, token, password or key. |
| E-mail | Unchanged provider and variables (`RESEND_API_KEY`, `RESEND_FROM`). An 8-second timeout was added and the provider's reply body is no longer logged. |

## Existing sessions and accounts

- There is one admin account, defined by `ADMIN_EMAIL`. Nothing about it changes at deployment.
- Sessions issued before this change carry no version and are treated as version 0, which is the
  current version until the first reset. They keep working.
- After a reset, every earlier session is rejected and the person who reset signs in again.

## Deployment order

1. **Deploy the code.** Nothing changes for users: with no migration the site behaves as before,
   except that requesting a reset no longer returns a server error.
2. **Apply `supabase/migrations/20261111010000_admin_credentials.sql`** to the website's Supabase
   project (SQL editor or `supabase db push`). It only creates new objects; it does not touch
   existing tables or data.
3. **Check it** by running `supabase/tests/admin_credentials.sql` in the SQL editor. It runs inside a
   transaction and rolls back; expect the notice `admin credential store: all checks passed`.
4. Confirm `RESEND_API_KEY` and `RESEND_FROM` are set for the environment and the sending domain is
   verified, then request a reset for the admin address and complete it.

Do step 4 deliberately: it changes the live admin password and signs everyone out.

## Rollback

- **Code only:** revert the PR. A password set through a completed reset is then ignored and
  `ADMIN_PASSWORD` works again, so only roll back if that is acceptable, or first set
  `ADMIN_PASSWORD` in Vercel to the value you want.
- **Database:** the statement below removes the store. Any password set by a reset is lost and
  `ADMIN_PASSWORD` becomes the password again.

```sql
drop function if exists public.admin_redeem_password_reset(text, text, text, text, text);
drop function if exists public.admin_reset_token_status(text);
drop function if exists public.admin_request_password_reset(text, text, integer);
drop function if exists public.admin_credential();
drop function if exists public.admin_credential_version();
drop schema if exists admin_private cascade;
```

## Testing

- `npm test` runs `scripts/test-admin-password-reset.ts` against an in-memory double of the store.
- The same script runs against a real local Postgres + PostgREST when `ADMIN_RESET_TEST_URL`,
  `ADMIN_RESET_TEST_KEY` and `ADMIN_RESET_TEST_PSQL` are set. It refuses non-local URLs.
- `supabase/tests/admin_credentials.sql` checks grants, RLS, expiry, replay, rate limits and input
  validation in SQL.

## Known limits (not changed here)

- Someone using many networks could use up the hourly total of reset requests and so delay a
  legitimate request until the next hour (links already issued keep working). If that ever
  happens, the owner can still recover by running the rollback statement's `credential` cleanup
  (`delete from admin_private.credential;`), which makes `ADMIN_PASSWORD` the password again.

- Sign-in itself is not rate limited.
- Admin server actions rely on the proxy for authorisation rather than checking the session
  themselves. The proxy now includes the version check, so they are covered, but a second check
  inside each action would be more robust.
- Admin CMS content (courses, homepage, settings) is still written to local files, which do not
  persist on Vercel. That is a separate problem.
- A session issued before a reset can remain usable for up to 30 seconds on a server instance other
  than the one that handled the reset.
