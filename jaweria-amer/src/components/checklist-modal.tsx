"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, CheckCircle2, Circle } from "lucide-react";
import { checklistItems } from "@/lib/checklist-data";

const STORAGE_KEY = "exam-checklist";

interface ChecklistModalProps {
  open: boolean;
  onClose: () => void;
}

export function ChecklistModal({ open, onClose }: ChecklistModalProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as Record<string, boolean>) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const total = checklistItems.length;
  const completed = Object.values(checked).filter(Boolean).length;
  const progress = Math.round((completed / total) * 100);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Last 5-Day Exam Checklist"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-r from-[#92400e] via-[#b45309] to-[#d97706] px-6 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/80">
                Exam prep
              </p>
              <h2 className="mt-1 font-serif text-xl font-bold text-white">
                Last 5-Day Exam Checklist
              </h2>
            </div>
            <button
              onClick={onClose}
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25"
              aria-label="Close checklist"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs font-medium text-amber-100/90">Progress</span>
              <span className="text-xs font-bold text-white">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-amber-100/70">
              {completed} of {total} tasks complete
            </p>
          </div>
        </div>

        {/* Checklist items */}
        <div className="px-6 py-4">
          <ul className="space-y-2">
            {checklistItems.map((item, i) => (
              <li key={item.id}>
                <button
                  onClick={() => toggle(item.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                    checked[item.id]
                      ? "border-amber-200 bg-amber-50 text-[#92400e]"
                      : "border-border/60 bg-white text-ink hover:border-amber-200/60 hover:bg-amber-50/40"
                  }`}
                >
                  {checked[item.id] ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-[#d97706]" aria-hidden />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-slate-light" aria-hidden />
                  )}
                  <span
                    className={`text-sm font-medium leading-snug transition-all duration-150 ${
                      checked[item.id] ? "line-through opacity-60" : ""
                    }`}
                  >
                    <span className="mr-1.5 text-[11px] font-semibold text-slate-light">
                      Day {i + 1}
                    </span>
                    {item.text}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 rounded-b-2xl border-t border-border/40 bg-cream px-6 py-4">
          <Link
            href="/resources/view/last-5-day-plan"
            onClick={onClose}
            className="text-sm font-medium text-[#b45309] underline-offset-2 hover:underline"
          >
            View Full Plan →
          </Link>
          {progress === 100 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-[#92400e]">
              All done! Good luck 🎯
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
