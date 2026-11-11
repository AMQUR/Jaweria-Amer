import { getCredentialVersion } from "./credential-store";
import { readAdminSessionVersion } from "./session";

/**
 * Full session check: a valid signature AND issued under the current
 * credential version. After a password reset the version increases, so every
 * session issued before it stops working — on the instance that handled the
 * reset immediately, on others within the 30-second version cache.
 *
 * Fails closed: if the version cannot be established, the session is refused.
 */
export async function isAdminSessionCurrent(token: string, now = Date.now()): Promise<boolean> {
  const issuedUnder = readAdminSessionVersion(token, now);
  if (issuedUnder === null) return false;
  try {
    let current = await getCredentialVersion();
    // A token newer than our cached version means the cache is stale, not that
    // the token is wrong: re-read once before deciding.
    if (issuedUnder > current) current = await getCredentialVersion({ fresh: true });
    return issuedUnder === current;
  } catch {
    console.error("[admin auth] session refused: credential store unavailable");
    return false;
  }
}
