/**
 * Admin password-reset contracts.
 *
 * Always runs against an in-memory double of the store functions. When
 * ADMIN_RESET_TEST_URL / ADMIN_RESET_TEST_KEY point at a LOCAL PostgREST in
 * front of a throwaway Postgres with the migration applied, the same scenarios
 * run again against the real SQL, including truly concurrent redemptions:
 *
 *   ADMIN_RESET_TEST_URL=http://127.0.0.1:55433 ADMIN_RESET_TEST_KEY=… \
 *   ADMIN_RESET_TEST_PSQL="docker exec -i ja-reset-pg psql -U postgres -qtA" \
 *   npx tsx scripts/test-admin-password-reset.ts
 *
 * It refuses any non-local URL so it can never touch a real project.
 */
import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

type Json = Record<string, unknown>;
const realFetch = globalThis.fetch;
const sha = (v: string) => createHash("sha256").update(v, "utf8").digest("hex");

/** In-memory mirror of supabase/migrations/20261111010000_admin_credentials.sql. */
function fakeStore() {
  const state = {
    credential: null as null | { password_hash: string; password_salt: string; kdf: string; version: number },
    tokens: new Map<string, { expires: number; used: boolean }>(),
    counters: new Map<string, number>(),
  };
  const hour = () => new Date().toISOString().slice(0, 13);
  const bump = (key: string) => {
    const n = (state.counters.get(key) ?? 0) + 1;
    state.counters.set(key, n);
    return n;
  };
  const status = (hash: string) => {
    const t = state.tokens.get(hash);
    if (!/^[a-f0-9]{64}$/.test(hash) || !t) return "invalid";
    if (t.used) return "used";
    if (t.expires <= Date.now()) return "expired";
    return "ok";
  };
  const call = (name: string, a: Json): unknown => {
    switch (name) {
      case "admin_credential_version":
        return state.credential?.version ?? 0;
      case "admin_credential":
        return state.credential ? [state.credential] : [];
      case "admin_request_password_reset": {
        const net = `req:${a.network_hash}:${hour()}`, all = `req:all:${hour()}`;
        if ((state.counters.get(net) ?? 0) >= 3 || (state.counters.get(all) ?? 0) >= 10) return "limited";
        bump(net); bump(all);
        state.tokens.set(String(a.new_token_hash), { expires: Date.now() + 1_200_000, used: false });
        return "created";
      }
      case "admin_reset_token_status":
        return status(String(a.candidate_hash));
      case "admin_redeem_password_reset": {
        const hash = String(a.candidate_hash);
        if (!/^[a-f0-9]{64}$/.test(hash)) return "invalid";
        if (bump(`redeem:${a.network_hash}`) > 10) return "limited";
        const s = status(hash);
        if (s !== "ok") return s;
        state.tokens.get(hash)!.used = true;
        state.credential = {
          password_hash: String(a.new_password_hash),
          password_salt: String(a.new_password_salt),
          kdf: String(a.new_kdf),
          version: (state.credential?.version ?? 0) + 1,
        };
        for (const t of state.tokens.values()) t.used = true;
        return "ok";
      }
    }
    return undefined;
  };
  return { state, call };
}

interface Backend {
  label: string;
  url: string;
  key: string;
  storeFetch: (url: string, init?: RequestInit) => Promise<Response>;
  expireToken: (tokenHash: string) => void;
  /** Everything persisted, as one string, to prove no plaintext is stored. */
  dump: () => string;
  realConcurrency: boolean;
}

