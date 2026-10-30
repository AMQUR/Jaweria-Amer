import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { RegistrationInput } from "./contracts";

/**
 * Visitor budget. LMS forwarding is capped so it cannot consume the save.
 * Tests may tighten these values; production keeps the defaults below.
 */
export const registrationBudget = {
  deadlineMs: 12_000,
  forwardMs: 2_000,
  saveMs: 8_000,
};

export class RegistrationAttemptError extends Error {
  readonly kind: "timeout" | "failed";
  constructor(kind: "timeout" | "failed") {
    super(kind);
    this.name = "RegistrationAttemptError";
    this.kind = kind;
  }
}

function hash(value: string) {
  if ((process.env.SESSION_SECRET?.length ?? 0) < 32)
    throw new RegistrationAttemptError("failed");
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update(`registration:${value}`)
    .digest("hex");
}

function timeoutError() {
  const error = new Error("timeout");
  error.name = "TimeoutError";
  return error;
}

/** Abort and stop waiting even if the underlying fetch never settles. */
export async function fetchWithCap(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const upstream = init.signal;
  if (upstream?.aborted) controller.abort();
  else upstream?.addEventListener("abort", () => controller.abort(), { once: true });
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(timeoutError());
    }, timeoutMs);
  });
  const request = fetch(url, { ...init, signal: controller.signal });
  request.catch(() => undefined);
  try {
    return await Promise.race([request, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function readBoundedText(response: Response, timeoutMs: number) {
  const body = response.text();
  body.catch(() => undefined);
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const text = await Promise.race([
      body,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(timeoutError()), timeoutMs);
      }),
    ]);
    return text.length > 8192 ? text.slice(0, 8192) : text;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
export function createRegistrationTicket(now = Date.now()) {
  const payload = `${now}.${randomUUID()}`;
  return `${payload}.${hash(payload)}`;
}
export function verifyRegistrationTicket(
  ticket: string,
  now = Date.now(),
): string | null {
  const [timestamp, nonce, signature, extra] = ticket.split(".");
  if (
    extra ||
    !/^\d{13}$/.test(timestamp ?? "") ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      nonce ?? "",
    ) ||
    !/^[0-9a-f]{64}$/.test(signature ?? "")
  )
    return null;
  const age = now - Number(timestamp);
  if (age < 2000 || age > 3600000) return null;
  return timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hash(`${timestamp}.${nonce}`)),
  )
    ? nonce
    : null;
}
export async function registrationRpc(
  name: string,
  body: Record<string, unknown>,
  timeoutMs = 10000,
) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new RegistrationAttemptError("failed");
  let response: Response;
  try {
    response = await fetchWithCap(
      `${url}/rest/v1/rpc/${name}`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
      timeoutMs,
    );
  } catch (error) {
    if (error instanceof RegistrationAttemptError) throw error;
    const name = error instanceof Error ? error.name : "";
    throw new RegistrationAttemptError(
      name === "TimeoutError" || name === "AbortError" ? "timeout" : "failed",
    );
  }
  let text = "";
  try {
    text = await readBoundedText(response, Math.min(timeoutMs, 2000));
  } catch {
    throw new RegistrationAttemptError(response.ok ? "timeout" : "failed");
  }
  if (!response.ok) throw new RegistrationAttemptError("failed");
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    throw new RegistrationAttemptError("timeout");
  }
}
export interface StoredRouting {
  routingStatus:
    | "received"
    | "pending_account"
    | "needs_review"
    | "pending_resolution"
    | "not_applicable";
  destinationName: string | null;
  enrollment: "pending_account" | "needs_review" | "received";
}

