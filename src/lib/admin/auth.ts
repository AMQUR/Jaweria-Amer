import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAdminPassword } from "./password-store";
import { ADMIN_SESSION_COOKIE } from "./constants";
import {
  generateAdminSessionToken,
  getAdminSessionCookieOptions,
  getExpiredAdminSessionCookieOptions,
  verifyAdminSessionToken,
} from "./session";

export function normalizeAdminEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (!adminEmail || normalizeAdminEmail(email) !== normalizeAdminEmail(adminEmail)) {
    return { success: false, error: "Invalid credentials" };
  }

  if (!(await verifyAdminPassword(password))) {
    return { success: false, error: "Invalid credentials" };
  }

  const token = generateAdminSessionToken(email);
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
    const authenticated = verifyAdminSessionToken(token);
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
