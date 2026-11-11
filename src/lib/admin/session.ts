import { createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_SESSION_COOKIE } from "./constants";
import { getSessionSecret } from "@/lib/session-secret";

export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

export function getAdminSessionCookieOptions(maxAge = ADMIN_SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getExpiredAdminSessionCookieOptions() {
  return getAdminSessionCookieOptions(0);
}

export function clearAdminSessionCookie(response: {
  cookies: {
    set: (
      name: string,
      value: string,
      options: ReturnType<typeof getExpiredAdminSessionCookieOptions>,
    ) => unknown;
  };
}) {
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    "",
    getExpiredAdminSessionCookieOptions(),
  );
}

/**
 * A signed payload carries identity, expiry and the credential version it was
 * issued under — never the signing secret. A password reset bumps the version,
 * which invalidates every earlier session (see session-guard.ts).
 */
export function generateAdminSessionToken(
  email: string,
  now = Date.now(),
  credentialVersion = 0,
): string {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      issuedAt: now,
      expiresAt: now + ADMIN_SESSION_MAX_AGE * 1000,
      cv: credentialVersion,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(`admin:v1:${payload}`)
    .digest("hex");
  return `${payload}.${signature}`;
}

/** Signature, identity and expiry only. Use isAdminSessionCurrent for the full check. */
export function verifyAdminSessionToken(
  token: string,
  now = Date.now(),
): boolean {
  return readAdminSessionVersion(token, now) !== null;
}

/**
 * The credential version a valid token was issued under, or null when the
 * token is not valid. Tokens issued before versions existed carry none and
 * count as version 0, so sessions that were live at deployment keep working
 * until the first password reset.
 */
export function readAdminSessionVersion(
  token: string,
  now = Date.now(),
): number | null {
  try {
    if (token.length > 1024) return null;
    const [payload, signature, extra] = token.split(".");
    if (
      extra ||
      !/^[a-zA-Z0-9_-]+$/.test(payload ?? "") ||
      !/^[a-f0-9]{64}$/.test(signature ?? "")
    )
      return null;
    const expected = createHmac("sha256", getSessionSecret())
      .update(`admin:v1:${payload}`)
      .digest("hex");
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    const version = data.cv === undefined ? 0 : data.cv;
    const valid =
      Number.isSafeInteger(version) &&
      version >= 0 &&
      typeof data.email === "string" &&
      data.email === process.env.ADMIN_EMAIL?.trim().toLowerCase() &&
      Number.isSafeInteger(data.issuedAt) &&
      Number.isSafeInteger(data.expiresAt) &&
      data.issuedAt <= now &&
      data.expiresAt > now &&
      data.expiresAt - data.issuedAt === ADMIN_SESSION_MAX_AGE * 1000;
    return valid ? version : null;
  } catch {
    return null;
  }
}