async function scenarios(b: Backend) {
  const logs: string[] = [];
  const original = { log: console.log, info: console.info, warn: console.warn, error: console.error };
  console.info = console.warn = console.error = (...args: unknown[]) => void logs.push(args.join(" "));

  const mails: { to: string[]; from: string; html: string }[] = [];
  let mailMode: "ok" | "reject" | "unreachable" = "ok";
  let storeMode: "up" | "down" | "missing" = "up";
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.startsWith("https://api.resend.com/")) {
      if (mailMode === "unreachable") throw new TypeError("network down");
      if (mailMode === "reject") return Response.json({ message: "domain not verified" }, { status: 403 });
      mails.push(JSON.parse(String(init?.body)));
      return Response.json({ id: "email_test" });
    }
    if (storeMode === "down") throw new TypeError("store unreachable");
    if (storeMode === "missing") return Response.json({ code: "PGRST202" }, { status: 404 });
    return b.storeFetch(url, init);
  }) as typeof fetch;

  const env = { ...process.env };
  Object.assign(process.env, {
    SUPABASE_URL: b.url,
    SUPABASE_SERVICE_ROLE_KEY: b.key,
    SESSION_SECRET: "test-only-session-secret-at-least-32-characters",
    ADMIN_EMAIL: "admin@example.invalid",
    ADMIN_PASSWORD: "original-env-password",
    RESEND_API_KEY: "re_test_key_never_logged",
    RESEND_FROM: "Jaweria Amer <notifications@example.invalid>",
    NEXT_PUBLIC_SITE_URL: "https://site.example.invalid",
  });
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;

  try {
    const { verifyAdminPassword } = await import("../src/lib/admin/password-store");
    const { issueAdminPasswordReset, completeAdminPasswordReset } = await import("../src/lib/admin/password-reset");
    const { generateAdminSessionToken, verifyAdminSessionToken } = await import("../src/lib/admin/session");
    const { isAdminSessionCurrent } = await import("../src/lib/admin/session-guard");
    const { resetCredentialCache, CredentialStoreError } = await import("../src/lib/admin/credential-store");
    const { hashNetwork, hashResetToken } = await import("../src/lib/admin/reset-tokens");
    resetCredentialCache();
    const net = (n: number) => hashNetwork(`203.0.113.${n}`);
    const lastToken = () => {
      const m = mails.at(-1)!.html.match(/token=([a-f0-9]{64})/);
      assert(m, "reset e-mail must carry a 64-hex token link");
      return m[1];
    };
    const secrets: string[] = ["original-env-password", "re_test_key_never_logged", "admin@example.invalid"];

    // 1. Before any reset: ADMIN_PASSWORD works, sessions are version 0.
    assert.deepEqual(await verifyAdminPassword("original-env-password"), { ok: true, version: 0 });
    assert.equal((await verifyAdminPassword("wrong")).ok, false);
    const now = Date.now();
    const sessionV0 = generateAdminSessionToken("admin@example.invalid", now, 0);
    assert(await isAdminSessionCurrent(sessionV0));
    // A token minted before this change (no version field) is still honoured.
    const legacyPayload = Buffer.from(
      JSON.stringify({ email: "admin@example.invalid", issuedAt: now, expiresAt: now + 86_400_000 }),
    ).toString("base64url");
    const { createHmac } = await import("node:crypto");
    const legacy = `${legacyPayload}.${createHmac("sha256", process.env.SESSION_SECRET!).update(`admin:v1:${legacyPayload}`).digest("hex")}`;
    assert(verifyAdminSessionToken(legacy, now + 1));
    assert(await isAdminSessionCurrent(legacy, now + 1), "pre-existing sessions survive deployment");

    // 2. E-mail provider failures: nothing is revealed, nothing breaks, no password changes.
    mailMode = "reject";
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(1)), "issued_email_failed");
    mailMode = "unreachable";
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(2)), "issued_email_failed");
    mailMode = "ok";
    assert.equal(mails.length, 0);
    assert.deepEqual(await verifyAdminPassword("original-env-password"), { ok: true, version: 0 });

    // 3. A link is issued and e-mailed to the admin address only.
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(3)), "sent");
    assert.deepEqual(mails[0].to, ["admin@example.invalid"]);
    assert.equal(mails[0].from, "Jaweria Amer <notifications@example.invalid>");
    assert(mails[0].html.includes("https://site.example.invalid/admin/reset-password?token="));
    const tokenA = lastToken();
    secrets.push(tokenA);

    // 4. Malformed and unknown tokens.
    for (const bad of ["", "abc", "g".repeat(64), `${tokenA}0`, "../../etc/passwd", "f".repeat(64)])
      assert.equal(await completeAdminPasswordReset(bad, "new-password-1", net(4)), "invalid");
    assert.deepEqual(await verifyAdminPassword("original-env-password"), { ok: true, version: 0 });

    // 5. Expired link.
    b.expireToken(hashResetToken(tokenA));
    assert.equal(await completeAdminPasswordReset(tokenA, "new-password-1", net(4)), "expired");
    assert.deepEqual(await verifyAdminPassword("original-env-password"), { ok: true, version: 0 });

    // 6. Simultaneous submissions of one link: exactly one wins, and only its password is set.
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(5)), "sent");
    const tokenB = lastToken();
    secrets.push(tokenB);
    const candidates = Array.from({ length: 8 }, (_, i) => `concurrent-password-${i}-Zx9`);
    secrets.push(...candidates);
    const results = await Promise.all(
      candidates.map((pw, i) => completeAdminPasswordReset(tokenB, pw, net(20 + i))),
    );
    assert.equal(results.filter((r) => r === "ok").length, 1, `one winner, got ${results.join(",")}`);
    assert.equal(results.filter((r) => r === "used").length, 7);
    const winner = candidates[results.indexOf("ok")];
    for (const pw of candidates)
      assert.equal((await verifyAdminPassword(pw)).ok, pw === winner, "only the winning password is stored");
    assert.equal((await verifyAdminPassword(winner)).version, 1);

    // 7. Replay of a used link.
    assert.equal(await completeAdminPasswordReset(tokenB, "replay-password-99", net(6)), "used");
    assert.equal((await verifyAdminPassword(winner)).ok, true);

    // 8. After a completed reset: the old ADMIN_PASSWORD no longer works …
    assert.equal((await verifyAdminPassword("original-env-password")).ok, false);
    // … and every earlier session is invalid, while a new one is valid.
    resetCredentialCache();
    assert(!(await isAdminSessionCurrent(sessionV0)), "pre-reset session must be rejected");
    assert(!(await isAdminSessionCurrent(legacy, now + 1)), "legacy session must be rejected");
    const sessionV1 = generateAdminSessionToken("admin@example.invalid", Date.now(), 1);
    assert(await isAdminSessionCurrent(sessionV1));
    // The signature alone is still valid: it is the version check that rejects it.
    assert(verifyAdminSessionToken(sessionV0));

    // 9. A second reset: version 2, previous password and sessions rejected.
    //    A later request (which anyone can make) must not cancel an earlier valid link;
    //    links are retired only when one of them is actually redeemed.
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(7)), "sent");
    const tokenC = lastToken();
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(8)), "sent");
    const tokenD = lastToken();
    secrets.push(tokenC, tokenD, "second-password-Qw7!");
    assert.equal(await completeAdminPasswordReset(tokenC, "second-password-Qw7!", net(9)), "ok", "an earlier link survives a later request");
    assert.equal(await completeAdminPasswordReset(tokenD, "x-password-000", net(9)), "used", "a completed reset retires the other outstanding links");
    assert.deepEqual(await verifyAdminPassword("second-password-Qw7!"), { ok: true, version: 2 });
    assert.equal((await verifyAdminPassword(winner)).ok, false);
    // A stale cache holding version 1 must not accept the v1 session for long, and must accept v2 at once.
    const sessionV2 = generateAdminSessionToken("admin@example.invalid", Date.now(), 2);
    assert(await isAdminSessionCurrent(sessionV2), "newer token forces a re-read");
    assert(!(await isAdminSessionCurrent(sessionV1)));

    // 10. Request rate limit, 3 an hour per network: no token, no e-mail once exceeded.
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(10)), "sent");
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(10)), "sent");
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(10)), "sent");
    secrets.push(lastToken());
    const mailCount = mails.length;
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(10)), "limited");
    assert.equal(mails.length, mailCount);

    // 11. Nothing persisted is a plaintext password or a usable token.
    const persisted = b.dump();
    for (const secret of [winner, "second-password-Qw7!", tokenA, tokenB, tokenC, tokenD])
      assert(!persisted.includes(secret), "plaintext secret found in the store");
    assert(persisted.includes(sha(tokenD)), "tokens are stored as SHA-256 hashes");

    // 12. Store unreachable: sign-in is refused (never a silent fall back to ADMIN_PASSWORD).
    storeMode = "down";
    await assert.rejects(verifyAdminPassword("original-env-password"), CredentialStoreError);
    assert.equal(await completeAdminPasswordReset(tokenD, "whatever-123", net(11)), "store_error");
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(11)), "store_error");
    assert(await isAdminSessionCurrent(sessionV2), "a recently read version is reused during a short outage");
    resetCredentialCache();
    assert(!(await isAdminSessionCurrent(sessionV2)), "with nothing cached, sessions are refused");
    storeMode = "up";

    // 13. Logs never contain a password, token, address or key.
    const logText = logs.join("\n");
    assert(logs.length > 5);
    for (const secret of secrets) assert(!logText.includes(secret), "secret leaked into logs");

    // 14. Migration not applied yet: ADMIN_PASSWORD still works, resets are unavailable.
    storeMode = "missing";
    resetCredentialCache();
    assert.deepEqual(await verifyAdminPassword("original-env-password"), { ok: true, version: 0 });
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(12)), "unavailable");
    assert.equal(await completeAdminPasswordReset(tokenD, "whatever-123", net(12)), "unavailable");
    assert(await isAdminSessionCurrent(generateAdminSessionToken("admin@example.invalid", Date.now(), 0)));
    storeMode = "up";

    // 15. Supabase not configured at all (local development): same as not migrated.
    delete process.env.SUPABASE_URL;
    resetCredentialCache();
    assert.deepEqual(await verifyAdminPassword("original-env-password"), { ok: true, version: 0 });
    assert.equal(await issueAdminPasswordReset("admin@example.invalid", net(13)), "unavailable");
  } finally {
    Object.assign(console, original);
    globalThis.fetch = realFetch;
    process.env = env;
  }
  console.log(`Admin password reset contracts passed (${b.label}${b.realConcurrency ? ", real concurrent transactions" : ""}).`);
}

