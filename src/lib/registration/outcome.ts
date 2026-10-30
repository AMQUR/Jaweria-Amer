/**
 * Visitor-facing registration results. No secrets, no internal exceptions.
 * A retry reuses the same signed ticket, and the database treats that ticket as the enquiry id.
 */

export const registrationCopy = {
  unconfirmed:
    "We could not confirm whether your request was saved. Please try again. Sending it again will not create a duplicate.",
  timeout:
    "The request timed out before we could confirm it. Please try again. Sending it again will not create a duplicate.",
  offline:
    "Network unavailable. Check your connection and try again. Sending it again will not create a duplicate.",
  failed:
    "We could not confirm your request. Please retry or contact Miss Jay directly.",
  rateLimit:
    "Please wait before sending another request. You can also contact Miss Jay directly.",
  invalid:
    "Please check your name, email, course and consent.",
} as const;

export type SavedEnrollment = "pending_account" | "needs_review" | "received";

export type RegistrationClientResult =
  | { ok: true; enrollment: SavedEnrollment }
  | {
      ok: false;
      tone: "unconfirmed" | "timeout" | "offline" | "failed" | "rate" | "invalid";
      message: string;
    };

const ENROLLMENTS = new Set<SavedEnrollment>([
  "pending_account",
  "needs_review",
  "received",
]);

function publicError(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  const text = value.trim();
  if (
    !text ||
    text.length > 180 ||
    /[\r\n]/.test(text) ||
    /exception|stack|supabase|secret|postgres|token|password/i.test(text)
  ) {
    return fallback;
  }
  return text;
}

export function interpretRegistrationHttp(
  status: number,
  raw: string,
): RegistrationClientResult {
  let body: unknown = null;
  if (raw) {
    try {
      body = JSON.parse(raw);
    } catch {
      body = null;
    }
  }
  const record =
    body && typeof body === "object"
      ? (body as Record<string, unknown>)
      : null;

  if (status === 200 && record?.saved === true) {
    const enrollment = record.enrollment;
    return {
      ok: true,
      enrollment: ENROLLMENTS.has(enrollment as SavedEnrollment)
        ? (enrollment as SavedEnrollment)
        : "received",
    };
  }

  if (status === 429) {
    return { ok: false, tone: "rate", message: registrationCopy.rateLimit };
  }

  if (record?.outcome === "timeout" || (status === 504 && record?.outcome === "timeout")) {
    return { ok: false, tone: "timeout", message: registrationCopy.timeout };
  }

  if (
    status === 504 ||
    record?.outcome === "unconfirmed" ||
    (status === 200 && record?.saved !== true) ||
    (status >= 500 && !record)
  ) {
    return {
      ok: false,
      tone: "unconfirmed",
      message: registrationCopy.unconfirmed,
    };
  }

  if (status === 400 || status === 403 || status === 413 || status === 415) {
    return {
      ok: false,
      tone: "invalid",
      message: publicError(record?.error, registrationCopy.invalid),
    };
  }

  return { ok: false, tone: "failed", message: registrationCopy.failed };
}

export function interpretRegistrationFailure(
  error: unknown,
  offline = typeof navigator !== "undefined" && navigator.onLine === false,
): RegistrationClientResult {
  if (offline) {
    return { ok: false, tone: "offline", message: registrationCopy.offline };
  }
  const name = error instanceof Error ? error.name : "";
  if (name === "TimeoutError" || name === "AbortError") {
    return { ok: false, tone: "timeout", message: registrationCopy.timeout };
  }
  if (error instanceof TypeError) {
    return { ok: false, tone: "offline", message: registrationCopy.offline };
  }
  return { ok: false, tone: "failed", message: registrationCopy.failed };
}

/** Hard stop so a fetch that never settles cannot leave the form spinning. */
export function withTimeout<T>(
  timeoutMs: number,
  work: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      const error = new Error("timeout");
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);
  });
  return Promise.race([work(controller.signal), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/** Synchronous guard so a double tap cannot start two requests before React re-renders. */
export function createSubmissionLock() {
  let held = false;
  return {
    claim() {
      if (held) return false;
      held = true;
      return true;
    },
    release() {
      held = false;
    },
  };
}
