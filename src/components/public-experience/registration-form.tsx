"use client";
import Link from "next/link";
import { useState } from "react";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";
import { trackEvent } from "@/lib/analytics";
import { getWhatsAppUrl } from "@/lib/contact";

export function RegistrationForm({ ticket }: { ticket: string }) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  if (saved)
    return (
      <div
        role="status"
        className="rounded-3xl border border-crimson/20 bg-rose-50 p-7"
      >
        <h2 className="font-serif text-2xl text-ink">
          Your interest has been received.
        </h2>
        <p className="mt-4 leading-relaxed text-slate">
          Miss Jay’s team can review your request and contact you at the email
          you provided with batch details and next steps. This is an enquiry,
          not a confirmed enrollment or payment.
        </p>
        <Link
          className="mt-6 inline-flex min-h-11 items-center font-semibold text-crimson underline"
          href="/#free-lessons"
        >
          Keep learning with the free lessons
        </Link>
      </div>
    );
  const inputClass =
    "mt-2 min-h-12 w-full rounded-xl border border-border bg-white px-4 text-ink focus:outline-2 focus:outline-crimson";
  return (
    <form
      className="space-y-6 rounded-3xl border border-border bg-white p-6 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending) return;
        setPending(true);
        setError("");
        const form = new FormData(event.currentTarget);
        try {
          const response = await fetch("/api/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.get("name"),
              email: form.get("email"),
              course: form.get("course"),
              consent: form.get("consent"),
              website: form.get("website"),
              ticket,
            }),
            signal: AbortSignal.timeout(15000),
          });
          const result = await response.json();
          if (!response.ok || result.saved !== true)
            throw new Error(result.error || "Please try again.");
          setSaved(true);
          trackEvent("registration_complete", {
            surface: "first_party_interest",
          });
        } catch (failure) {
          setError(
            failure instanceof Error &&
              failure.name !== "TimeoutError" &&
              failure.name !== "SyntaxError"
              ? failure.message
              : "We could not confirm your request. Please retry or contact Miss Jay.",
          );
        } finally {
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
          autoComplete="email"
          maxLength={254}
          required
        />
      </label>
      <label className="block text-sm font-semibold text-ink">
        Your syllabus
        <select className={inputClass} name="course" required defaultValue="">
          <option value="" disabled>
            Choose your course
          </option>
          {PUBLIC_ENGLISH_SYLLABUSES.map((course) => (
            <option key={course}>{course}</option>
          ))}
        </select>
      </label>
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm leading-relaxed text-slate">
        <input
          type="checkbox"
          name="consent"
          value="yes"
          className="mt-1 h-5 w-5 shrink-0 accent-crimson"
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
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm text-crimson"
        >
          {error}
        </p>
      )}
      <button
        disabled={pending}
        className="min-h-12 w-full rounded-xl bg-crimson px-5 py-3 font-semibold text-white hover:bg-crimson-dark disabled:opacity-60"
      >
        {pending ? "Sending your request…" : "Send My Interest"}
      </button>
      <p className="text-xs leading-relaxed text-slate">
        No Google account, payment or LMS account is needed. Need help?{" "}
        <a
          className="text-crimson underline"
          href={getWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact Miss Jay on WhatsApp
        </a>
        .
      </p>
    </form>
  );
}
