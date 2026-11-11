"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { PlanWeek } from "@/lib/exam/study-plan";
import { SYLLABUSES, daysUntil, formatExamDate, getSyllabus, nearestIndex, sortPapers, type ExamPaper, type SyllabusKey } from "@/lib/exam/exam-dates";
import { cn } from "@/lib/utils";
import { useStoredString, useToday } from "@/lib/exam/client-state";

const monthName = (m: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", month: "long", year: "numeric" }).format(new Date(`${m}-01T00:00:00Z`));
const weekLabel = (d: string) =>
  `Week of ${new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "short" }).format(new Date(`${d}T00:00:00Z`))}`;

/** Ticks live only in this browser (localStorage, one key per syllabus). No sign-in; nothing is sent anywhere. */
export function StudyPlanChecklist({
  syllabus,
  weeks,
  papers,
  approved,
}: {
  syllabus: SyllabusKey;
  weeks: PlanWeek[];
  papers: ExamPaper[];
  approved: boolean;
}) {
  const s = getSyllabus(syllabus);
  const today = useToday();
  const { value: raw, save, clear, unavailable } = useStoredString(`study-plan-v1:${syllabus}`);
  const [confirming, setConfirming] = useState(false);
  const ready = raw !== null;
  const valid = useMemo(() => new Set(weeks.map((w) => w.id)), [weeks]);
  const done = useMemo<Record<string, true>>(() => {
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      if (!parsed || typeof parsed !== "object") return {};
      // Keep only ids that still exist; unknown ids are ignored, never rewritten away.
      return Object.fromEntries(Object.entries(parsed).filter(([id, v]) => v === true && valid.has(id))) as Record<string, true>;
    } catch {
      return {};
    }
  }, [raw, valid]);

  function toggle(id: string) {
    let stored: Record<string, boolean> = {};
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : {};
      if (parsed && typeof parsed === "object") stored = parsed as Record<string, boolean>;
    } catch {
      /* start fresh */
    }
    if (stored[id]) delete stored[id];
    else stored[id] = true;
    save(JSON.stringify(stored));
  }

  const count = weeks.filter((w) => done[w.id]).length;
  const percent = weeks.length ? Math.round((count / weeks.length) * 100) : 0;
  const sorted = sortPapers(papers);
  const next = today ? nearestIndex(sorted, today) : -1;
  const nextPaper = next >= 0 ? sorted[next] : null;
  const currentMonth = today?.slice(0, 7) ?? null;
  const months = [...new Set(weeks.map((w) => w.month))];

  return (
    <div>
      <div className="grid gap-6 border-y border-ink/15 py-8 sm:grid-cols-3">
        <div>
          <p className="ed-label">Syllabus</p>
          <p className="ed-h3 mt-3">{s.name}</p>
          <p className="text-slate">{s.short}</p>
        </div>
        <div aria-live="polite">
          <p className="ed-label">Next paper</p>
          {today === null ? null : nextPaper ? (
            <>
              <p className="ed-num mt-3 text-[2.75rem] leading-none text-crimson">{daysUntil(nextPaper.date, today)}</p>
              <p className="text-slate">
                days to {nextPaper.paper} · {formatExamDate(nextPaper.date)}
              </p>
            </>
          ) : (
            <p className="mt-3 text-slate">All papers are done.</p>
          )}
        </div>
        <div>
          <p className="ed-label">Your progress</p>
          <p className="ed-num mt-3 text-[2.75rem] leading-none text-ink" aria-live="polite">
            {ready ? `${percent}%` : ""}
          </p>
          <p className="text-slate">{ready ? `${count} of ${weeks.length} weeks done` : ""}</p>
          {currentMonth && <p className="mt-1 text-sm text-slate">This month: {monthName(currentMonth)}</p>}
        </div>
      </div>
      <div
        className="mt-6 h-2 overflow-hidden rounded-full bg-ink/10"
        role="progressbar"
        aria-label="Overall study plan completion"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div className="h-full bg-crimson transition-[width] duration-300" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-sm text-slate">
        {unavailable
          ? "Your browser is blocking saving, so ticks will only last until you close or reload this page."
          : "Ticks are saved in this browser only. No sign-in needed."}
      </p>

      {!approved && (
        <p role="note" className="mt-6 border-l-4 border-crimson bg-crimson/[0.06] p-4 text-[0.95rem] leading-relaxed text-ink">
          <strong>Draft plan.</strong> This is a starter outline that points to the free resource library. Miss Jay&apos;s
          own month-by-month plan will replace it, and your ticks will be kept when it does.
        </p>
      )}

      {months.map((m) => (
        <section key={m} className="mt-12" aria-labelledby={`m-${m}`}>
          <h2 id={`m-${m}`} className="ed-h3 flex flex-wrap items-baseline gap-x-3">
            {monthName(m)}
            {currentMonth === m && <span className="rounded-full bg-ink px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wider text-paper">This month</span>}
            <span className="text-base font-normal text-slate">{weeks.find((w) => w.month === m)!.focus}</span>
          </h2>
          <ul className="mt-4 border-t border-ink/15">
            {weeks.filter((w) => w.month === m).map((w) => {
              const isDone = !!done[w.id];
              return (
                <li key={w.id} className="flex items-start gap-4 border-b border-ink/15 py-4">
                  <input
                    id={`t-${w.id}`}
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggle(w.id)}
                    className="mt-1 h-6 w-6 shrink-0 accent-crimson"
                  />
                  <label htmlFor={`t-${w.id}`} className="min-w-0 flex-1 cursor-pointer">
                    <span className="block text-sm text-slate">
                      {weekLabel(w.start)} · {isDone ? "Done" : "To do"}
                    </span>
                    <span className={cn("block text-ink", isDone && "text-slate line-through")}>{w.task.text}</span>
                  </label>
                  <Link href={w.task.href} className="shrink-0 self-center text-sm font-semibold text-crimson underline underline-offset-4">
                    Open<span className="sr-only"> resources for {weekLabel(w.start)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <div className="mt-12 flex flex-wrap items-center gap-4">
        {confirming ? (
          <>
            <p className="text-ink">Clear every tick for {s.short}? This cannot be undone.</p>
            <button type="button" className="ed-btn" onClick={() => { clear(); setConfirming(false); }}>
              Yes, reset progress
            </button>
            <button type="button" className="ed-btn ed-btn-ghost" onClick={() => setConfirming(false)}>
              Keep my progress
            </button>
          </>
        ) : (
          <button type="button" className="ed-btn ed-btn-ghost" onClick={() => setConfirming(true)} disabled={count === 0}>
            Reset progress
          </button>
        )}
      </div>
      <p className="mt-10 text-slate">
        Other syllabus?{" "}
        {SYLLABUSES.filter((x) => x.key !== syllabus).map((x, i) => (
          <span key={x.key}>
            {i > 0 && " · "}
            <Link href={`/study-plan/${x.key}`} className="text-crimson underline underline-offset-4">{x.short}</Link>
          </span>
        ))}
      </p>
    </div>
  );
}
