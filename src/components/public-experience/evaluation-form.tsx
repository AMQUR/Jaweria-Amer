"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, LoaderCircle } from "lucide-react";
import {
  evaluationCourses,
  evaluationTypes,
  MAX_FILE_BYTES,
  type EvaluationFeedback,
} from "@/lib/evaluation/contracts";
import { trackEvent } from "@/lib/analytics";
import { RegistrationLink, registrationButton } from "./registration-link";
import { getWhatsAppUrl } from "@/lib/contact";

const field =
  "mt-2 min-h-12 w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-crimson";
const stages = ["Your course", "Your work", "Your details"];
export function EvaluationForm({
  available,
  limit,
}: {
  available: boolean;
  limit: number;
}) {
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("text");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<EvaluationFeedback | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);
  function move(next: number) {
    setError("");
    if (next > step) {
      const inputs = formRef.current?.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
      >("fieldset:not([hidden]) input, fieldset:not([hidden]) textarea");
      for (const input of inputs ?? []) if (!input.reportValidity()) return;
      if (step === 1 && mode === "file") {
        const file =
          formRef.current?.querySelector<HTMLInputElement>('input[type="file"]')
            ?.files?.[0];
        if (!file) {
          setError("Choose a PDF, JPG or PNG first.");
          return;
        }
        if (file.size > MAX_FILE_BYTES) {
          setError("Choose a file under 2 MB.");
          return;
        }
      }
    }
    setStep(next);
    if (!started.current) {
      trackEvent("free_evaluation_started");
      started.current = true;
    }
    requestAnimationFrame(() => headingRef.current?.focus());
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    setBusy(true);
    const data = new FormData(event.currentTarget);
    if (mode === "text") data.delete("file");
    else data.set("answer", "");
    trackEvent("free_evaluation_submitted", { format: mode });
    if (mode === "file") trackEvent("free_evaluation_upload_started");
    try {
      const response = await fetch("/api/free-evaluation", {
        method: "POST",
        body: data,
        signal: AbortSignal.timeout(55000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error ||
            "We could not submit your work. Please try again later.",
        );
      setFeedback(result.feedback);
      trackEvent("free_evaluation_completed", {
        readable: result.feedback.readable,
      });
      requestAnimationFrame(() => headingRef.current?.focus());
    } catch (e) {
      setError(
        e instanceof Error &&
          e.name !== "TimeoutError" &&
          e.name !== "TypeError"
          ? e.message
          : "The connection was interrupted. Your work is still here. Please check your connection; an analysis attempt may have used your allowance.",
      );
      trackEvent("free_evaluation_failed");
    } finally {
      setBusy(false);
    }
  }
  if (!available)
    return (
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-10">
        <FileText className="mb-6 h-8 w-8 text-crimson" aria-hidden />
        <h2 className="font-serif text-2xl text-ink">
          Free evaluations are coming soon
        </h2>
        <p className="mt-4 text-slate">
          We&apos;re preparing the feedback service. No work is collected while
          it is unavailable. In the meantime, try our free practice resources.
        </p>
        <Link href="/resources" className={`${registrationButton} mt-6`}>
          Explore free resources <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-5 text-sm">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-crimson underline"
          >
            Ask about the programme
          </a>
        </p>
      </div>
    );
  if (feedback)
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-crimson">
            A clear next step
          </p>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-24 font-serif text-3xl text-ink"
          >
            {feedback.readable
              ? "Your feedback"
              : "Let’s make your work easier to assess"}
          </h2>
          {feedback.readable && (
            <>
              <h3 className="mt-8 text-lg font-semibold text-ink">
                What you&apos;re already doing well
              </h3>
              <ul className="mt-4 space-y-4">
                {feedback.strengths.map((point, i) => (
                  <li key={i} className="rounded-xl bg-cream p-4">
                    <p className="font-medium text-ink">{point.observation}</p>
                    <blockquote className="mt-2 border-l-2 border-crimson/30 pl-3 text-sm text-slate">
                      “{point.evidence}”
                    </blockquote>
                  </li>
                ))}
              </ul>
              <h3 className="mt-8 text-lg font-semibold text-ink">
                Your biggest opportunity
              </h3>
              <p className="mt-3 text-slate">{feedback.biggestOpportunity}</p>
              <h3 className="mt-8 text-lg font-semibold text-ink">
                What to improve next
              </h3>
              <ul className="mt-3 space-y-3">
                {feedback.improvements.map((point, i) => (
                  <li key={i} className="flex gap-3 text-slate">
                    <Check
                      className="mt-1 h-4 w-4 shrink-0 text-crimson"
                      aria-hidden
                    />
                    {point}
                  </li>
                ))}
              </ul>
              {feedback.improvedExample && (
                <div className="mt-8 rounded-xl border border-border p-5">
                  <h3 className="font-semibold text-ink">Try this instead</h3>
                  {feedback.originalExample && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-slate">
                      Original: {feedback.originalExample}
                    </p>
                  )}
                  <p className="mt-3 whitespace-pre-wrap text-ink">
                    {feedback.improvedExample}
                  </p>
                </div>
              )}
            </>
          )}
          <div className="mt-8 rounded-xl bg-rose-50 p-5">
            <h3 className="font-semibold text-ink">Your next focus</h3>
            <p className="mt-2 text-slate">{feedback.nextFocus}</p>
          </div>
          <p className="mt-6 text-xs leading-relaxed text-slate">
            AI-assisted feedback designed around our English assessment
            approach. This is practice guidance, not an official Cambridge mark
            or personal teacher assessment. Copy your feedback before leaving;
            we do not save it.
          </p>
        </div>
        <div className="rounded-3xl bg-cream p-6 sm:p-10">
          <h2 className="font-serif text-2xl text-ink">
            Keep the practice. Keep the progress.
          </h2>
          <p className="mt-3 text-slate">
            Get structured lessons, checked assignments, recordings and progress
            reports in the guided programme.
          </p>
          <RegistrationLink
            surface="evaluation"
            className={`${registrationButton} mt-6`}
          >
            Join the Next Batch <ArrowRight className="h-4 w-4" />
          </RegistrationLink>
        </div>
      </div>
    );
  return (
    <form
      ref={formRef}
      onSubmit={submit}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          step < 2 &&
          event.target instanceof HTMLInputElement &&
          event.target.type !== "file"
        ) {
          event.preventDefault();
          move(step + 1);
        }
      }}
      className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-10"
    >
      <ol aria-label="Evaluation steps" className="mb-8 grid grid-cols-3 gap-3">
        {stages.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={`border-t-2 pt-3 text-xs sm:text-sm ${i <= step ? "border-crimson text-crimson" : "border-border text-slate"}`}
          >
            <span className="mr-1 font-semibold">{i + 1}.</span>
            {label}
          </li>
        ))}
      </ol>
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mb-6 scroll-mt-24 font-serif text-2xl text-ink"
      >
        {stages[step]}
      </h2>
      <fieldset hidden={step !== 0} disabled={busy} className="space-y-5">
        <legend className="sr-only">
          Choose your course and assignment type
        </legend>
        <label className="block text-sm font-medium text-ink">
          Course
          <select name="course" className={field}>
            {evaluationCourses.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink">
          Assignment type
          <select name="assignmentType" className={field}>
            {evaluationTypes.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <p className="text-sm text-slate">
          Choose the course you are preparing for. Feedback focuses on your
          actual answer, without predicting a grade.
        </p>
      </fieldset>
      <fieldset hidden={step !== 1} disabled={busy} className="space-y-5">
        <legend className="sr-only">Provide your task and answer</legend>
        <label className="block text-sm font-medium text-ink">
          Question or task — include the source passage for reading tasks
          <textarea
            name="task"
            required
            minLength={10}
            maxLength={6000}
            rows={4}
            className={field}
            placeholder="What were you asked to do?"
          />
        </label>
        <div className="flex gap-3" role="group" aria-label="Answer format">
          {["text", "file"].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
              className={`min-h-11 rounded-xl border px-4 text-sm ${mode === value ? "border-crimson bg-rose-50 text-crimson" : "border-border text-slate"}`}
            >
              {value === "text" ? "Paste answer" : "Upload work"}
            </button>
          ))}
        </div>
        <label
          hidden={mode !== "text"}
          className="block text-sm font-medium text-ink"
        >
          Your answer
          <textarea
            name="answer"
            disabled={mode !== "text" || busy}
            required={mode === "text"}
            minLength={80}
            maxLength={12000}
            rows={9}
            className={field}
            placeholder="Paste your own work here…"
          />
        </label>
        <label
          hidden={mode !== "file"}
          className="block rounded-xl border border-dashed border-crimson/40 bg-rose-50/50 p-5 text-sm font-medium text-ink"
        >
          Choose one clear file
          <input
            type="file"
            name="file"
            disabled={mode !== "file" || busy}
            accept="application/pdf,image/jpeg,image/png"
            className="mt-3 block w-full min-w-0 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-3 file:text-crimson"
          />
          <span className="mt-3 block text-xs text-slate">
            PDF, JPG or PNG · up to 2 MB · no encrypted PDFs
          </span>
        </label>
        <p className="text-xs leading-relaxed text-slate">
          Remove your school, full name and other personal details from the work
          before submitting.
        </p>
      </fieldset>
      <fieldset hidden={step !== 2} disabled={busy} className="space-y-5">
        <legend className="sr-only">Your details and privacy consent</legend>
        <label className="block text-sm font-medium text-ink">
          First name
          <input
            name="firstName"
            autoComplete="given-name"
            required
            maxLength={60}
            className={field}
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            className={field}
          />
        </label>
        <p className="text-sm leading-relaxed text-slate">
          {limit === 1
            ? "One free analysis attempt"
            : "Up to two free analysis attempts"}{" "}
          per email and browser. We use a protected email fingerprint to enforce
          the limit; this is not a newsletter signup. Once analysis starts, an
          unreadable file or failed analysis may still use an attempt.
        </p>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-slate">
          <input
            type="checkbox"
            name="consent"
            value="yes"
            required
            className="mt-1 h-5 w-5 shrink-0 accent-crimson"
          />
          <span>
            I agree to AI-assisted analysis of my work. The site does not save
            my answer or feedback. The analysis provider may retain content
            under its data policy.{" "}
            <Link href="/privacy" className="text-crimson underline">
              Read the privacy details
            </Link>
            .
          </span>
        </label>
      </fieldset>
      {error && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-crimson/20 bg-rose-50 p-4 text-sm text-crimson"
        >
          {error}
        </p>
      )}
      {busy && (
        <div
          role="status"
          className="mt-6 flex gap-3 rounded-xl bg-cream p-5 text-sm text-slate"
        >
          <LoaderCircle
            className="h-5 w-5 shrink-0 motion-safe:animate-spin"
            aria-hidden
          />
          <div>
            <p className="font-semibold text-ink">Preparing your feedback</p>
            <p className="mt-1">
              Reading your answer, checking its strengths and finding a useful
              next step. This may take up to a minute.
            </p>
          </div>
        </div>
      )}
      <div className="mt-8 flex flex-wrap justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => move(step - 1)}
            className="min-h-11 rounded-xl border border-border px-5 text-sm text-ink"
          >
            Back
          </button>
        ) : (
          <span />
        )}
        {step < 2 ? (
          <button
            type="button"
            onClick={() => move(step + 1)}
            className={registrationButton}
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={busy}
            className={`${registrationButton} disabled:opacity-60`}
          >
            {busy ? "Preparing feedback…" : "Get My Feedback"}
          </button>
        )}
      </div>
    </form>
  );
}