async function main() {
  const fake = fakeStore();
  await scenarios({
    label: "in-memory store double",
    url: "https://store.example.invalid",
    key: "fake-service-key",
    realConcurrency: false,
    storeFetch: async (url, init) => {
      const name = url.split("/rpc/")[1];
      const value = fake.call(name, JSON.parse(String(init?.body ?? "{}")));
      return value === undefined
        ? Response.json({ code: "PGRST202" }, { status: 404 })
        : Response.json(value);
    },
    expireToken: (hash) => {
      const t = fake.state.tokens.get(hash);
      if (t) t.expires = Date.now() - 1000;
    },
    dump: () => JSON.stringify([fake.state.credential, [...fake.state.tokens.keys()]]),
  });

  const url = process.env.ADMIN_RESET_TEST_URL?.trim();
  const key = process.env.ADMIN_RESET_TEST_KEY?.trim();
  const psql = process.env.ADMIN_RESET_TEST_PSQL?.trim();
  if (!url || !key || !psql) {
    console.log("Real-database run skipped (set ADMIN_RESET_TEST_URL / _KEY / _PSQL to a local throwaway stack).");
    return;
  }
  const host = new URL(url).hostname;
  assert(["127.0.0.1", "localhost", "::1"].includes(host), "refusing to run against a non-local database");
  const sql = (statement: string) => execSync(psql, { input: statement, encoding: "utf8" }).trim();
  sql("truncate admin_private.credential, admin_private.reset_tokens, admin_private.counters;");
  await scenarios({
    label: "real Postgres + PostgREST",
    url,
    key,
    realConcurrency: true,
    storeFetch: (u, init) => realFetch(u, init),
    expireToken: (hash) => {
      assert(/^[a-f0-9]{64}$/.test(hash));
      sql(`update admin_private.reset_tokens set expires_at = now() - interval '1 second' where token_hash = '${hash}';`);
    },
    dump: () =>
      sql("select coalesce(json_agg(c)::text,'') from admin_private.credential c;") +
      sql("select coalesce(json_agg(t)::text,'') from admin_private.reset_tokens t;"),
  });
  sql("truncate admin_private.credential, admin_private.reset_tokens, admin_private.counters;");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
