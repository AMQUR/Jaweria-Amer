/**
 * Exam timetable model and date helpers (pure, no I/O).
 *
 * The AUTHORITATIVE dates live in Supabase (`public.exam_timetable`, editable at
 * /admin/exam-dates) and are served read-only at /api/exam-dates, which the LMS dashboard also
 * reads. `SEED_TIMETABLE` below is only the fallback used when the database is unreachable and
 * the seed the table was created from. Dates are exam-centre calendar dates (YYYY-MM-DD).
 * No start time is stored: confirm exact times with the exam centre.
 */
export const EXAM_SERIES = {
  label: "June 2027",
  zone: "4",
  centreNote: "Please confirm your exact examination start time with your exam centre.",
} as const;

export const SYLLABUSES = [
  { key: "1123", code: "1123", name: "O Level English Language", short: "O Level 1123" },
  { key: "0500", code: "0500", name: "IGCSE First Language English", short: "IGCSE 0500" },
  { key: "0510-0511", code: "0510/0511", name: "IGCSE English as a Second Language", short: "IGCSE 0510/0511" },
  { key: "9093-as", code: "9093", name: "AS Level English Language", short: "AS 9093" },
  { key: "9093-a", code: "9093", name: "A Level English Language", short: "A Level 9093" },
] as const;

export type SyllabusKey = (typeof SYLLABUSES)[number]["key"];

export interface ExamPaper {
  paper: string;
  /** YYYY-MM-DD */
  date: string;
  session: "Morning" | "Afternoon";
}

export type Timetable = Record<SyllabusKey, ExamPaper[]>;

const am = (paper: string, date: string): ExamPaper => ({ paper, date, session: "Morning" });

export const SEED_TIMETABLE: Timetable = {
  "1123": [am("Paper 2", "2027-04-29"), am("Paper 1", "2027-05-06")],
  "0500": [am("Paper 1", "2027-04-29"), am("Paper 2", "2027-05-14")],
  "0510-0511": [am("Reading and Writing", "2027-04-29"), am("Listening", "2027-05-24")],
  "9093-as": [am("Paper 1", "2027-04-26"), am("Paper 2", "2027-05-04")],
  "9093-a": [am("Paper 3", "2027-05-07"), am("Paper 4", "2027-05-25")],
};

export function isSyllabusKey(value: string): value is SyllabusKey {
  return SYLLABUSES.some((s) => s.key === value);
}

export function getSyllabus(key: SyllabusKey) {
  return SYLLABUSES.find((s) => s.key === key)!;
}

/** Papers sorted soonest first. */
export function sortPapers(papers: readonly ExamPaper[]): ExamPaper[] {
  return [...papers].sort((a, b) => a.date.localeCompare(b.date));
}

/** Today's calendar date in Pakistan, as YYYY-MM-DD. */
export function todayInPakistan(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Whole calendar days from `today` to `date` (negative once the paper has passed). */
export function daysUntil(date: string, today = todayInPakistan()): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000);
}

export function formatExamDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

/** Index of the next upcoming paper (today counts), or -1 when all are done. */
export function nearestIndex(papers: readonly ExamPaper[], today = todayInPakistan()): number {
  return papers.findIndex((p) => daysUntil(p.date, today) >= 0);
}

function icsEscape(text: string) {
  return text.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");
}

/** All-day events: the start time is not confirmed, so none is invented. */
export function buildIcs(key: SyllabusKey, papers: readonly ExamPaper[], now = new Date()): string {
  const s = getSyllabus(key);
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = sortPapers(papers).flatMap((p) => {
    const day = p.date.replaceAll("-", "");
    const next = new Date(Date.parse(`${p.date}T00:00:00Z`) + 86_400_000)
      .toISOString()
      .slice(0, 10)
      .replaceAll("-", "");
    return [
      "BEGIN:VEVENT",
      `UID:${key}-${p.paper.replace(/\W+/g, "").toLowerCase()}-${day}@jaweriaamer.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`,
      `DTEND;VALUE=DATE:${next}`,
      `SUMMARY:${icsEscape(`${s.short} ${p.paper} (Cambridge ${EXAM_SERIES.label})`)}`,
      `DESCRIPTION:${icsEscape(`${p.session} session, zone ${EXAM_SERIES.zone}. ${EXAM_SERIES.centreNote}`)}`,
      "END:VEVENT",
    ];
  });
  return (
    ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Jaweria Amer//Exam countdown//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n") +
    "\r\n"
  );
}