export async function forwardRegistration(
  input: RegistrationInput,
  requestId: string,
  timeoutMs = 8000,
): Promise<StoredRouting> {
  if (input.course === "AS Level English Language 9093") {
    return {
      routingStatus: "not_applicable",
      destinationName: null,
      enrollment: "received",
    };
  }
  const url = process.env.LMS_REGISTRATION_INTENT_URL?.trim();
  const secret = process.env.LMS_REGISTRATION_INTENT_SECRET?.trim();
  if (!url || !secret) {
    return {
      routingStatus: "pending_resolution",
      destinationName: null,
      enrollment: "received",
    };
  }
  try {
    const response = await fetchWithCap(
      url,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "x-registration-secret": secret,
        },
        body: JSON.stringify({
          requestId,
          email: input.email,
          name: input.name,
          syllabusCode: input.course,
          selectedBatch: input.batch ?? null,
        }),
      },
      timeoutMs,
    );
    const text = await readBoundedText(response, Math.min(timeoutMs, 1000));
    const payload: unknown = JSON.parse(text);
    if (
      !response.ok ||
      !payload ||
      typeof payload !== "object" ||
      !("ok" in payload) ||
      payload.ok !== true ||
      !("enrollment" in payload)
    ) {
      return {
        routingStatus: "pending_resolution",
        destinationName: null,
        enrollment: "received",
      };
    }
    const enrollment = payload.enrollment;
    const cohortName =
      "cohortName" in payload && typeof payload.cohortName === "string"
        ? payload.cohortName.slice(0, 160)
        : null;
    if (enrollment === "pending_account") {
      return {
        routingStatus: "pending_account",
        destinationName: cohortName,
        enrollment: "pending_account",
      };
    }
    if (enrollment === "needs_review") {
      return {
        routingStatus: "needs_review",
        destinationName: null,
        enrollment: "needs_review",
      };
    }
  } catch {
    return {
      routingStatus: "pending_resolution",
      destinationName: null,
      enrollment: "received",
    };
  }
  return {
    routingStatus: "pending_resolution",
    destinationName: null,
    enrollment: "received",
  };
}

export async function saveRegistration(
  input: RegistrationInput,
  ip: string,
  requestId: string,
  routing: StoredRouting,
  timeoutMs = 10000,
) {
  const result: unknown = await registrationRpc(
    "submit_registration_interest",
    {
      student_name: input.name,
      student_email: input.email,
      syllabus: input.course,
      network_hash: hash(`ip:${ip}`),
      request_id: requestId,
      batch_letter: input.batch ?? null,
      destination_name: routing.destinationName,
      routing_status: routing.routingStatus,
    },
    timeoutMs,
  );
  if (result !== "saved" && result !== "limited")
    throw new RegistrationAttemptError("failed");
  return result;
}

export type PublicRegistrationResult =
  | { status: "saved"; enrollment: StoredRouting["enrollment"] }
  | { status: "limited" }
  | { status: "unconfirmed" }
  | { status: "timeout" }
  | { status: "failed" };

/**
 * Forwarding is optional and capped. The website enquiry is saved afterwards
 * with whatever routing the forward actually returned, including "received"
 * when the LMS intent call is slow or unavailable.
 */
export async function submitPublicRegistration(
  input: RegistrationInput,
  ip: string,
  requestId: string,
): Promise<PublicRegistrationResult> {
  const started = Date.now();
  const forwardBudget = Math.max(
    1,
    Math.min(registrationBudget.forwardMs, registrationBudget.deadlineMs),
  );
  const routing = await forwardRegistration(input, requestId, forwardBudget);
  const remaining = registrationBudget.deadlineMs - (Date.now() - started);
  if (remaining < 500) return { status: "timeout" };
  const saveBudget = Math.min(registrationBudget.saveMs, remaining);
  try {
    const result = await saveRegistration(
      input,
      ip,
      requestId,
      routing,
      saveBudget,
    );
    if (result === "limited") return { status: "limited" };
    return { status: "saved", enrollment: routing.enrollment };
  } catch (error) {
    if (
      error instanceof RegistrationAttemptError &&
      error.kind === "timeout"
    ) {
      return { status: "unconfirmed" };
    }
    return { status: "failed" };
  }
}
export interface RegistrationLead {
  id: string;
  name: string;
  email: string;
  course: string;
  created_at: string;
  batch_letter: string | null;
  destination_name: string | null;
  routing_status: string;
}
export async function listRegistrations(): Promise<RegistrationLead[]> {
  return registrationRpc("list_registration_interest", {});
}
