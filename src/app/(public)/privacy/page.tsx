import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContactEmailLink } from "@/components/contact-email-link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Jaweria Amer collects and uses contact information for course enrollment.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
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
            Last updated: April 14, 2026
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <article className="space-y-8 text-sm leading-relaxed text-slate sm:text-base">
            <p>
              Jaweria Amer uses the contact details you provide (including
              email addresses and WhatsApp numbers) only to respond to
              enquiries, manage course enrollment, and deliver related
              communications about your learning.
            </p>
            <p>
              We do not sell, rent, or share your personal data with third
              parties for marketing or unrelated purposes.
            </p>
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
