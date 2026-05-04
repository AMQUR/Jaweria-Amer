"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, CheckCircle2, Circle, Download, ExternalLink, Trophy } from "lucide-react";

const STORAGE_KEY = "paper1_checklist_progress";
const TOTAL = 16;

const SUPABASE_BASE =
  "https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/resources/rewards";

const CHECKLIST_URL = `${SUPABASE_BASE}/paper1-checklist.png`;
const POKEMON_LOW_URL = `${SUPABASE_BASE}/pokemon-low.png`;
const POKEMON_HIGH_URL = `${SUPABASE_BASE}/pokemon-high.png`;

const SECTIONS = [
  {
    title: "COMPREHENSION — Q1 & Q2",
    xp: "8 XP",
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
    xp: "5 XP",
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
    xp: "2 XP",
    items: [
      "I understand the agree/disagree format — I can read a viewpoint and decide whether I agree or disagree with clear reasoning.",
      "I have read all short response sample answers.",
    ],
  },
  {
    title: "WORKSHEETS",
    xp: "1 XP",
    items: [
      "I have attempted all 5 Paper 1 worksheets (feelings, adjectives, writer's effect, impressions and rewording).",
    ],
  },
];

function loadProgress(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { completed: number[]; total: number };
    return Array.isArray(parsed.completed) ? parsed.completed : [];
  } catch {
    return [];
  }
}

function saveProgress(completed: number[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed, total: TOTAL }));
}

async function downloadFromUrl(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch {
    window.open(url, "_blank");
  }
}

export function Paper1ChecklistBanner() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCompleted(loadProgress());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveProgress(completed);
  }, [completed, mounted]);

  const completedCount = completed.length;
  const progressPercent = Math.round((completedCount / TOTAL) * 100);
  const isUnlocked = progressPercent >= 50;

  function toggleItem(globalIndex: number) {
    setCompleted((prev) =>
      prev.includes(globalIndex)
        ? prev.filter((i) => i !== globalIndex)
        : [...prev, globalIndex],
    );
  }

  return (
    <>
      {/* ── BANNER CARD ── */}
      <div className="rounded-2xl border border-yellow-300/40 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 p-6 shadow-md transition-all duration-200 hover:scale-[1.01] hover:shadow-lg">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
          {/* Left: pokemon image */}
          <div className="flex shrink-0 justify-center sm:justify-start">
            <div className="relative h-28 w-20 overflow-hidden rounded-xl shadow-md ring-2 ring-yellow-300/60 sm:h-32 sm:w-24">
              {mounted ? (
                <Image
                  src={isUnlocked ? POKEMON_HIGH_URL : POKEMON_LOW_URL}
                  alt={isUnlocked ? "Reward unlocked!" : "Keep going!"}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="h-full w-full animate-pulse bg-yellow-200/60" />
              )}
            </div>
          </div>

          {/* Middle: text + progress */}
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-600/80">
              Exam Prep Checklist
            </p>
            <h2 className="mt-0.5 text-xl font-semibold text-amber-900 sm:text-2xl">
              Paper 1 — Gotta Pass &apos;Em All
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-amber-800/70">
              {isUnlocked
                ? "Unlocked — you're on track for an A*"
                : "You're getting there — keep going"}
            </p>

            {/* Progress bar */}
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-amber-700/70">
                  {mounted ? `${completedCount} / ${TOTAL} Completed` : `0 / ${TOTAL} Completed`}
                </span>
                <span className="text-xs font-bold text-amber-800">
                  {mounted ? `${progressPercent}%` : "0%"}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500 ease-out"
                  style={{ width: mounted ? `${progressPercent}%` : "0%" }}
                />
              </div>
            </div>
          </div>

          {/* Right: buttons */}
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <button
              onClick={() => setModalOpen(true)}
              className="flex h-10 items-center gap-2 rounded-full bg-amber-500 px-4 text-sm font-medium text-white transition hover:bg-amber-600"
            >
              {isUnlocked ? (
                <>
                  <Trophy className="h-4 w-4" aria-hidden />
                  View Checklist
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" aria-hidden />
                  View Checklist
                </>
              )}
            </button>

            {isUnlocked && mounted && (
              <>
                <button
                  onClick={() => downloadFromUrl(CHECKLIST_URL, "paper1-checklist.png")}
                  className="flex h-10 items-center gap-2 rounded-full border border-amber-300 bg-white px-4 text-sm font-medium text-amber-700 transition hover:bg-amber-50"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download Checklist
                </button>
                <button
                  onClick={() => downloadFromUrl(POKEMON_HIGH_URL, "paper1-reward-card.png")}
                  className="flex h-10 items-center gap-2 rounded-full border border-yellow-300 bg-white px-4 text-sm font-medium text-yellow-700 transition hover:bg-yellow-50"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download Reward Card
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── CHECKLIST MODAL ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Paper 1 Checklist"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
            aria-hidden
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)] max-h-[90dvh] animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="shrink-0 rounded-t-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                    Exam prep
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-white">
                    Paper 1 — Gotta Pass &apos;Em All
                  </h2>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25"
                  aria-label="Close checklist"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-100/90">Progress</span>
                  <span className="text-xs font-bold text-white">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-amber-100/70">
                  {completedCount} of {TOTAL} tasks complete
                  {isUnlocked && " — Reward Unlocked!"}
                </p>
              </div>
            </div>

            {/* Scrollable items */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {(() => {
                let globalIndex = 0;
                return SECTIONS.map((section, si) => (
                  <div key={si}>
                    <div className="mb-3 flex items-center gap-2">
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">
                        {section.title}
                      </p>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                        {section.xp}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {section.items.map((item) => {
                        const idx = globalIndex++;
                        const isChecked = completed.includes(idx);
                        return (
                          <li key={idx}>
                            <button
                              onClick={() => toggleItem(idx)}
                              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150 ${
                                isChecked
                                  ? "border-amber-200 bg-amber-50"
                                  : "border-border/60 bg-white hover:border-amber-200/60 hover:bg-amber-50/40"
                              }`}
                            >
                              {isChecked ? (
                                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden />
                              ) : (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" aria-hidden />
                              )}
                              <span
                                className={`text-sm leading-snug transition-all duration-150 ${
                                  isChecked ? "text-amber-700/60 line-through" : "text-ink"
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
              {isUnlocked ? (
                <button
                  onClick={() => downloadFromUrl(POKEMON_HIGH_URL, "paper1-reward-card.png")}
                  className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
                >
                  <Download className="h-4 w-4" aria-hidden />
                  Download Reward Card
                </button>
              ) : (
                <p className="text-[11px] font-medium text-amber-600">
                  Reach 50% to unlock your reward
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
