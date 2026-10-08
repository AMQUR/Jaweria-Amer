import type { Metadata } from "next";
import { LEGACY_ENROL_FORM_URL } from "@/lib/contact";
import { RegistrationForm } from "@/components/public-experience/registration-form";
import { createRegistrationTicket } from "@/lib/registration/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Join the Next Batch",
  description:
    "Express interest in Miss Jay’s English courses. Receive batch details without signing into Google.",
  alternates: { canonical: "/register" },
};
export default function RegistrationPage() {
  return (
    <section className="bg-cream px-4 pb-20 pt-16 sm:px-6">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-crimson">
          Your next step
        </p>
        <h1 className="mt-3 font-serif text-4xl text-ink">
          Learn with Miss Jay.
        </h1>
        <p className="mb-8 mt-5 leading-relaxed text-slate">
          Tell us which English course you’re interested in. We’ll follow up by
          email with batch details, availability and how to enroll.
        </p>
        <RegistrationForm ticket={createRegistrationTicket()} />
        <p className="mt-6 text-xs text-slate">
          Already using the detailed enrollment form?{" "}
          <a
            href={LEGACY_ENROL_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-crimson underline"
          >
            Continue with the existing Google Form
          </a>{" "}
          (Google sign-in may be required).
        </p>
      </div>
    </section>
  );
}
