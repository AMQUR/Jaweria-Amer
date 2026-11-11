import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPassword } from "./password-store";
import { ADMIN_SESSION_COOKIE } from "./constants";
import {
  generateAdminSessionToken,
  getAdminSessionCookieOptions,
  getExpiredAdminSessionCookieOptions,
} from "./session";
import { isAdminSessionCurrent } from "./session-guard";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail || normalizeAdminEmail(email) !== normalizeAdminEmail(adminEmail)) {
    return { success: false, error: "Invalid credentials" };
  }

  let check;
  try {
    check = await verifyAdminPassword(password);
  } catch {
    // The store may hold a newer password than ADMIN_PASSWORD, so an unreadable
    // store must refuse the sign-in rather than fall back to the old value.
    console.error("[admin auth] sign-in refused: credential store unavailable");
    return { success: false, error: "Sign-in is temporarily unavailable. Please try again shortly." };
  }
  if (!check.ok) {
    console.warn("[admin auth] sign-in failed");
    return { success: false, error: "Invalid credentials" };
  }

  const token = generateAdminSessionToken(email, Date.now(), check.version);
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, getAdminSessionCookieOptions());

  return { success: true };
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, "", getExpiredAdminSessionCookieOptions());
}

export async function getSession(): Promise<{ authenticated: boolean }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return { authenticated: false };
    const authenticated = await isAdminSessionCurrent(token);
    if (!authenticated) {
      cookieStore.set(ADMIN_SESSION_COOKIE, "", getExpiredAdminSessionCookieOptions());
    }
    return { authenticated };
  } catch {
    return { authenticated: false };
  }
}

export async function requireAuth(): Promise<void> {
  const session = await getSession();
  if (!session.authenticated) {
    redirect("/admin/login");
  }
}
