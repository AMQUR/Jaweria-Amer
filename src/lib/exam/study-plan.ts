import { sortPapers, type ExamPaper, type SyllabusKey } from "./exam-dates";

/**
 * Monthly study-plan content model.
 *
 * STATUS: DRAFT. Miss Jay's approved month-by-month wording had not been supplied when this
 * was built, so every month below is a clearly labelled placeholder that only points at the
 * free resource library; it is NOT teacher-approved academic instruction. To publish approved
 * text: edit `PLAN_OVERRIDES` (per syllabus, per month) and set `approved: true` on that plan.
 * No other code changes are needed.
 *
 * Ticks are stored per syllabus against stable week ids (`<syllabus>:<monday>`), never against
 * the task text, so editing wording here never loses a student's saved progress.
 *
 * `worksheetSlot` reserves a stable id for a future, controlled worksheet assignment (generated
 * or curated offline and published as a static resource). Nothing generates content at request time.
 * Website MCQ resource ids and the LMS worksheet system stay separate.
 */
export interface PlanTask {
  text: string;
  /** Existing public page only (resource library category or tool). */
  href: string;
  worksheetSlot?: string;
}
export interface PlanMonth {
  /** YYYY-MM */
  month: string;
  focus: string;
  tasks: PlanTask[];
}
export interface PlanDefinition {
  approved: boolean;
  months: PlanMonth[];
}

const lib = (cat: string) => `/resources?cat=${cat}`;

/** Only categories that exist in the public library and are not Directed Writing. */
const TEMPLATE: PlanMonth[] = [
  { month: "2026-11", focus: "Foundations", tasks: [
    { text: "Read the exam checklists and note what each paper rewards", href: lib("checklists") },
    { text: "Read the general notes for your first paper", href: lib("general-notes") },
    { text: "Start a vocabulary list from the free vocabulary packs", href: lib("vocabulary") },
    { text: "Try one quick worksheet", href: lib("quick-worksheets") },
  ] },
  { month: "2026-12", focus: "Reading skills", tasks: [
    { text: "Practise one topical question set", href: lib("topicals") },
    { text: "Read an examiner report", href: lib("examiner-reports") },
    { text: "Add words to your vocabulary list", href: lib("vocabulary") },
    { text: "Try one quick worksheet", href: lib("quick-worksheets") },
  ] },
  { month: "2027-01", focus: "Writing skills", tasks: [
    { text: "Practise one topical question set", href: lib("topicals") },
    { text: "Study a solved paper", href: lib("solved-papers") },
    { text: "Read an examiner report", href: lib("examiner-reports") },
    { text: "Try one quick worksheet", href: lib("quick-worksheets") },
  ] },
  { month: "2027-02", focus: "Timed practice", tasks: [
    { text: "Attempt part of a past paper under time", href: lib("yearly-past-papers") },
    { text: "Check it against the mark scheme checklist", href: lib("checklists") },
    { text: "Redo your weakest topical", href: lib("topicals") },
    { text: "Revise vocabulary", href: lib("vocabulary") },
  ] },
  { month: "2027-03", focus: "Full papers", tasks: [
    { text: "Sit a full past paper", href: lib("yearly-past-papers") },
    { text: "Compare with a solved paper", href: lib("solved-papers") },
    { text: "Sit a second full past paper", href: lib("yearly-past-papers") },
    { text: "Fix mistakes with a quick worksheet", href: lib("quick-worksheets") },
  ] },
  { month: "2027-04", focus: "Final revision", tasks: [
    { text: "Revise from the exam checklists", href: lib("checklists") },
    { text: "One last timed past paper", href: lib("yearly-past-papers") },
    { text: "Light revision of notes and vocabulary", href: lib("general-notes") },
    { text: "Confirm your exam start times with your exam centre", href: "/exam-countdown" },
  ] },
  { month: "2027-05", focus: "Exam weeks", tasks: [
    { text: "Quick revision before your next paper", href: lib("checklists") },
    { text: "Skim an examiner report", href: lib("examiner-reports") },
    { text: "Light vocabulary revision", href: lib("vocabulary") },
    { text: "Check the countdown and rest well", href: "/exam-countdown" },
  ] },
];

/** Teacher-approved month text goes here, keyed by syllabus then YYYY-MM. */
const PLAN_OVERRIDES: Partial<Record<SyllabusKey, Partial<Record<string, PlanMonth>>>> = {};
const APPROVED: Partial<Record<SyllabusKey, boolean>> = {};

export function getPlan(key: SyllabusKey): PlanDefinition {
  const months = TEMPLATE.map((m) => PLAN_OVERRIDES[key]?.[m.month] ?? m);
  return { approved: APPROVED[key] === true, months };
}

export interface PlanWeek {
  id: string;
  /** Monday, YYYY-MM-DD */
  start: string;
  month: string;
  focus: string;
  task: PlanTask;
}

const PLAN_START = "2026-11-02";

function addDays(date: string, n: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
}

/** One tickable task per week, from November to the week of the syllabus' final paper. */
export function buildWeeks(key: SyllabusKey, papers: readonly ExamPaper[]): PlanWeek[] {
  const sorted = sortPapers(papers);
  const last = sorted[sorted.length - 1].date;
  const plan = getPlan(key).months;
  const seen: Record<string, number> = {};
  const weeks: PlanWeek[] = [];
  for (let start = PLAN_START; start <= last; start = addDays(start, 7)) {
    const month = start.slice(0, 7);
    const m = plan.find((p) => p.month === month) ?? plan[plan.length - 1];
    const i = seen[month] ?? 0;
    seen[month] = i + 1;
    weeks.push({ id: `${key}:${start}`, start, month, focus: m.focus, task: m.tasks[i % m.tasks.length] });
  }
  return weeks;
}
