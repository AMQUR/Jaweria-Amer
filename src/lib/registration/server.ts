import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { RegistrationInput } from "./contracts";

function hash(value: string) {
  if ((process.env.SESSION_SECRET?.length ?? 0) < 32)
    throw new Error("registration_unavailable");
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update(`registration:${value}`)
    .digest("hex");
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
) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("registration_unavailable");
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    cache: "no-store",
    signal: AbortSignal.timeout(10000),
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error("registration_unavailable");
  return response.json();
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
    const response = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
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
    });
    const payload: unknown = await response.json();
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
  );
  if (result !== "saved" && result !== "limited")
    throw new Error("registration_unavailable");
  return result;
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
