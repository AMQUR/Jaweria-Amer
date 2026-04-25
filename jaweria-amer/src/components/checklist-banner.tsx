"use client";

import { useState } from "react";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { ChecklistModal } from "@/components/checklist-modal";

export function ChecklistBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group cursor-pointer rounded-2xl border border-[#fecdd3]/20 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c] p-8 shadow-xl transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl sm:p-10"
      >
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-center md:gap-12">
          <div className="min-w-0 flex-1">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-transform duration-300 group-hover:scale-110">
              <ClipboardCheck className="h-7 w-7" aria-hidden />
            </div>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/60">
              Interactive
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              Paper 2 Writing Checklist
            </h2>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/80">
              Track your preparation and complete everything before exam day.
            </p>
          </div>
          <div className="shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-white px-6 py-3 text-base font-medium text-[#7f1d1d] transition-all duration-200 hover:bg-[#ffe4e6] hover:scale-[1.03] active:scale-[0.98] sm:w-auto"
            >
              Start Checklist
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          </div>
        </div>
      </div>

      <ChecklistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
