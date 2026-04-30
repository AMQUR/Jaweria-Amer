import { CalendarDays, ExternalLink } from "lucide-react";

import { CARD_BASE, CARD_BUTTON, CARD_CONTENT } from "@/components/resource-card-system";

export function FiveDayPlanBanner() {
  return (
    <div className={`${CARD_BASE} flex-col gap-5 bg-gradient-to-r from-red-500 to-red-600 text-white border border-red-400 shadow-md hover:scale-[1.015] hover:shadow-lg hover:shadow-[0_10px_30px_rgba(239,68,68,0.25)] sm:flex-row sm:gap-6`}>
      <div className="min-w-0 flex-1 self-stretch sm:self-auto">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
          <CalendarDays className="h-6 w-6" aria-hidden />
        </div>
        <div className={CARD_CONTENT}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Study Plan
          </p>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">5-Day Plan - Paper 1</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Structured daily plan to prepare effectively.
          </p>
        </div>
      </div>
      <a
        href="/resources/notes/5-day-plan-paper-1.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-white text-red-600 hover:bg-red-50 sm:w-auto`}
      >
        Open PDF
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
      </a>
    </div>
  );
}
