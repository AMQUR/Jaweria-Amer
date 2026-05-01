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
    set: (name: string, value: string, options: ReturnType<typeof getExpiredAdminSessionCookieOptions>) => unknown;
  };
}) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", getExpiredAdminSessionCookieOptions());
}

function encodeBase64(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function decodeBase64(value: string): string {
  const binary = atob(value);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function generateAdminSessionToken(email: string): string {
  const secret = getSessionSecret();
  const payload = `${email}:${Date.now()}:${secret}`;
  return encodeBase64(payload);
}

export function verifyAdminSessionToken(token: string): boolean {
  try {
    const decoded = decodeBase64(token);
    const secret = getSessionSecret();
    return decoded.endsWith(`:${secret}`);
  } catch {
    return false;
  }
}
