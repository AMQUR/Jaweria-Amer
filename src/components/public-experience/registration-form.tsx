"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";
import { isOLevelRegistration } from "@/lib/registration/contracts";
import {
  createSubmissionLock,
  interpretRegistrationFailure,
  interpretRegistrationHttp,
  withTimeout,
  type SavedEnrollment,
} from "@/lib/registration/outcome";
import { trackEvent } from "@/lib/analytics";
import { getWhatsAppUrl } from "@/lib/contact";

const CLIENT_TIMEOUT_MS = 14_000;

async function postRegistration(body: unknown) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return interpretRegistrationFailure(new Error("offline"), true);
  }
  try {
    return await withTimeout(CLIENT_TIMEOUT_MS, async (signal) => {
      const response = await fetch("/api/registration", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal,
      });
      return interpretRegistrationHttp(response.status, await response.text());
    });
  } catch (error) {
    return interpretRegistrationFailure(error);
  }
}

function SupportLink() {
  return (
    <a
      className="inline-flex min-h-11 items-center font-semibold text-crimson underline"
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
    >
      Contact Miss Jay on WhatsApp
    </a>
  );
}

export function RegistrationForm({ ticket }: { ticket: string }) {
  const [pending, setPending] = useState(false);
  const [slow, setSlow] = useState(false);
  const [saved, setSaved] = useState<SavedEnrollment | null>(null);
  const [course, setCourse] = useState("");
  const [error, setError] = useState("");
  const lock = useRef(createSubmissionLock());
  const statusRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const oLevel = isOLevelRegistration(course);

  useEffect(() => {
    if (saved) statusRef.current?.focus();
  }, [saved]);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  if (saved)
    return (
      <div
        data-registration-form
        role="status"
        className="rounded-3xl border border-crimson/20 bg-rose-50 p-5 sm:p-7"
      >
        <h2
          ref={statusRef}
          tabIndex={-1}
          className="font-serif text-2xl text-ink outline-none"
        >
          We&apos;ve received your registration.
        </h2>
        <p className="mt-4 leading-relaxed text-slate">
          {saved === "needs_review"
            ? "We need to confirm the right batch before a place is assigned. Miss Jay’s team will contact you at the email you provided. This is not a confirmed enrollment."
            : saved === "pending_account"
              ? "Your batch preference is saved and will be applied when your place is confirmed. This is not a confirmed enrollment or payment."
              : "Miss Jay’s team can review your request and contact you at the email you provided. This is an enquiry, not a confirmed enrollment or payment."}
        </p>
        <div className="mt-6 flex flex-col items-start gap-3">
          <Link
            className="inline-flex min-h-11 items-center font-semibold text-crimson underline"
            href="/#free-lessons"
          >
            Keep learning with the free lessons
          </Link>
          <SupportLink />
        </div>
      </div>
    );
  const inputClass =
    "mt-2 min-h-12 w-full max-w-full scroll-mb-32 rounded-xl border border-border bg-white px-4 text-base text-ink focus:outline-2 focus:outline-crimson";
  return (
    <form
      data-registration-form
      aria-busy={pending}
      className="min-w-0 max-w-full space-y-6 overflow-x-clip rounded-3xl border border-border bg-white p-4 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!lock.current.claim()) return;
        setPending(true);
        setSlow(false);
        setError("");
        const form = new FormData(event.currentTarget);
        const slowTimer = window.setTimeout(() => setSlow(true), 4000);
        try {
          const result = await postRegistration({
            name: form.get("name"),
            email: form.get("email"),
            course: form.get("course"),
            ...(oLevel ? { batch: form.get("batch") } : {}),
            consent: form.get("consent"),
            website: form.get("website"),
            ticket,
          });
          if (result.ok) {
            setSaved(result.enrollment);
            trackEvent("registration_complete", {
              surface: "first_party_interest",
            });
            return;
          }
          setError(result.message);
        } finally {
          window.clearTimeout(slowTimer);
          lock.current.release();
          setSlow(false);
          setPending(false);
        }
      }}
    >
      <label className="block text-sm font-semibold text-ink">
        Your name
        <input
          className={inputClass}
          name="name"
          autoComplete="given-name"
          autoCapitalize="words"
          maxLength={80}
          required
        />
      </label>
      <label className="block text-sm font-semibold text-ink">
        Email for batch details
        <input
          className={inputClass}
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          maxLength={254}
          required
        />
      </label>
      <label className="block text-sm font-semibold text-ink">
        Your syllabus
        <select
          className={inputClass}
          name="course"
          required
          value={course}
          onChange={(event) => setCourse(event.target.value)}
        >
          <option value="" disabled>
            Choose your course
          </option>
          {PUBLIC_ENGLISH_SYLLABUSES.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
      {oLevel && (
        <label className="block text-sm font-semibold text-ink">
          Which batch do you wish to join?
          <select className={inputClass} name="batch" required defaultValue="">
            <option value="" disabled>
              Choose a batch
            </option>
            <option value="A">Batch A</option>
            <option value="B">Batch B</option>
            <option value="C">Batch C</option>
          </select>
        </label>
      )}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed text-slate">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          className="mt-0.5 h-6 w-6 shrink-0 accent-crimson"
          required
        />
        <span>
          I agree to be contacted about this course enquiry. My details will be
          kept privately for course follow-up, as described in the{" "}
          <Link className="text-crimson underline" href="/privacy">
            privacy policy
          </Link>
          .
        </span>
      </label>
      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-crimson outline-none"
        >
          {error}
        </p>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {pending
          ? slow
            ? "Still sending your request. Please keep this page open."
            : "Sending your request."
          : ""}
      </p>
      {slow && (
        <p className="text-sm leading-relaxed text-slate">
          Still sending your request. Please keep this page open.
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full scroll-mb-32 touch-manipulation rounded-xl bg-crimson px-5 py-3 font-semibold text-white hover:bg-crimson-dark disabled:opacity-60"
      >
        {pending ? "Sending your request…" : "Send My Interest"}
      </button>
      <p className="text-xs leading-relaxed text-slate">
        No Google account, payment or LMS account is needed. Need help?{" "}
        <SupportLink />.
      </p>
    </form>
  );
}
