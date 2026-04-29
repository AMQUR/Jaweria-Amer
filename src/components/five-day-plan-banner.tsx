import { CalendarDays, ExternalLink } from "lucide-react";

export function FiveDayPlanBanner() {
  return (
    <div className="rounded-2xl border border-[#fecaca] bg-[#fef2f2] p-6 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fee2e2] text-[#dc2626]">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#991b1b]/70">
              Study Plan
            </p>
            <h2 className="text-xl font-semibold text-gray-900">5-Day Plan – Paper 1</h2>
            <p className="mt-0.5 text-sm text-gray-600">
              Structured daily plan to prepare effectively
            </p>
          </div>
        </div>
        <a
          href="/resources/notes/5-day-plan-paper-1.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#dc2626] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#b91c1c] active:scale-95"
        >
          Open PDF
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}
