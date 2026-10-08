import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactEmailLink } from "@/components/contact-email-link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Jaweria Amer collects and uses contact information for course enrollment.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-crimson to-crimson-dark pb-12 pt-28 sm:pb-16 sm:pt-36">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 sm:text-xs">
            Legal
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/60">
            Last updated: October 8, 2026
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="space-y-8 text-sm leading-relaxed text-slate sm:text-base">
            <p>
              Jaweria Amer uses the contact details you provide (including email
              addresses and WhatsApp numbers) only to respond to enquiries,
              manage course enrollment, and deliver related communications about
              your learning.
            </p>
            <p>
              We do not sell, rent, or share your personal data with third
              parties for marketing or unrelated purposes.
            </p>
            <section aria-labelledby="evaluation-privacy">
              <h2
                id="evaluation-privacy"
                className="mb-3 font-serif text-2xl text-ink"
              >
                Free evaluation preview
              </h2>
              <p>
                When the preview is available, you can submit your own answer as
                text, a PDF or an image. We send the question and answer to
                OpenAI for AI-assisted practice feedback. We do not send the
                first name or email fields to the analysis provider. Remove
                personal or school information from the document itself.
              </p>
              <p className="mt-4">
                Our website processes the work in memory and does not save your
                answer, document or feedback to its database, storage or
                analytics. Save a copy of your feedback before leaving. OpenAI
                may retain API content for abuse monitoring according to its{" "}
                <a
                  href="https://developers.openai.com/api/docs/guides/your-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-crimson underline"
                >
                  data policy
                </a>
                ; we request no response storage. The preview should only be
                enabled after the account’s data settings have been reviewed.
                API content is not used to train models by default.
              </p>
              <p className="mt-4">
                We keep keyed, protected fingerprints of the email and browser
                identifier, plus attempt counts, to enforce the lifetime
                free-use allowance. These records do not contain your plain
                email or work. A secure browser cookie helps recognize repeat
                attempts for up to one year. Short-lived network and daily
                counters control abuse and cost and are removed during
                subsequent evaluations after expiry. Analysis failures or
                unreadable work may use an attempt once processing starts.
              </p>
              <p className="mt-4">
                These details are not a marketing signup. Registration is a
                separate Google Form. Contact us below for privacy questions or
                to request deletion of the evaluation identifier associated with
                your email. Videos hosted by external platforms follow those
                platforms’ privacy policies; lesson files load only when you
                choose to play them.
              </p>
            </section>
            <p>
              Questions about this policy:{" "}
              <ContactEmailLink className="font-medium" />.
            </p>
            <p>
              For full terms governing use of materials and intellectual
              property, see our{" "}
              <Link
                href="/terms"
                className="font-medium text-ink underline-offset-4 hover:text-brand-accent hover:underline"
              >
                Terms of Service
              </Link>
              .
            </p>
          </article>

          <Link
            href="/"
            className="mt-12 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-brand-accent"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
