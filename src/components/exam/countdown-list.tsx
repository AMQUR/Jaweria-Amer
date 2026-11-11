"use client";
import Link from "next/link";
import { CalendarPlus, Share2 } from "lucide-react";
import {
  EXAM_SERIES,
  buildIcs,
  daysUntil,
  formatExamDate,
  getSyllabus,
  nearestIndex,
  sortPapers,
  type ExamPaper,
  type SyllabusKey,
} from "@/lib/exam/exam-dates";
import { ENROL_NOW_URL } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useToday } from "@/lib/exam/client-state";

/** Days left per paper. Dates render on the server; day counts fill in on the visitor's device (Pakistan date). */
export function CountdownList({
  syllabus,
  papers: rawPapers,
  actions = true,
}: {
  syllabus: SyllabusKey;
  papers: ExamPaper[];
  actions?: boolean;
}) {
  const today = useToday();
  const papers = sortPapers(rawPapers);
  const s = getSyllabus(syllabus);
  const next = today ? nearestIndex(papers, today) : -1;

  const shareText = `${s.short} exam countdown (Cambridge ${EXAM_SERIES.label})\n${papers
    .map((p) =>
      today
        ? `${p.paper}: ${formatExamDate(p.date)}${daysUntil(p.date, today) >= 0 ? ` (${daysUntil(p.date, today)} days)` : " (done)"}`
        : `${p.paper}: ${formatExamDate(p.date)}`,
    )
    .join("\n")}\nConfirm your start time with your exam centre.\nhttps://jaweriaamer.com/exam-countdown`;

  function downloadIcs() {
    trackEvent("exam_add_to_calendar", { syllabus });
    const url = URL.createObjectURL(new Blob([buildIcs(syllabus, papers)], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `cambridge-${syllabus}-exams.ics`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div>
      <ul className="border-t border-ink/15">
        {papers.map((p, i) => {
          const days = today ? daysUntil(p.date, today) : null;
          const highlight = i === next;
          return (
            <li
              key={p.paper}
              aria-current={highlight ? "date" : undefined}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-ink/15 py-5 sm:py-6",
                highlight && "-mx-4 bg-crimson/[0.06] px-4 shadow-[inset_4px_0_0_var(--color-crimson)] sm:-mx-6 sm:px-6",
              )}
            >
              <div className="min-w-0">
                <p className="ed-h3">
                  {s.short} · {p.paper}
                  {highlight && (
                    <span className="ml-3 align-middle rounded-full bg-crimson px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-paper">
                      Next paper
                    </span>
                  )}
                </p>
                <p className="mt-1 text-slate">
                  {formatExamDate(p.date)} · {p.session} session
                </p>
              </div>
              <div className="text-right" aria-live="polite">
                {days === null ? (
                  <span aria-hidden="true">&nbsp;</span>
                ) : days < 0 ? (
                  <span className="font-semibold text-slate">Paper done</span>
                ) : days === 0 ? (
                  <span className="ed-num text-[2rem] text-crimson">Today</span>
                ) : (
                  <>
                    <span className="ed-num block text-[2.75rem] leading-none text-crimson">{days}</span>
                    <span className="text-sm text-slate">{days === 1 ? "day to go" : "days to go"}</span>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {actions && (
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={downloadIcs} className="ed-btn ed-btn-ink">
            <CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("exam_share_whatsapp", { syllabus })}
            className="ed-btn ed-btn-ink"
          >
            <Share2 className="h-4 w-4" aria-hidden /> Share on WhatsApp
          </a>
          <Link
            href={ENROL_NOW_URL}
            onClick={() => trackEvent("registration_cta_click", { surface: "exam_countdown" })}
            className="ed-btn"
          >
            Join the next batch
          </Link>
        </div>
      )}
    </div>
  );
}
