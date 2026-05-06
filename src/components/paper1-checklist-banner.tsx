"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, CheckCircle2, Circle, ClipboardCheck } from "lucide-react";
import { CARD_BASE, CARD_BUTTON, CARD_CONTENT } from "@/components/resource-card-system";

const STORAGE_KEY = "paper1_checklist_progress";
const TOTAL = 16;

const POKEMON_LOW = "/assets/pokemon-low.png";
const POKEMON_HIGH = "/assets/pokemon-high.png";

const SECTIONS = [
  {
    title: "COMPREHENSION — Q1 & Q2",
    tag: "8 XP",
    items: [
      "I know the difference between explicit questions (find it directly in the text) and implicit questions (read between the lines — what is suggested but not stated).",
      "I can answer synonym questions correctly — one word that means the same as the given word in context.",
      "I have gone through the feelings reference sheet and can confidently name feelings using precise synonyms (not just \"happy,\" \"sad,\" or \"angry\").",
      "I can identify a character's feeling AND provide 2 supporting details from the text to prove it.",
      "I know the 5 types of Q2 questions and how each one is answered: Two-words comparison • Impressions • Writer's effect (LM → Association → Result) • Language effectively • Suggestion (what the writer implies, not states).",
      "I know the result adjectives from the 8 situational clusters and when to use them.",
      "I keep my answers concise — no unnecessary info for explicit answers, no copying phrases for implicit answers.",
      "I have attempted at least the last 2 years' comprehension papers and checked my answers against the mark scheme.",
    ],
  },
  {
    title: "SUMMARY — Q3(a)",
    tag: "5 XP",
    items: [
      "I know the summary rules: 150 words max, continuous writing, own words, no note form, no copying.",
      "I can scan a text and pick out 10+ content points relevant to what the question asks — not everything in the text.",
      "I can paraphrase content points in my own words without lifting phrases from the text.",
      "I have read all sample summaries.",
      "I have attempted at least 2 summary questions under timed conditions.",
    ],
  },
  {
    title: "INTERVIEWER'S QUESTION — Q3(b)",
    tag: "2 XP",
    items: [
      "I understand the agree/disagree format — I can read a viewpoint and decide whether I agree or disagree with clear reasoning.",
      "I have read all short response sample answers.",
    ],
  },
  {
    title: "WORKSHEETS",
    tag: "1 XP",
    items: [
      "I have attempted all 5 Paper 1 worksheets (feelings, adjectives, writer's effect, impressions and rewording).",
    ],
  },
] as const;

function loadSaved(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { completed?: unknown };
    return Array.isArray(parsed.completed) ? (parsed.completed as number[]) : [];
  } catch {
    return [];
  }
}

function persist(completed: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed }));
}

