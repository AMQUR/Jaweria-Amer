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
        className="cursor-pointer rounded-2xl bg-gradient-to-r from-[#f97316] via-[#ea580c] to-[#c2410c] px-6 py-5 shadow-xl transition-all duration-300 hover:shadow-2xl"
      >
        <div className="flex min-h-[90px] flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <ClipboardCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/70">Interactive</p>
              <h2 className="text-xl font-semibold text-white">Paper 2 Writing Checklist</h2>
              <p className="mt-0.5 text-sm text-white/80">
                Track your preparation and complete everything before exam day.
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-[#7c2d12] transition hover:bg-orange-100 active:scale-95"
          >
            Start Checklist
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <ChecklistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
