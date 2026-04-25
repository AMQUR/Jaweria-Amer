"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { ChecklistModal } from "@/components/checklist-modal";

export function ChecklistBanner() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <div
        onClick={() => router.push("/resources/view/final-p2-checklist")}
        className="cursor-pointer rounded-2xl border border-amber-300/40 bg-gradient-to-br from-[#92400e] via-[#b45309] to-[#d97706] p-6 shadow-[0_8px_30px_rgba(180,83,9,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(180,83,9,0.4)]"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
              <ClipboardCheck className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                Interactive
              </p>
              <h2 className="mt-0.5 font-serif text-xl font-semibold text-white">
                Last Minute P2 – Writing Revision Guide
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-amber-100/80">
                Track your preparation and complete everything before exam day.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push("/resources/view/final-p2-checklist");
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#92400e] shadow-sm transition-all duration-200 hover:bg-amber-50 hover:shadow-md active:scale-95"
            >
              Open Guide
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-transparent px-5 py-2 text-xs font-medium text-white/90 transition-all duration-200 hover:border-white/50 hover:bg-white/10 active:scale-95"
            >
              Track Your Progress
            </button>
          </div>
        </div>
      </div>

      <ChecklistModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
