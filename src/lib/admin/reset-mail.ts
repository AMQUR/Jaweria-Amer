import { getSiteUrl } from "@/lib/site-url";

function buildResetUrl(token: string): string {
  const base = getSiteUrl();
  const u = new URL("/admin/reset-password", base);
  u.searchParams.set("token", token);
  return u.toString();
}

export async function sendAdminPasswordResetEmail(to: string, token: string): Promise<{ ok: boolean; devLogged?: boolean }> {
  const resetUrl = buildResetUrl(token);
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[admin password reset] RESEND_API_KEY not set. Reset link (dev only):\n", resetUrl);
      return { ok: true, devLogged: true };
    }
    console.error("[admin password reset] RESEND_API_KEY is required in production to send reset emails.");
    return { ok: false };
  }

  const from = process.env.RESEND_FROM?.trim() ?? "Jaweria Amer Admin <onboarding@resend.dev>";
  const subject = "Reset your admin password";
  const html = `
    <p>You requested a password reset for the admin portal.</p>
    <p><a href="${resetUrl}">Set a new password</a></p>
    <p>This link expires in 20 minutes and works once.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("[admin password reset] Resend error:", res.status, text);
    return { ok: false };
  }

  return { ok: true };
}
