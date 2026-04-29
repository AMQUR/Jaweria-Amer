"use client";

import { useState, useMemo } from "react";
import { CheckCircle, XCircle, Trophy, RotateCcw, ChevronRight } from "lucide-react";
import type { McqSet, McqOption } from "@/lib/mcq-data";
import { cn } from "@/lib/utils";

interface Props {
  mcqSet: McqSet;
}

const SECTION_LABELS: Record<"A" | "B" | "C", { title: string; blurb: string }> = {
  A: {
    title: "Section A — Core Skill",
    blurb: "Identify and classify key grammatical concepts.",
  },
  B: {
    title: "Section B — Application",
    blurb: "Apply rules in sentence-level contexts.",
  },
  C: {
    title: "Section C — Mixed Challenge",
    blurb: "Harder questions combining multiple concepts.",
  },
};

export function McqViewer({ mcqSet }: Props) {
  const [answers, setAnswers] = useState<Record<number, McqOption>>({});
  const [submitted, setSubmitted] = useState(false);

  const totalQuestions = mcqSet.questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const score = useMemo(() => {
    if (!submitted) return 0;
    return mcqSet.questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.answer ? 1 : 0),
      0
    );
  }, [submitted, answers, mcqSet.questions]);

  const percentage = submitted ? Math.round((score / totalQuestions) * 100) : 0;

  function handleSelect(questionIndex: number, option: McqOption) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const sections = useMemo(() => {
    const map: Record<"A" | "B" | "C", { index: number; q: (typeof mcqSet.questions)[0] }[]> =
      { A: [], B: [], C: [] };
    mcqSet.questions.forEach((q, i) => {
      map[q.section].push({ index: i, q });
    });
    return map;
  }, [mcqSet]);

  const scoreLabel =
    percentage >= 80
      ? "Excellent work!"
      : percentage >= 60
        ? "Good effort — review the explanations below."
        : "Keep practising — read the explanations carefully.";

  const scoreColor =
    percentage >= 80 ? "text-green-700" : percentage >= 60 ? "text-yellow-700" : "text-red-700";

  const scoreBorderBg =
    percentage >= 80
      ? "border-green-200 bg-green-50"
      : percentage >= 60
        ? "border-yellow-200 bg-yellow-50"
        : "border-red-200 bg-red-50";

  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
      {/* Score banner — shown after submit */}
      {submitted && (
        <div
          className={cn(
            "mb-10 rounded-2xl border p-7 shadow-sm sm:p-9",
            scoreBorderBg
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
              <Trophy className={cn("h-8 w-8", scoreColor)} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className={cn("font-serif text-3xl font-bold tabular-nums", scoreColor)}>
                {score} / {totalQuestions}
              </p>
              <p className={cn("mt-1 font-semibold", scoreColor)}>
                {percentage}% — {scoreLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-border/60 bg-white px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:bg-muted/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
            Try Again
          </button>
        </div>
      )}

      {/* Progress bar — shown while taking the quiz */}
      {!submitted && (
        <div className="mb-8 rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Progress</span>
            <span className="tabular-nums text-slate">
              {answeredCount} / {totalQuestions} answered
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-crimson transition-[width] duration-200 ease-out"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Question sections */}
      {(["A", "B", "C"] as const).map((sectionId) => {
        const qs = sections[sectionId];
        if (!qs.length) return null;
        const meta = SECTION_LABELS[sectionId];

        return (
          <section key={sectionId} className="mb-10">
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {sectionId === "A" ? "Identify" : sectionId === "B" ? "Apply" : "Challenge"}
              </p>
              <h2 className="mt-0.5 font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                {meta.title}
              </h2>
              <p className="mt-1 text-sm text-slate">{meta.blurb}</p>
            </div>

            <div className="space-y-5">
              {qs.map(({ index, q }) => {
                const selected = answers[index];
                const isCorrect = submitted && selected === q.answer;
                const isWrong = submitted && selected !== undefined && selected !== q.answer;
                const isUnanswered = submitted && selected === undefined;

                return (
                  <article
                    key={index}
                    className={cn(
                      "rounded-2xl border bg-white p-6 shadow-sm transition-[background-color,border-color,box-shadow]",
                      !submitted && "border-border/70",
                      isCorrect && "border-green-200 bg-green-50/60",
                      isWrong && "border-red-200 bg-red-50/60",
                      isUnanswered && "border-yellow-200 bg-yellow-50/60"
                    )}
                  >
                    {/* Question header */}
                    <div className="mb-5 flex items-start gap-3">
                      <span
                        className={cn(
                          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white",
                          !submitted && "bg-crimson",
                          isCorrect && "bg-green-600",
                          isWrong && "bg-red-600",
                          isUnanswered && "bg-yellow-600"
                        )}
                        aria-hidden
                      >
                        {index + 1}
                      </span>
                      {/* Preserve newlines in question text */}
                      <p className="whitespace-pre-line pt-0.5 font-medium leading-snug text-ink">
                        {q.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-2.5 pl-10" role="radiogroup">
                      {(["A", "B", "C", "D"] as McqOption[]).map((opt) => {
                        const isSelected = selected === opt;
                        const isCorrectOpt = submitted && opt === q.answer;
                        const isWrongSelected = submitted && isSelected && opt !== q.answer;
                        const isDimmed =
                          submitted && !isSelected && !isCorrectOpt;

                        return (
                          <button
                            key={opt}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            onClick={() => handleSelect(index, opt)}
                            disabled={submitted}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
                              // Idle states
                              !submitted &&
                                !isSelected &&
                                "border-border/60 bg-white text-ink hover:-translate-y-0.5 hover:border-border hover:bg-muted/30 hover:shadow-sm motion-reduce:hover:translate-y-0",
                              !submitted &&
                                isSelected &&
                                "border-primary/50 bg-primary/5 ring-1 ring-primary/20 text-ink shadow-sm",
                              // Post-submit states
                              isCorrectOpt &&
                                "border-green-400 bg-green-100 text-green-900",
                              isWrongSelected &&
                                "border-red-400 bg-red-100 text-red-900",
                              isDimmed &&
                                "border-border/40 bg-white/50 text-muted-foreground opacity-60",
                              "disabled:cursor-default"
                            )}
                          >
                            {/* Option letter badge */}
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                                !submitted &&
                                  !isSelected &&
                                  "border-border/60 text-muted-foreground",
                                !submitted &&
                                  isSelected &&
                                  "border-crimson bg-crimson text-white",
                                isCorrectOpt &&
                                  "border-green-500 bg-green-500 text-white",
                                isWrongSelected &&
                                  "border-red-500 bg-red-500 text-white",
                                isDimmed &&
                                  "border-border/40 text-muted-foreground/50"
                              )}
                            >
                              {opt}
                            </span>

                            <span className="flex-1">{q.options[opt]}</span>

                            {isCorrectOpt && (
                              <CheckCircle
                                className="ml-auto h-4 w-4 shrink-0 text-green-600"
                                aria-label="Correct answer"
                              />
                            )}
                            {isWrongSelected && (
                              <XCircle
                                className="ml-auto h-4 w-4 shrink-0 text-red-600"
                                aria-label="Incorrect choice"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation — shown after submit */}
                    {submitted && (
                      <div
                        className={cn(
                          "mt-5 rounded-lg px-4 py-3 pl-10 text-sm leading-relaxed",
                          isCorrect && "bg-green-100/70 text-green-900",
                          isWrong && "bg-red-100/70 text-red-900",
                          isUnanswered && "bg-yellow-100/70 text-yellow-900"
                        )}
                      >
                        <span className="font-semibold">
                          {isCorrect ? "Correct. " : isUnanswered ? "Unanswered. " : `Incorrect — correct answer: ${q.answer}. `}
                        </span>
                        {q.explanation}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Submit CTA */}
      {!submitted && (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-border/60 bg-white p-8 text-center shadow-sm">
          {!allAnswered && (
            <p className="text-sm text-slate">
              Answer all {totalQuestions} questions to submit.
            </p>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allAnswered}
            className={cn(
              "inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-medium text-white shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25",
              allAnswered
                ? "cursor-pointer bg-crimson hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
                : "cursor-not-allowed bg-muted text-muted-foreground shadow-none"
            )}
          >
            Submit Assessment
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
          {allAnswered && (
            <p className="text-xs text-slate">
              All {totalQuestions} questions answered — ready to submit.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
