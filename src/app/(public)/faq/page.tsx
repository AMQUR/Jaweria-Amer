import type { Metadata } from "next";
import Link from "next/link";
import { socialMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/editorial/page-intro";
import { FAQ_GROUPS, YOUTUBE_CHANNEL_URL } from "@/lib/faq";
import { ENROL_NOW_URL, getWhatsAppUrl } from "@/lib/contact";

const description =
  "Answers about Miss Jay's online Cambridge English courses: syllabuses, registration, class schedules, LMS access, resources, feedback and recordings.";
export const metadata: Metadata = {
  title: "FAQ",
  description,
  alternates: { canonical: "/faq" },
  ...socialMetadata({ title: "FAQ", description, path: "/faq" }),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((g) =>
    g.items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  ),
};

export default function FaqPage() {
  return (
    <>
      <PageIntro label="Help" title="Questions, answered" size="md" lead="Everything students and parents ask most. Anything else, message Miss Jay directly." />
      <section className="ed-paper ed-margin pb-24">
        <div className="ed-wrap max-w-3xl">
          {FAQ_GROUPS.map((g) => (
            <div key={g.title} className="mt-12 first:mt-0">
              <h2 className="ed-label">{g.title}</h2>
              <div className="mt-4 border-t border-ink/15">
                {g.items.map((item) => (
                  <details key={item.q} className="group border-b border-ink/15">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.0625rem] font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span aria-hidden="true" className="text-2xl font-light text-crimson transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="pb-5 leading-relaxed text-slate">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
          <p className="mt-12 text-slate">
            More free lessons on YouTube:{" "}
            <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noopener noreferrer" className="text-crimson underline underline-offset-4">
              @englishwithmissjay
            </a>
            .
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={ENROL_NOW_URL} className="ed-btn ed-btn-lg">Join the next batch</Link>
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-ink ed-btn-lg">Ask on WhatsApp</a>
          </div>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
