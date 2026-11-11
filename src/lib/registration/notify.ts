import "server-only";
import { contact } from "@/lib/contact";
import {
  fetchWithCap,
  listAllRegistrations,
  type RegistrationLead,
} from "./server";
import { enquiriesToXlsx, enquiryFilename, formatPkt } from "./export";
import type { RegistrationInput } from "./contracts";

/**
 * Teacher notification for a durably saved enquiry.
 *
 * - Runs after the visitor's response, so it can never fail or slow a save.
 * - One e-mail per enquiry: the request id (the signed ticket nonce the save is
 *   keyed on) is sent as the provider's Idempotency-Key, so a visitor retry or
 *   one of our own retries cannot produce a second message. A small in-process
 *   set also short-circuits repeats on a warm instance.
 * - Bounded retries on network errors, 429 and 5xx only. A 4xx is a
 *   configuration problem and is not retried.
 * - Logs carry status codes, the provider's message id and the enquiry's
 *   request id (a random UUID, which is also the row id in the admin inbox) —
 *   never a name or an address. A failed notice can therefore be traced to
 *   the exact enquiry from the logs.
 *
 * What this is not: a durable outbox. `after()` and the in-process set do not
 * survive a crashed or recycled function instance, so a notice whose retries
 * all fail is not re-sent automatically. Two things bound the damage: the
 * enquiry itself is always in the admin inbox, and every later notice lists
 * the previous enquiries and attaches the full current sheet, so a missed
 * notice surfaces with the next one that arrives.
 */
export const notifyBudget = {
  attempts: 3,
  attemptMs: 6_000,
  backoffMs: [600, 1_800],
  /** Skip the attachment rather than the notice if the sheet is unexpectedly large. */
  maxAttachmentBytes: 4 * 1024 * 1024,
};

export type NotifyOutcome =
  | "sent"
  | "duplicate"
  | "not_configured"
  | "invalid_recipient"
  | "rejected"
  | "failed";

const RESEND_URL = "https://api.resend.com/emails";
const EMAIL = /^[^\s@<>,;]+@[^\s@<>,;]+\.[^\s@<>,;]+$/;
const recentlyNotified = new Set<string>();
const RECENT_LIMIT = 500;

