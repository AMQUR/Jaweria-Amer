import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";

const VAULT_HREF = "/resources/view/final-p2-checklist";

export function FileVaultCard() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d]/10 via-[#be123c]/10 to-[#fda4af]/10 p-6 shadow-md transition-all duration-300 hover:scale-[1.01] hover:shadow-xl motion-reduce:transition-shadow motion-reduce:hover:scale-100 sm:p-8 md:p-10">
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-200/25 via-transparent to-amber-100/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-[#fecdd3]/30 via-transparent to-[#be123c]/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center md:gap-12">
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#7f1d1d]/15 text-[#7f1d1d] ring-1 ring-[#fecdd3]/30 sm:h-14 sm:w-14">
            <FolderOpen className="h-6 w-6 sm:h-7 sm:w-7" aria-hidden />
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#7f1d1d]/70 sm:text-[13px]">File vault</p>
          <h2 className="mt-3 font-serif text-2xl font-bold leading-tight text-[#4c0519] sm:text-3xl md:text-4xl">
            Last Minute P2 – Writing Revision Guide
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base sm:text-lg">
            Open the PDF in the same built-in viewer as other resources — download or read in-page.
          </p>
        </div>
        <div className="shrink-0 md:pt-2">
          <Link
            href={VAULT_HREF}
            className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#fecdd3]/40 bg-white/90 px-6 py-3.5 text-base font-semibold text-[#7f1d1d] shadow-[0_4px_14px_rgba(127,29,29,0.12)] transition-all duration-300 hover:border-[#fda4af]/60 hover:bg-white hover:shadow-[0_8px_24px_rgba(127,29,29,0.2)] active:scale-[0.98] md:inline-flex md:w-auto md:min-w-[200px]"
          >
            Open
            <ArrowRight className="h-[1.125rem] w-[1.125rem] shrink-0 opacity-90" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
