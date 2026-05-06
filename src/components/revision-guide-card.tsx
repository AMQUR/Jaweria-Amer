import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export function RevisionGuideCard() {
  return (
    <Link
      href="/resources/view/final-p2-checklist"
      className="block rounded-2xl border border-[#f59e0b] bg-gradient-to-r from-[#fff7ed] via-[#ffedd5] to-[#fdba74] px-6 py-5 shadow-xl transition-all duration-300 hover:shadow-2xl"
    >
      <div className="flex min-h-[90px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-orange-600">Revision Guide</p>
            <h2 className="text-xl font-semibold text-gray-900">
              Last Minute P2 – Writing Revision Guide
            </h2>
            <p className="mt-0.5 text-sm text-gray-600">
              Open the complete PDF guide in the resource viewer.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#ea580c] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#c2410c] active:scale-95">
          Open Guide
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
