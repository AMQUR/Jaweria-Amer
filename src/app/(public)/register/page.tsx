import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";
import { LEGACY_ENROL_FORM_URL } from "@/lib/contact";
import { RegistrationForm } from "@/components/public-experience/registration-form";
import { createRegistrationTicket } from "@/lib/registration/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Join the Next Batch",
  description:
    "Express interest in Miss Jay’s English courses. Receive batch details without signing into Google.",
  alternates: { canonical: "/register" },
  ...socialMetadata({
    title: "Join the Next Batch",
    description:
      "Express interest in Miss Jay’s English courses. Receive batch details without signing into Google.",
    path: "/register",
  }),
};
export default function RegistrationPage() {
  return (
    <section className="ed-paper ed-margin overflow-x-clip pb-[max(7.5rem,calc(env(safe-area-inset-bottom)+6.5rem))] lg:pb-24">
      <div className="ed-wrap grid gap-10 pt-10 sm:pt-16 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <p className="ed-label">Your next step</p>
          <h1 className="ed-display mt-5 text-[clamp(2.6rem,8vw,5.75rem)]">
            Learn with Miss Jay.
          </h1>
          <p className="ed-lead mt-6">
            Tell us which English course you’re interested in. We’ll follow up
            by phone, WhatsApp or email with batch details, availability and
            how to enroll.
          </p>
          <ol className="mt-10 hidden border-t border-ink/15 lg:block">
            {[
              ["Send your interest", "Name, email, phone number and syllabus. No Google account, payment or LMS account is needed."],
              ["We get in touch", "Miss Jay’s team follows up by phone, WhatsApp or email with batch details and availability."],
              ["You decide", "An enquiry is not an enrollment. Nothing is confirmed until you choose to join."],
            ].map(([title, text], i) => (
              <li key={title} className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 border-b border-ink/15 py-5">
                <span className="ed-num text-[2rem] text-crimson" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="ed-h3">{title}</h2>
                  <p className="mt-1 leading-relaxed text-slate">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="min-w-0 lg:col-span-6 lg:pt-4">
          <RegistrationForm ticket={createRegistrationTicket()} />
          <p className="mt-6 text-[0.875rem] leading-relaxed text-slate">
            Already using the detailed enrollment form?{" "}
            <a
              href={LEGACY_ENROL_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-crimson underline underline-offset-4"
            >
              Continue with the existing Google Form
            </a>{" "}
            (Google sign-in may be required).
          </p>
        </div>
      </div>
    </section>
  );
}
