import "server-only";
import { contact } from "@/lib/contact";
import {
  fetchWithCap,
  listAllRegistrations,
  registrationRpc,
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
  const to =
    process.env.REGISTRATION_NOTIFY_EMAIL?.trim() ||
    process.env.REGISTRATION_NOTIFICATION_EMAIL?.trim() ||
    contact.email;
  // The Resend sandbox sender cannot deliver to the teacher, so it is never a default.
  const from = (process.env.RESEND_FROM || process.env.RESEND_FROM_EMAIL || "").trim();
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

/** Phone is absent for enquiries saved before phone numbers were collected. */
export type NoticeInput = Pick<
  RegistrationInput,
  "name" | "email" | "course" | "batch"
> & { phone?: string | null };

export interface NoticeResult {
  outcome: NotifyOutcome;
  /** Provider message id when the provider accepted the request. Acceptance is not inbox delivery. */
  messageId: string | null;
}

async function sendEnquiryNotice(
  input: NoticeInput,
  requestId: string,
  createdAt: Date,
): Promise<NoticeResult> {
  if (recentlyNotified.has(requestId)) return { outcome: "duplicate", messageId: null };
  const { apiKey, to, from } = notificationConfig();
  if (!apiKey) {
    console.error("[registration] notify skipped: RESEND_API_KEY missing");
    return { outcome: "not_configured", messageId: null };
  }
  if (!from || /@resend\.dev/i.test(from)) {
    console.error("[registration] notify skipped: verified RESEND_FROM sender missing");
    return { outcome: "not_configured", messageId: null };
  }
  if (!EMAIL.test(to)) {
    console.error("[registration] notify skipped: recipient is not a valid address");
    return { outcome: "invalid_recipient", messageId: null };
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
      `<li><b>Phone / WhatsApp:</b> ${input.phone ? esc(input.phone) : "Not provided"}</li>` +
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
        return { outcome: "sent", messageId };
      }
    } catch {
      status = 0; // network error or timeout: retryable
    }
    const retryable = status === 0 || status === 429 || status >= 500;
    if (!retryable) {
      // Sender not verified, bad key, bad recipient… fix configuration; do not retry.
      console.error("[registration] notify rejected", requestId, status);
      recentlyNotified.delete(requestId);
      return { outcome: "rejected", messageId: null };
    }
    if (attempt < notifyBudget.attempts)
      await wait(notifyBudget.backoffMs[attempt - 1] ?? 2_000);
    else
      console.error("[registration] notify failed after retries", requestId, status);
  }
  // Let a later retry of the same enquiry try again; the provider key still dedupes.
  recentlyNotified.delete(requestId);
  return { outcome: "failed", messageId: null };
}

/** Send the notice for one enquiry (compat wrapper; see processEnquiryNotifications for the durable path). */
export async function notifyTeacherOfEnquiry(
  input: NoticeInput,
  requestId: string,
  createdAt = new Date(),
): Promise<NotifyOutcome> {
  return (await sendEnquiryNotice(input, requestId, createdAt)).outcome;
}

interface ClaimedLead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  course: string;
  created_at: string;
  batch_letter: string | null;
  notify_attempts: number;
}

export interface NotifyRunResult {
  claimed: number;
  sent: number;
  failed: number;
}

/**
 * Durable delivery. Each saved enquiry has a notify_status row in Supabase
 * (pending -> sending -> sent, or failed -> retried with back-off -> dead after 8 attempts).
 * This leases due rows (skip-locked, 2 minute lease, so overlapping runs and crashed
 * instances are safe), sends one notice per enquiry with the enquiry id as the provider
 * Idempotency-Key, and records the provider outcome. Called right after a save and by the
 * 10-minute cron. Never throws: a notice failure can never affect a saved enquiry.
 */
