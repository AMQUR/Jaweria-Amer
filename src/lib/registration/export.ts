import "server-only";
import { buildXlsx } from "./xlsx";
import type { RegistrationLead } from "./server";

export const ENQUIRY_HEADERS = [
  "Name",
  "Email",
  "Phone / WhatsApp",
  "Course",
  "Batch preference",
  "Date submitted (PKT)",
  "Status",
] as const;

export function enquiryStatus(routingStatus: string) {
  switch (routingStatus) {
    case "pending_account":
      return "Batch confirmed, awaiting LMS account";
    case "needs_review":
      return "Needs review";
    case "pending_resolution":
      return "Batch confirmation pending";
    case "not_applicable":
      return "No automatic batch";
    default:
      return "New";
  }
}

export function formatPkt(iso: string) {
  return (
    new Date(iso).toLocaleString("en-GB", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " PKT"
  );
}

/** Spreadsheet formulas in user-supplied text are neutralised (CSV/Excel injection). */
function safe(text: string) {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

/** Spreadsheet column (0-based) that holds the phone number and is formatted as text. */
const PHONE_COLUMN = 2;
const PLAIN_PHONE = /^\+\d{8,15}$/;

/** A stored phone is already validated E.164; anything else is treated like free text. */
function phoneCell(phone: string | null | undefined) {
  if (!phone) return "";
  return PLAIN_PHONE.test(phone) ? phone : safe(phone);
}

export const INCOMPLETE_NOTICE =
  "NOTE: this sheet holds only the most recent enquiries the website can list (200). Older enquiries are not included.";

export function enquiriesToXlsx(
  leads: RegistrationLead[],
  options: { complete?: boolean } = {},
) {
  const rows: string[][] = [
    [...ENQUIRY_HEADERS],
    ...[...leads]
      .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at))
      .map((l) => [
        safe(l.name),
        safe(l.email),
        phoneCell(l.phone),
        l.course,
        l.batch_letter ? `Batch ${l.batch_letter}` : "",
        formatPkt(l.created_at),
        enquiryStatus(l.routing_status),
      ]),
  ];
  // Never let a capped list pass as the full history.
  if (options.complete === false) rows.push([INCOMPLETE_NOTICE, "", "", "", "", "", ""]);
  return buildXlsx(rows, [26, 34, 22, 44, 16, 26, 36], "Enquiries", [PHONE_COLUMN]);
}

export function enquiryFilename(now = new Date(), complete = true) {
  return `enquiries-${complete ? "" : "latest-200-"}${now.toISOString().slice(0, 10)}.xlsx`;
}
