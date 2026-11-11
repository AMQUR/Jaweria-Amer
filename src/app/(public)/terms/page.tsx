import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";
import Link from "next/link";
import { PageIntro } from "@/components/editorial/page-intro";
import { ArrowLeft } from "lucide-react";
import { ContactEmailLink } from "@/components/contact-email-link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Jaweria Amer: usage of the Free Vault, intellectual property, and how student contact data is handled.",
  alternates: { canonical: "/terms" },
  ...socialMetadata({
    title: "Terms of Service",
    description:
      "Terms of Service for Jaweria Amer: usage of the Free Vault, intellectual property, and how student contact data is handled.",
    path: "/terms",
  }),
};

export default function TermsPage() {
  return (
    <>
      <PageIntro
        size="md"
        label="Legal"
        title="Terms of Service"
        lead="Last updated: April 14, 2026"
      />

      <section className="ed-paper border-t border-ink/10 py-12 sm:py-16">
        <div className="ed-wrap">
          <article className="max-w-[42rem] space-y-9 text-ink-muted">
            <section>
              <h2 className="ed-h3 border-t border-ink/15 pt-7 text-[1.5rem]">
                Usage
              </h2>
              <p className="mt-3 text-[1.0625rem] leading-[1.7]">
                Content in the &quot;Free Vault&quot; is for personal,
                non-commercial use only.
              </p>
            </section>

            <section>
              <h2 className="ed-h3 border-t border-ink/15 pt-7 text-[1.5rem]">
                Copyright
              </h2>
              <p className="mt-3 text-[1.0625rem] leading-[1.7]">
                All course materials, videos, and custom notes are the
                intellectual property of Jaweria Amer. Unauthorized
                distribution or resale is strictly prohibited.
              </p>
            </section>

            <section>
              <h2 className="ed-h3 border-t border-ink/15 pt-7 text-[1.5rem]">
                Privacy
              </h2>
              <p className="mt-3 text-[1.0625rem] leading-[1.7]">
                Student data provided via WhatsApp or email is used solely for
                course enrollment and related communication, and will never be
                shared with third parties.
              </p>
            </section>

            <section>
              <h2 className="ed-h3 border-t border-ink/15 pt-7 text-[1.5rem]">
                Contact
              </h2>
              <p className="mt-3 text-[1.0625rem] leading-[1.7]">
                For questions about these terms: <ContactEmailLink className="font-medium" />.
              </p>
            </section>
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