export async function processEnquiryNotifications(max = 10): Promise<NotifyRunResult> {
  const result: NotifyRunResult = { claimed: 0, sent: 0, failed: 0 };
  let claimed: ClaimedLead[] = [];
  try {
    const rows: unknown = await registrationRpc(
      "claim_registration_notifications_v2",
      { max_rows: max, lease_seconds: 120 },
      10_000,
      512 * 1024,
    );
    claimed = Array.isArray(rows) ? (rows as ClaimedLead[]) : [];
  } catch {
    console.error("[registration] notify claim failed");
    return result;
  }
  result.claimed = claimed.length;
  for (const lead of claimed) {
    let accepted = false;
    let messageId: string | null = null;
    let failure: string | null = null;
    try {
      const sent = await sendEnquiryNotice(
        {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          course: lead.course as RegistrationInput["course"],
          batch: (lead.batch_letter ?? undefined) as RegistrationInput["batch"],
        },
        lead.id,
        new Date(lead.created_at),
      );
      accepted = sent.outcome === "sent" || sent.outcome === "duplicate";
      messageId = sent.messageId;
      failure = accepted ? null : sent.outcome;
    } catch {
      failure = "exception";
    }
    try {
      await registrationRpc("finish_registration_notifications", {
        lead_ids: [lead.id],
        accepted,
        provider_id: messageId,
        failure,
      });
    } catch {
      // Lease expiry re-queues it; the provider idempotency key prevents a second email.
      console.error("[registration] notify outcome not recorded", lead.id);
    }
    if (accepted) result.sent += 1;
    else result.failed += 1;
  }
  return result;
}

/** Test hook: forget in-process dedupe state. */
export function resetNotifyState() {
  recentlyNotified.clear();
}

export interface HistoricalResult {
  count: number;
  complete: boolean;
  accepted: boolean;
  messageId: string | null;
  /** Masked recipient and sender address only; never the API key. */
  recipient: string;
  sender: string;
  alreadyDone: boolean;
  failure: string | null;
}

function maskEmail(email: string) {
  const [local = "", domain = ""] = email.split("@");
  return `${local.slice(0, 2)}***@${domain}`;
}

/**
 * One consolidated workbook of every saved enquiry (not one email per enquiry).
 * Runs once: after the provider has accepted it, repeat calls report alreadyDone.
 * The outcome (count + provider acceptance) is recorded in registration_private.enquiry_exports.
 * Provider acceptance is not proof of inbox delivery.
 */
export async function sendHistoricalWorkbook(): Promise<HistoricalResult | { error: string }> {
  const { apiKey, to, from } = notificationConfig();
  if (!apiKey) return { error: "RESEND_API_KEY missing" };
  if (!from || /@resend\.dev/i.test(from)) return { error: "verified RESEND_FROM sender missing" };
  if (!EMAIL.test(to)) return { error: "invalid recipient" };
  const base = {
    recipient: maskEmail(to),
    sender: from.replace(/^.*</, "").replace(/>.*$/, ""),
  };
  const done: unknown = await registrationRpc("historical_export_done", {});
  const { leads, complete } = await listAllRegistrations();
  if (done === true)
    return { ...base, count: leads.length, complete, accepted: true, messageId: null, alreadyDone: true, failure: null };
  if (!complete) return { error: "enquiry list incomplete; refusing to send a partial history" };
  const sheet = enquiriesToXlsx(leads, { complete });
  let accepted = false;
  let messageId: string | null = null;
  let failure: string | null = null;
  try {
    const response = await fetchWithCap(
      RESEND_URL,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": "enquiries-historical-v1",
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: `All website enquiries so far (${leads.length})`,
          html:
            `<p>This is the complete list of enquiries saved by the website so far: <b>${leads.length}</b>, oldest first.</p>` +
            `<p>From now on you will receive an email for each new enquiry, with this sheet updated and attached.</p>`,
          attachments: [{ filename: enquiryFilename(new Date(), complete), content: sheet.toString("base64") }],
        }),
      },
      30_000,
    );
    accepted = response.ok;
    const reply: unknown = await response.json().catch(() => null);
    if (accepted && reply && typeof reply === "object" && "id" in reply) messageId = String(reply.id).slice(0, 64);
    if (!accepted) failure = `resend ${response.status}`;
  } catch {
    failure = "send error";
  }
  await registrationRpc("log_enquiry_export", {
    export_kind: "historical",
    export_count: leads.length,
    accepted,
    export_provider_id: messageId,
    export_detail: failure,
  }).catch(() => undefined);
  return { ...base, count: leads.length, complete, accepted, messageId, alreadyDone: false, failure };
}
