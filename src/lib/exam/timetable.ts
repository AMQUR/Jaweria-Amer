import "server-only";
import {
  EXAM_SERIES,
  SEED_TIMETABLE,
  SYLLABUSES,
  isSyllabusKey,
  sortPapers,
  type ExamPaper,
  type Timetable,
} from "./exam-dates";

export interface TimetableResult {
  timetable: Timetable;
  source: "database" | "fallback";
}

function endpoint() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? { url, key } : null;
}

/** Authoritative timetable from Supabase; falls back to the seed (never throws). */
export async function getTimetable(): Promise<TimetableResult> {
  const cfg = endpoint();
  if (cfg) {
    try {
      const res = await fetch(
        `${cfg.url}/rest/v1/exam_timetable?select=syllabus_key,paper,exam_date,session&series=eq.${encodeURIComponent(EXAM_SERIES.label)}`,
        {
          headers: { apikey: cfg.key, Authorization: `Bearer ${cfg.key}` },
          next: { revalidate: 120 },
          signal: AbortSignal.timeout(4000),
        },
      );
      if (res.ok) {
        const rows: unknown = await res.json();
        if (Array.isArray(rows) && rows.length) {
          const timetable = Object.fromEntries(SYLLABUSES.map((s) => [s.key, [] as ExamPaper[]])) as Timetable;
          for (const r of rows as { syllabus_key: string; paper: string; exam_date: string; session: string }[]) {
            if (!isSyllabusKey(r.syllabus_key) || !/^\d{4}-\d{2}-\d{2}$/.test(r.exam_date)) continue;
            timetable[r.syllabus_key].push({
              paper: r.paper,
              date: r.exam_date,
              session: r.session === "Afternoon" ? "Afternoon" : "Morning",
            });
          }
          for (const s of SYLLABUSES) timetable[s.key] = sortPapers(timetable[s.key]);
          if (SYLLABUSES.every((s) => timetable[s.key].length)) return { timetable, source: "database" };
        }
      }
    } catch {
      /* fall through to the seed */
    }
  }
  return { timetable: SEED_TIMETABLE, source: "fallback" };
}
