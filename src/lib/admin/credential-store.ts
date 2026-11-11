/**
 * Durable admin credential + password-reset store.
 *
 * Backed by the website's own Supabase project through service-role RPCs
 * (supabase/migrations/20261111010000_admin_credentials.sql). The private
 * schema is not exposed to the API; nothing here is reachable by anon or
 * authenticated callers, and nothing is written to the local filesystem
 * (Vercel's is read-only, which is why the old file store could not work).
 *
 * Three states, and what each means for sign-in:
 *  - "ready"          the functions exist. A stored credential, when present,
 *                     is the only accepted password.
 *  - "not_migrated"   Supabase is configured but the migration has not been
 *                     applied. No reset can have completed, so ADMIN_PASSWORD
 *                     is still the password and resets are unavailable.
 *  - "not_configured" no Supabase credentials at all (local development).
 *                     Same behaviour as "not_migrated".
 * Any other failure (timeout, 5xx) throws CredentialStoreError: callers fail
 * closed, because the store may hold a newer password than ADMIN_PASSWORD.
 */

export const PASSWORD_KDF = "scrypt-16384-8-1-64";

export class CredentialStoreError extends Error {
  constructor(message = "credential_store_unavailable") {
    super(message);
    this.name = "CredentialStoreError";
  }
}

export interface StoredCredential {
  hash: string;
  salt: string;
  kdf: string;
  version: number;
}

type RpcResult = { state: "ready"; data: unknown } | { state: "not_migrated" | "not_configured" };

const RPC_TIMEOUT_MS = 4000;

function config() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";
  return url && key ? { url, key } : null;
}

async function rpc(name: string, body: Record<string, unknown>): Promise<RpcResult> {
  const cfg = config();
  if (!cfg) return { state: "not_configured" };
  let response: Response;
  try {
    response = await fetch(`${cfg.url}/rest/v1/rpc/${name}`, {
      method: "POST",
      cache: "no-store",
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(RPC_TIMEOUT_MS),
    });
  } catch {
    throw new CredentialStoreError();
  }
  if (response.status === 404) {
    // PostgREST answers 404 / PGRST202 when the function does not exist.
    const detail: unknown = await response.json().catch(() => null);
    const code =
      detail && typeof detail === "object" && "code" in detail ? String(detail.code) : "";
    if (code === "PGRST202") return { state: "not_migrated" };
    throw new CredentialStoreError();
  }
  if (!response.ok) throw new CredentialStoreError();
  try {
    return { state: "ready", data: await response.json() };
  } catch {
    throw new CredentialStoreError();
  }
}

/* ── credential version (session invalidation) ─────────────────────────── */

const VERSION_TTL_MS = 30_000;
const VERSION_STALE_OK_MS = 10 * 60_000;
let versionCache: { value: number; at: number } | null = null;

/**
 * Current credential version: 0 until the first completed reset, then 1, 2, …
 * Cached for 30 seconds per server instance. If the store cannot be reached, a
 * value read within the last 10 minutes is reused; older than that, this
 * throws and callers reject the session.
 */
export async function getCredentialVersion(options: { fresh?: boolean } = {}): Promise<number> {
  const now = Date.now();
  if (!options.fresh && versionCache && now - versionCache.at < VERSION_TTL_MS)
    return versionCache.value;
  try {
    const result = await rpc("admin_credential_version", {});
    const value =
      result.state === "ready" && Number.isSafeInteger(result.data) && Number(result.data) >= 0
        ? Number(result.data)
        : result.state === "ready"
          ? null
          : 0;
    if (value === null) throw new CredentialStoreError();
    versionCache = { value, at: now };
    return value;
  } catch (error) {
    if (versionCache && now - versionCache.at < VERSION_STALE_OK_MS) return versionCache.value;
    throw error;
  }
}

/** Test hook. */
export function resetCredentialCache() {
  versionCache = null;
}

/* ── credential ────────────────────────────────────────────────────────── */

/** The stored credential, or null when none exists (ADMIN_PASSWORD still applies). */
export async function getStoredCredential(): Promise<StoredCredential | null> {
  const result = await rpc("admin_credential", {});
  if (result.state !== "ready") {
    versionCache = { value: 0, at: Date.now() };
    return null;
  }
  const rows = result.data;
  if (!Array.isArray(rows)) throw new CredentialStoreError();
  if (rows.length === 0) {
    versionCache = { value: 0, at: Date.now() };
    return null;
  }
  const row = rows[0] as Record<string, unknown>;
  if (
    typeof row.password_hash !== "string" ||
    typeof row.password_salt !== "string" ||
    typeof row.kdf !== "string" ||
    !Number.isSafeInteger(row.version)
  )
    throw new CredentialStoreError();
  const version = Number(row.version);
  versionCache = { value: version, at: Date.now() };
  return { hash: row.password_hash, salt: row.password_salt, kdf: row.kdf, version };
}

/* ── reset tokens ──────────────────────────────────────────────────────── */

export type ResetRequestResult = "created" | "limited" | "unavailable";
export type ResetTokenStatus = "ok" | "expired" | "used" | "invalid";
export type ResetRedeemResult = ResetTokenStatus | "limited" | "unavailable";

const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | null =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : null;

export async function requestResetToken(
  tokenHash: string,
  networkHash: string,
): Promise<ResetRequestResult> {
  const result = await rpc("admin_request_password_reset", {
    new_token_hash: tokenHash,
    network_hash: networkHash,
  });
  if (result.state !== "ready") return "unavailable";
  const value = oneOf(result.data, ["created", "limited"] as const);
  if (!value) throw new CredentialStoreError();
  return value;
}

export async function redeemResetToken(
  tokenHash: string,
  passwordHash: string,
  passwordSalt: string,
  networkHash: string,
): Promise<ResetRedeemResult> {
  const result = await rpc("admin_redeem_password_reset", {
    candidate_hash: tokenHash,
    new_password_hash: passwordHash,
    new_password_salt: passwordSalt,
    new_kdf: PASSWORD_KDF,
    network_hash: networkHash,
  });
  if (result.state !== "ready") return "unavailable";
  const value = oneOf(result.data, ["ok", "expired", "used", "invalid", "limited"] as const);
  if (!value) throw new CredentialStoreError();
  // This instance must stop honouring older sessions immediately.
  if (value === "ok") versionCache = null;
  return value;
}
