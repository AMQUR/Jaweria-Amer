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

/** A signed payload carries identity and expiry, never the signing secret. */
export function generateAdminSessionToken(
  email: string,
  now = Date.now(),
): string {
  const payload = Buffer.from(
    JSON.stringify({
      email: email.trim().toLowerCase(),
      issuedAt: now,
      expiresAt: now + ADMIN_SESSION_MAX_AGE * 1000,
    }),
  ).toString("base64url");
  const signature = createHmac("sha256", getSessionSecret())
    .update(`admin:v1:${payload}`)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string,
  now = Date.now(),
): boolean {
  try {
    if (token.length > 1024) return false;
    const [payload, signature, extra] = token.split(".");
    if (
      extra ||
      !/^[a-zA-Z0-9_-]+$/.test(payload ?? "") ||
      !/^[a-f0-9]{64}$/.test(signature ?? "")
    )
      return false;
    const expected = createHmac("sha256", getSessionSecret())
      .update(`admin:v1:${payload}`)
      .digest("hex");
    if (!timingSafeEqual(Buffer.from(expected), Buffer.from(signature)))
      return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    return (
      typeof data.email === "string" &&
      data.email === process.env.ADMIN_EMAIL?.trim().toLowerCase() &&
      Number.isSafeInteger(data.issuedAt) &&
      Number.isSafeInteger(data.expiresAt) &&
      data.issuedAt <= now &&
      data.expiresAt > now &&
      data.expiresAt - data.issuedAt === ADMIN_SESSION_MAX_AGE * 1000
    );
  } catch {
    return false;
  }
}