function esc(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function oneLine(value: string) {
  return value.replace(/[\r\n\t]+/g, " ").trim();
}

function remember(requestId: string) {
  recentlyNotified.add(requestId);
  if (recentlyNotified.size > RECENT_LIMIT) {
    const oldest = recentlyNotified.values().next().value;
    if (oldest !== undefined) recentlyNotified.delete(oldest);
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function notificationConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const to = process.env.REGISTRATION_NOTIFY_EMAIL?.trim() || contact.email;
  const from =
    process.env.RESEND_FROM?.trim() ||
    "Jaweria Amer Website <onboarding@resend.dev>";
  return { apiKey, to, from };
}

const RECAP_COUNT = 5;

async function loadReport(requestId: string, createdAt: Date) {
  try {
    const { leads, complete } = await listAllRegistrations();
    const sheet = enquiriesToXlsx(leads, { complete });
    const attachments =
      sheet.length > notifyBudget.maxAttachmentBytes
        ? []
        : [
            {
              filename: enquiryFilename(createdAt, complete),
              content: sheet.toString("base64"),
            },
          ];
    const earlier = [...leads]
      .filter((lead) => lead.id !== requestId)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, RECAP_COUNT);
    return { attachments, earlier, complete, total: leads.length };
  } catch {
    // The single-enquiry notice still goes out if the report cannot be built.
    return { attachments: [], earlier: [] as RegistrationLead[], complete: true, total: null };
  }
}

function recapHtml(earlier: RegistrationLead[]) {
  if (!earlier.length) return "";
  return (
    `<p><b>Previous enquiries</b> (in case an earlier notice did not reach you):</p><ul>` +
    earlier
      .map(
        (lead) =>
          `<li>${esc(lead.name)} — ${esc(lead.course)} — ${esc(formatPkt(lead.created_at))}</li>`,
      )
      .join("") +
    `</ul>`
  );
}

export async function notifyTeacherOfEnquiry(
  input: Pick<RegistrationInput, "name" | "email" | "course" | "batch">,
  requestId: string,
  createdAt = new Date(),
): Promise<NotifyOutcome> {
  if (recentlyNotified.has(requestId)) return "duplicate";
  const { apiKey, to, from } = notificationConfig();
  if (!apiKey) {
    console.error("[registration] notify skipped: RESEND_API_KEY missing");
    return "not_configured";
  }
  if (!EMAIL.test(to)) {
    console.error("[registration] notify skipped: recipient is not a valid address");
    return "invalid_recipient";
  }
  // Claim before the first await so two overlapping calls cannot both send.
  remember(requestId);

  const { attachments, earlier, complete, total } = await loadReport(
    requestId,
    createdAt,
  );
  const body = JSON.stringify({
    from,
    to: [to],
    reply_to: input.email,
    subject: `New enquiry: ${oneLine(input.name)} — ${oneLine(input.course)}`,
    html:
      `<p>A new enquiry came in through the website.</p>` +
      `<ul>` +
      `<li><b>Name:</b> ${esc(input.name)}</li>` +
      `<li><b>Email:</b> ${esc(input.email)}</li>` +
      `<li><b>Course:</b> ${esc(input.course)}</li>` +
      `<li><b>Batch preference:</b> ${input.batch ? `Batch ${esc(input.batch)}` : "n/a"}</li>` +
      `<li><b>Submitted:</b> ${esc(formatPkt(createdAt.toISOString()))}</li>` +
      `</ul>` +
      recapHtml(earlier) +
      (attachments.length
        ? `<p>The updated sheet${total === null ? "" : ` (${total} enquiries)`} is attached. The same sheet can be downloaded at any time from the website admin, under Registrations.</p>`
        : `<p>The sheet can be downloaded from the website admin, under Registrations.</p>`) +
      (complete
        ? ""
        : `<p><b>Note:</b> the sheet currently holds only the most recent 200 enquiries. Older ones are in earlier notification emails.</p>`) +
      `<p>This is an enquiry, not a confirmed enrollment or payment.</p>`,
    attachments,
  });

  for (let attempt = 1; attempt <= notifyBudget.attempts; attempt++) {
    let status = 0;
    try {
      const response = await fetchWithCap(
        RESEND_URL,
        {
          method: "POST",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `enquiry-${requestId}`,
          },
          body,
        },
        notifyBudget.attemptMs,
      );
      status = response.status;
      if (response.ok) {
        const reply: unknown = await response.json().catch(() => null);
        const messageId =
          reply && typeof reply === "object" && "id" in reply
            ? String(reply.id).slice(0, 64)
            : "unknown";
        // Accepted by the provider. Delivery to the inbox is reported by Resend, not here.
        console.info("[registration] notify accepted", requestId, messageId);
        return "sent";
      }
    } catch {
      status = 0; // network error or timeout: retryable
    }
    const retryable = status === 0 || status === 429 || status >= 500;
    if (!retryable) {
      // Sender not verified, bad key, bad recipient… fix configuration; do not retry.
      console.error("[registration] notify rejected", requestId, status);
      recentlyNotified.delete(requestId);
      return "rejected";
    }
    if (attempt < notifyBudget.attempts)
      await wait(notifyBudget.backoffMs[attempt - 1] ?? 2_000);
    else
      console.error("[registration] notify failed after retries", requestId, status);
  }
  // Let a later retry of the same enquiry try again; the provider key still dedupes.
  recentlyNotified.delete(requestId);
  return "failed";
}

/** Test hook: forget in-process dedupe state. */
export function resetNotifyState() {
  recentlyNotified.clear();
}
