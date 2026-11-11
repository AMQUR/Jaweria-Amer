import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageIntro } from "@/components/editorial/page-intro";
import { ArrowLeft } from "lucide-react";
import { ContactEmailLink } from "@/components/contact-email-link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Jaweria Amer collects and uses contact information for course enrollment.",
  alternates: { canonical: "/privacy" },
  ...socialMetadata({
    title: "Privacy Policy",
    description:
      "How Jaweria Amer collects and uses contact information for course enrollment.",
    path: "/privacy",
  }),
};

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        size="md"
        label="Legal"
        title="Privacy Policy"
        lead="Last updated: October 8, 2026"
      />

      <section className="ed-paper border-t border-ink/10 py-12 sm:py-16">
        <div className="ed-wrap">
          <article className="max-w-[42rem] space-y-8 text-[1.0625rem] leading-[1.7] text-ink-muted">
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
            <section aria-labelledby="registration-privacy">
              <h2
                id="registration-privacy"
                className="ed-h3 mb-3 border-t border-ink/15 pt-7 text-[1.5rem]"
              >
                Registration interest
              </h2>
              <p>
                We privately store your name, email, selected course and enquiry
                date in Supabase so Miss Jay’s team can contact you by email
                about batch details and enrollment. Only authorized website
                administrators can review these requests. No payment or LMS
                account is created. Records older than 180 days are removed when
                the inbox is reviewed or another enquiry arrives. A keyed
                network fingerprint and short-lived counters help prevent spam;
                we do not store your plain IP address in this enquiry database.
                Contact us below to request deletion sooner. The existing Google
                registration form remains available separately and follows
                Google’s privacy settings.
              </p>
            </section>
            <section aria-labelledby="evaluation-privacy">
              <h2
                id="evaluation-privacy"
                className="ed-h3 mb-3 border-t border-ink/15 pt-7 text-[1.5rem]"
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
                  className="text-crimson underline underline-offset-4"
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
                These details are not a marketing signup. Registration interest
                is a separate form. Contact us below for privacy questions or to
                request deletion of the evaluation identifier associated with
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
            className="ed-link mt-12 text-crimson"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to Home
          </Link>
        </div>
      </section>
    </>
  );
}