export function Paper1ChecklistBanner() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewardPercent, setRewardPercent] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCompleted(loadSaved());
  }, []);

  function toggle(idx: number) {
    setCompleted((prev) => {
      const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
      persist(next);
      return next;
    });
  }

  function handleSubmit() {
    const pct = (completed.length / TOTAL) * 100;
    setRewardPercent(pct);
    setChecklistOpen(false);
    setRewardOpen(true);
  }

  const completedCount = completed.length;
  const progressPct = Math.round((completedCount / TOTAL) * 100);
  const isHigh = rewardPercent >= 50;
  const rewardSrc = isHigh ? POKEMON_HIGH : POKEMON_LOW;

  return (
    <>
      {/* ── CLEAN BANNER ── */}
      <div
        className={`${CARD_BASE} flex-col gap-5 border border-amber-200/60 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 shadow-sm hover:scale-[1.015] hover:shadow-md sm:flex-row sm:gap-6`}
      >
        <div className="min-w-0 flex-1 self-stretch sm:self-auto">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <ClipboardCheck className="h-6 w-6" aria-hidden />
          </div>
          <div className={CARD_CONTENT}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600/80">
              Exam Prep
            </p>
            <h2 className="text-xl font-semibold text-amber-900 sm:text-2xl">
              Paper 1 Checklist
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-amber-800/70 sm:text-base">
              Track your prep. Complete the checklist.
            </p>
          </div>
        </div>
        <button
          onClick={() => setChecklistOpen(true)}
          className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-amber-500 text-white hover:bg-amber-600 sm:w-auto`}
        >
          Start Checklist
        </button>
      </div>

      {/* ── CHECKLIST MODAL ── */}
      {checklistOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Paper 1 Checklist"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setChecklistOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
            {/* Header */}
            <div className="shrink-0 rounded-t-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                    Exam prep
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-white">
                    Paper 1 Checklist
                  </h2>
                </div>
                <button
                  onClick={() => setChecklistOpen(false)}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-100/90">Progress</span>
                  <span className="text-xs font-bold text-white">{progressPct}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-amber-100/70">
                  {completedCount} of {TOTAL} tasks complete
                </p>
              </div>
            </div>

            {/* Scrollable items */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {(() => {
                let idx = 0;
                return SECTIONS.map((section, si) => (
                  <div key={si}>
                    <div className="mb-3 flex items-center gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">
                        {section.title}
                      </p>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        {section.tag}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {section.items.map((item) => {
                        const i = idx++;
                        const checked = completed.includes(i);
                        return (
                          <li key={i}>
                            <button
                              onClick={() => toggle(i)}
                              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                                checked
                                  ? "border-amber-200 bg-amber-50"
                                  : "border-border/60 bg-white hover:border-amber-200/60 hover:bg-amber-50/40"
                              }`}
                            >
                              {checked ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                              )}
                              <span
                                className={`text-sm leading-snug ${
                                  checked ? "text-amber-700/60 line-through" : "text-ink"
                                }`}
                              >
                                {item}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ));
              })()}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border/40 bg-cream px-6 py-4">
              <p className="text-[11px] text-slate-400">{completedCount} of {TOTAL} complete</p>
              <button
                onClick={handleSubmit}
                className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 active:scale-95"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REWARD MODAL ── */}
      {rewardOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Your reward"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setRewardOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 flex w-full max-w-sm flex-col items-center animate-in fade-in zoom-in-95 duration-300 rounded-2xl bg-white px-8 py-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.28)]">
            <button
              onClick={() => setRewardOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>

            {/* Score */}
            <p className="text-5xl font-black leading-none text-amber-500">
              {Math.round(rewardPercent)}%
            </p>
            <h2 className="mt-3 text-xl font-bold text-ink">
              {isHigh ? "You're on track for an A*" : "You're close — keep pushing"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isHigh
                ? "Great prep. Stay consistent and finish strong."
                : "Complete more tasks before exam day."}
            </p>

            {/* Animated card */}
            <div
              ref={cardRef}
              className={`reward-reveal mt-6 w-full max-w-[260px] ${!isHigh ? "card-shake" : ""}`}
              style={{
                borderRadius: "1rem",
                boxShadow: isHigh
                  ? "0 0 0 2px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.35), 0 16px 40px rgba(0,0,0,0.18)"
                  : "0 0 0 2px rgba(239,68,68,0.3), 0 0 24px rgba(239,68,68,0.2), 0 16px 40px rgba(0,0,0,0.15)",
              }}
            >
              <Image
                src={rewardSrc}
                alt={isHigh ? "Reward unlocked — you're on track!" : "Keep going!"}
                width={520}
                height={726}
                className="w-full rounded-2xl"
                priority
              />
            </div>

            <button
              onClick={() => setRewardOpen(false)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 active:scale-95"
            >
              Done
            </button>

            {isHigh && (
              <button
                onClick={() => {
                  setRewardOpen(false);
                  setChecklistOpen(true);
                }}
                className="mt-3 text-xs text-slate-400 underline underline-offset-2 transition hover:text-slate-600"
              >
                Go back to checklist
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
