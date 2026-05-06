import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

import { PrefetchResourceViewAction } from "@/components/prefetch-resource-view-action";

const BULLETS = [
  "Paper pattern explained",
  "Directed writing mastery",
  "Essay structures",
  "Examiner insights",
];

export function MarathonBanner() {
  return (
    <PrefetchResourceViewAction resourceId="paper-2-marathon">
      <Link
        href="/resources/view/paper-2-marathon"
        className="block rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#9f1239] to-[#be123c] p-8 shadow-md transition-all duration-300 hover:shadow-xl sm:p-10"
      >
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Miss Jay · Paper 2
              </p>
              <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                FREE
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">
              Paper 2 Marathon – Miss Jay
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-white/75">
              Complete walkthrough for Paper 2 writing mastery
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="h-[3px] w-[3px] shrink-0 rounded-full bg-rose-300" aria-hidden />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-white px-6 py-3 text-sm font-medium text-rose-800 shadow-md transition hover:bg-rose-50 active:scale-95">
          Open PDF
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
    </PrefetchResourceViewAction>
  );
}
