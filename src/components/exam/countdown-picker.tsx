"use client";
import Link from "next/link";
import { SYLLABUSES, isSyllabusKey, type SyllabusKey, type Timetable } from "@/lib/exam/exam-dates";
import { CountdownList } from "./countdown-list";
import { cn } from "@/lib/utils";
import { useStoredString } from "@/lib/exam/client-state";

const KEY = "exam-countdown-syllabus";

export function SyllabusChips({
  value,
  onChange,
}: {
  value: SyllabusKey;
  onChange: (key: SyllabusKey) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Choose your syllabus" className="flex flex-wrap gap-2">
      {SYLLABUSES.map((s) => (
        <button
          key={s.key}
          type="button"
          role="radio"
          aria-checked={value === s.key}
          onClick={() => onChange(s.key)}
          className={cn(
            "min-h-11 rounded-full border px-5 text-[0.95rem] font-semibold transition-colors",
            value === s.key
              ? "border-crimson bg-crimson text-paper"
              : "border-ink/25 bg-paper text-ink hover:border-crimson",
          )}
        >
          {s.short}
        </button>
      ))}
    </div>
  );
}

export function CountdownPicker({ timetable }: { timetable: Timetable }) {
  const { value, save } = useStoredString(KEY);
  const syllabus: SyllabusKey = value && isSyllabusKey(value) ? value : "1123";
  return (
    <div>
      <SyllabusChips value={syllabus} onChange={save} />
      <div className="mt-8">
        <CountdownList syllabus={syllabus} papers={timetable[syllabus]} />
      </div>
      <p className="mt-10 text-slate">
        Want a month-by-month plan?{" "}
        <Link href={`/study-plan/${syllabus}`} className="text-crimson underline underline-offset-4">
          Open the free study plan
        </Link>
        .
      </p>
    </div>
  );
}
