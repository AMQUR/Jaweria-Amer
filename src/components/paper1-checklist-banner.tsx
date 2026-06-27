"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { X, CheckCircle2, Circle, ClipboardCheck, CheckCircle, XCircle } from "lucide-react";
import { CARD_BASE, CARD_BUTTON, CARD_CONTENT } from "@/components/resource-card-system";
import {
  READINESS_QUIZ_SECTIONS,
  READINESS_QUIZ_THRESHOLD,
  READINESS_QUIZ_TOTAL,
  readinessQuizQuestions,
  type ReadinessQuizSectionId,
} from "@/lib/readiness-quiz-data";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "paper1_checklist_progress";

const POKEMON_LOW = "/assets/pokemon-low.png";
const POKEMON_HIGH = "/assets/pokemon-high.png";

interface SavedProgress {
  answers?: Record<string, number>;
  submitted?: boolean;
}

function loadSaved(): SavedProgress {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as SavedProgress & { completed?: unknown };
    // Legacy checklist shape — ignore completed indices
    if (Array.isArray(parsed.completed)) return {};
    return {
      answers: parsed.answers ?? {},
      submitted: parsed.submitted ?? false,
    };
  } catch {
    return {};
  }
}

function persist(data: SavedProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function computeScore(answers: Record<number, number>): number {
  return readinessQuizQuestions.reduce(
    (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
    0
  );
}

export function Paper1ChecklistBanner() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizOpen, setQuizOpen] = useState(false);
  const [rewardOpen, setRewardOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rewardPercent, setRewardPercent] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadSaved();
    const parsedAnswers: Record<number, number> = {};
    if (saved.answers) {
      for (const [key, value] of Object.entries(saved.answers)) {
        parsedAnswers[Number(key)] = value;
      }
    }
    setAnswers(parsedAnswers);
    setSubmitted(saved.submitted ?? false);
    if (saved.submitted && Object.keys(parsedAnswers).length > 0) {
      const score = computeScore(parsedAnswers);
      setRewardPercent(Math.round((score / READINESS_QUIZ_TOTAL) * 100));
    }
  }, []);

  function selectAnswer(questionIndex: number, optionIndex: number) {
    if (submitted) return;
    setAnswers((prev) => {
      const next = { ...prev, [questionIndex]: optionIndex };
      persist({ answers: Object.fromEntries(Object.entries(next)), submitted: false });
      return next;
    });
  }

  function handleSubmit() {
    const score = computeScore(answers);
    const pct = Math.round((score / READINESS_QUIZ_TOTAL) * 100);
    setRewardPercent(pct);
    setSubmitted(true);
    persist({
      answers: Object.fromEntries(Object.entries(answers)),
      submitted: true,
    });
    setQuizOpen(false);
    setRewardOpen(true);
  }

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / READINESS_QUIZ_TOTAL) * 100);
  const allAnswered = answeredCount === READINESS_QUIZ_TOTAL;
  const isReady = rewardPercent >= READINESS_QUIZ_THRESHOLD;
  const rewardSrc = isReady ? POKEMON_HIGH : POKEMON_LOW;

  const questionsBySection = useMemo(() => {
    const map = new Map<ReadinessQuizSectionId, { index: number; question: (typeof readinessQuizQuestions)[0] }[]>();
    for (const section of READINESS_QUIZ_SECTIONS) {
      map.set(section.id, []);
    }
    readinessQuizQuestions.forEach((q, index) => {
      map.get(q.section)?.push({ index, question: q });
    });
    return map;
  }, []);

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
              Batch readiness
            </p>
            <h2 className="text-xl font-semibold text-amber-900 sm:text-2xl">
              Are you ready for the October/November batch?
            </h2>
            <p className="max-w-2xl text-sm leading-relaxed text-amber-800/70 sm:text-base">
              Run the readiness check. Score 80% or more and you&apos;re set for Oct/Nov — below that and May/June is the smarter call.
            </p>
          </div>
        </div>
        <button
          onClick={() => setQuizOpen(true)}
          className={`${CARD_BUTTON} w-full shrink-0 justify-center bg-amber-500 text-white hover:bg-amber-600 sm:w-auto`}
        >
          Check my readiness
        </button>
      </div>

      {/* ── QUIZ MODAL ── */}
      {quizOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="October/November Readiness Quiz"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setQuizOpen(false)}
            aria-hidden
          />
          <div className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col animate-in fade-in zoom-in-95 duration-200 rounded-2xl bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
            {/* Header */}
            <div className="shrink-0 rounded-t-2xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-500 px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-100/80">
                    Batch readiness
                  </p>
                  <h2 className="mt-1 font-serif text-xl font-bold text-white">
                    October/November Readiness Check
                  </h2>
                </div>
                <button
                  onClick={() => setQuizOpen(false)}
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition-colors hover:bg-white/25"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-xs font-medium text-amber-100/90">
                    {submitted ? "Score" : "Progress"}
                  </span>
                  <span className="text-xs font-bold text-white">
                    {submitted ? `${rewardPercent}%` : `${progressPct}%`}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${submitted ? rewardPercent : progressPct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-amber-100/70">
                  {submitted
                    ? `${computeScore(answers)} of ${READINESS_QUIZ_TOTAL} correct`
                    : `${answeredCount} of ${READINESS_QUIZ_TOTAL} answered`}
                </p>
              </div>
            </div>

            {/* Scrollable questions */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              {READINESS_QUIZ_SECTIONS.map((section) => {
                const items = questionsBySection.get(section.id) ?? [];
                if (!items.length) return null;

                return (
                  <div key={section.id}>
                    <div className="mb-3">
                      <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-amber-700">
                        {section.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">
                        {section.instruction}
                      </p>
                    </div>
                    <ul className="space-y-4">
                      {items.map(({ index, question: q }) => {
                        const selected = answers[index];
                        const isCorrect = submitted && selected === q.answer;
                        const isWrong =
                          submitted && selected !== undefined && selected !== q.answer;

                        return (
                          <li
                            key={index}
                            className={cn(
                              "rounded-xl border px-4 py-3 transition-all duration-150",
                              !submitted && "border-border/60 bg-white",
                              isCorrect && "border-green-200 bg-green-50/60",
                              isWrong && "border-red-200 bg-red-50/60"
                            )}
                          >
                            <div className="mb-3 flex items-start gap-2">
                              <span
                                className={cn(
                                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
                                  !submitted && "bg-amber-500",
                                  isCorrect && "bg-green-600",
                                  isWrong && "bg-red-600"
                                )}
                              >
                                {index + 1}
                              </span>
                              <p className="whitespace-pre-line text-sm leading-snug text-ink">
                                {q.question}
                              </p>
                            </div>

                            <div className="space-y-2 pl-8" role="radiogroup">
                              {q.options.map((option, optIdx) => {
                                const isSelected = selected === optIdx;
                                const isCorrectOpt = submitted && optIdx === q.answer;
                                const isWrongSelected =
                                  submitted && isSelected && optIdx !== q.answer;

                                return (
                                  <button
                                    key={optIdx}
                                    type="button"
                                    role="radio"
                                    aria-checked={isSelected}
                                    onClick={() => selectAnswer(index, optIdx)}
                                    disabled={submitted}
                                    className={cn(
                                      "flex w-full items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-all duration-150",
                                      !submitted &&
                                        !isSelected &&
                                        "border-border/60 bg-white hover:border-amber-200/60 hover:bg-amber-50/40",
                                      !submitted &&
                                        isSelected &&
                                        "border-amber-300 bg-amber-50",
                                      isCorrectOpt &&
                                        "border-green-400 bg-green-100 text-green-900",
                                      isWrongSelected &&
                                        "border-red-400 bg-red-100 text-red-900",
                                      submitted &&
                                        !isSelected &&
                                        !isCorrectOpt &&
                                        "border-border/40 opacity-60"
                                    )}
                                  >
                                    {!submitted ? (
                                      isSelected ? (
                                        <CheckCircle2
                                          className="h-4 w-4 shrink-0 text-amber-500"
                                          aria-hidden
                                        />
                                      ) : (
                                        <Circle
                                          className="h-4 w-4 shrink-0 text-slate-300"
                                          aria-hidden
                                        />
                                      )
                                    ) : isCorrectOpt ? (
                                      <CheckCircle
                                        className="h-4 w-4 shrink-0 text-green-600"
                                        aria-hidden
                                      />
                                    ) : isWrongSelected ? (
                                      <XCircle
                                        className="h-4 w-4 shrink-0 text-red-600"
                                        aria-hidden
                                      />
                                    ) : (
                                      <Circle
                                        className="h-4 w-4 shrink-0 text-slate-300"
                                        aria-hidden
                                      />
                                    )}
                                    <span className="flex-1">{option}</span>
                                  </button>
                                );
                              })}
                            </div>

                            {submitted && (
                              <p
                                className={cn(
                                  "mt-3 rounded-lg px-3 py-2 pl-8 text-xs leading-relaxed",
                                  isCorrect && "bg-green-100/70 text-green-900",
                                  isWrong && "bg-red-100/70 text-red-900"
                                )}
                              >
                                <span className="font-semibold">
                                  {isCorrect ? "Correct. " : "Incorrect. "}
                                </span>
                                {q.explanation}
                              </p>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="shrink-0 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border/40 bg-cream px-6 py-4">
              <p className="text-[11px] text-slate-400">
                {submitted
                  ? `${computeScore(answers)} / ${READINESS_QUIZ_TOTAL} correct`
                  : `${answeredCount} of ${READINESS_QUIZ_TOTAL} answered`}
              </p>
              {submitted ? (
                <button
                  onClick={() => {
                    setQuizOpen(false);
                    setRewardOpen(true);
                  }}
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-amber-600 active:scale-95"
                >
                  View result
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={cn(
                    "rounded-xl px-5 py-2 text-sm font-semibold text-white transition-colors active:scale-95",
                    allAnswered
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "cursor-not-allowed bg-slate-300"
                  )}
                >
                  Submit
                </button>
              )}
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

            <p className="text-5xl font-black leading-none text-amber-500">
              {Math.round(rewardPercent)}%
            </p>
            <h2 className="mt-3 text-xl font-bold text-ink">
              {isReady
                ? "You are ready to appear in the October/November batch."
                : "You should opt for the May/June batch."}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isReady
                ? "Strong prep. Lock in your place and finish strong with the guided batch."
                : "A little more time will pay off. Build your foundations and aim for May/June."}
            </p>

            <div
              ref={cardRef}
              className={`reward-reveal mt-6 w-full max-w-[260px] ${!isReady ? "card-shake" : ""}`}
              style={{
                borderRadius: "1rem",
                boxShadow: isReady
                  ? "0 0 0 2px rgba(234,179,8,0.4), 0 0 40px rgba(234,179,8,0.35), 0 16px 40px rgba(0,0,0,0.18)"
                  : "0 0 0 2px rgba(239,68,68,0.3), 0 0 24px rgba(239,68,68,0.2), 0 16px 40px rgba(0,0,0,0.15)",
              }}
            >
              <Image
                src={rewardSrc}
                alt={isReady ? "Ready for the October/November batch!" : "Aim for the May/June batch"}
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

            <button
              onClick={() => {
                setRewardOpen(false);
                setQuizOpen(true);
              }}
              className="mt-3 text-xs text-slate-400 underline underline-offset-2 transition hover:text-slate-600"
            >
              Review answers
            </button>
          </div>
        </div>
      )}
    </>
  );
}
