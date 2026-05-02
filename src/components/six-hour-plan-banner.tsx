import { Clock, ExternalLink } from "lucide-react";

import { CARD_BASE, CARD_BUTTON, CARD_CONTENT } from "@/components/resource-card-system";

export function SixHourPlanBanner() {
  return (
    <div className={`${CARD_BASE} flex-col gap-5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-500 shadow-md hover:scale-[1.015] hover:shadow-lg hover:shadow-[0_10px_30px_rgba(124,58,237,0.25)] sm:flex-row sm:gap-6`}>
      <div className="min-w-0 flex-1 self-stretch sm:self-auto">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
          <Clock className="h-6 w-6" aria-hidden />
        </div>
        <div className={CARD_CONTENT}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Study Plan
          </p>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">6 Hour Plan</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
            Complete Paper 1 strategy in one day.
          </p>
        </div>
      </div>
      <a
        href="https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/resources/plans/6-hour-plan.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-white text-violet-600 hover:bg-violet-50 sm:w-auto`}
      >
        Open PDF
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
      </a>
    </div>
  );
}
