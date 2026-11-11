import { redeemResetToken, requestResetToken, type ResetRedeemResult } from "./credential-store";
import { hashAdminPassword } from "./password-store";
import { sendAdminPasswordResetEmail } from "./reset-mail";
import { generateResetToken, hashResetToken, RESET_TOKEN_PATTERN } from "./reset-tokens";

export type ResetIssueOutcome =
  | "sent"
  | "issued_email_failed"
  | "limited"
  | "unavailable"
  | "store_error";

/**
 * Issues a reset link and e-mails it to the admin address. Never throws and
 * never reveals anything to the requester: the caller returns the same reply
 * whatever happens here. Logs name the outcome only — no address, no token.
 */
export async function issueAdminPasswordReset(
  adminEmail: string,
  networkHash: string,
): Promise<ResetIssueOutcome> {
  try {
    const token = generateResetToken();
    const issued = await requestResetToken(hashResetToken(token), networkHash);
    if (issued === "limited") {
      console.warn("[admin password reset] request rate limited");
      return "limited";
    }
    if (issued === "unavailable") {
      console.error(
        "[admin password reset] reset store is not available (Supabase not configured or migration not applied)",
      );
      return "unavailable";
    }
    const mail = await sendAdminPasswordResetEmail(adminEmail, token);
    if (!mail.ok) {
      console.error("[admin password reset] link issued but the e-mail was not sent");
      return "issued_email_failed";
    }
    console.info("[admin password reset] link issued");
    return "sent";
  } catch {
    console.error("[admin password reset] request failed: credential store unavailable");
    return "store_error";
  }
}

/**
 * Redeems a reset token and sets the new password in one atomic store call.
 * There is no separate "check, then update, then mark used" sequence to race:
 * the database function claims the token and writes the hash together.
 */
export async function completeAdminPasswordReset(
  token: string,
  newPassword: string,
  networkHash: string,
): Promise<ResetRedeemResult | "store_error"> {
  if (!RESET_TOKEN_PATTERN.test(token)) return "invalid";
  try {
    const { hash, salt } = await hashAdminPassword(newPassword);
    const result = await redeemResetToken(hashResetToken(token), hash, salt, networkHash);
    if (result === "ok")
      console.info("[admin password reset] password changed; earlier sessions are no longer valid");
    else console.warn("[admin password reset] redemption refused:", result);
    return result;
  } catch {
    console.error("[admin password reset] redemption failed: credential store unavailable");
    return "store_error";
  }
}
