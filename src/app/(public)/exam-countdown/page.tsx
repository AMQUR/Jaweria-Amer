import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/editorial/page-intro";
import { CountdownPicker } from "@/components/exam/countdown-picker";
import { EXAM_SERIES } from "@/lib/exam/exam-dates";
import { getTimetable } from "@/lib/exam/timetable";

export const revalidate = 120;

const description =
  "Pick your Cambridge English syllabus and see the days left to each June 2027 paper. Free, with calendar and WhatsApp sharing.";
export const metadata: Metadata = {
  title: "Cambridge Exam Countdown",
  description,
  alternates: { canonical: "/exam-countdown" },
  ...socialMetadata({ title: "Cambridge Exam Countdown", description, path: "/exam-countdown" }),
};

export default async function ExamCountdownPage() {
  const { timetable } = await getTimetable();
  return (
    <>
      <PageIntro
        label={`Cambridge ${EXAM_SERIES.label} · Zone ${EXAM_SERIES.zone}`}
        title="Exam countdown"
        size="md"
        lead="Choose your syllabus to see how many days are left to each paper. Dates are shown for the morning session in Pakistan."
      />
      <section className="ed-paper ed-margin pb-24">
        <div className="ed-wrap">
          <p
            role="note"
            className="mb-10 border-l-4 border-crimson bg-crimson/[0.06] p-4 text-[1.0625rem] font-semibold leading-snug text-ink sm:p-5"
          >
            {EXAM_SERIES.centreNote}
          </p>
          <CountdownPicker timetable={timetable} />
          <p className="mt-10 max-w-2xl text-[0.875rem] leading-relaxed text-slate">
            Day counts use the Pakistan calendar date (PKT, UTC+5). Dates follow the Cambridge June 2027 Zone 4
            timetable; Cambridge may update it, so check with your exam centre.
          </p>
        </div>
      </section>
    </>
  );
}
