import type { Metadata } from "next";
import Link from "next/link";
import { socialMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/editorial/page-intro";
import { SYLLABUSES } from "@/lib/exam/exam-dates";

const description =
  "Free monthly study plans for O Level 1123, IGCSE 0500, IGCSE 0510/0511 and AS/A Level 9093, with tick boxes that save in your browser.";
export const metadata: Metadata = {
  title: "Free Study Plans",
  description,
  alternates: { canonical: "/study-plan" },
  ...socialMetadata({ title: "Free Study Plans", description, path: "/study-plan" }),
};

export default function StudyPlanIndexPage() {
  return (
    <>
      <PageIntro
        label="Free for every student"
        title="Study plans"
        size="md"
        lead="Choose your syllabus. Tick off each week as you go; your progress stays in your own browser, with no sign-in."
      />
      <section className="ed-paper ed-margin pb-24">
        <div className="ed-wrap">
          <ul className="border-t border-ink/15">
            {SYLLABUSES.map((s) => (
              <li key={s.key} className="border-b border-ink/15">
                <Link href={`/study-plan/${s.key}`} className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-6">
                  <span>
                    <span className="ed-h3 block">{s.name}</span>
                    <span className="text-slate">{s.short} · November 2026 to June 2027</span>
                  </span>
                  <span className="font-semibold text-crimson group-hover:underline">Open plan →</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
