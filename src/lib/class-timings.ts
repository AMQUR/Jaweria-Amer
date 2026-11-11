import "server-only";

/**
 * Class timings come LIVE from the LMS public timetable feed, which is the source of truth
 * (https://englishwithmissjay.com/class-timings renders the same data). Nothing is copied into
 * this repository. If the feed cannot be read, the page says so instead of showing guessed times.
 * The feed carries public batch and session information only.
 */
export interface ClassBatch {
  id: string;
  course: string;
  title: string;
  sessions: { day: string; time: string }[];
  frequency?: string;
}

export interface ClassTimings {
  batches: ClassBatch[];
  notes: string[];
}

const FEED = process.env.LMS_TIMETABLE_URL?.trim() || "https://englishwithmissjay.com/api/public/timetable";

const str = (v: unknown, max = 200) => (typeof v === "string" && v.trim() && v.length <= max ? v.trim() : null);

export async function getClassTimings(): Promise<ClassTimings | null> {
  try {
    const res = await fetch(FEED, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data: unknown = await res.json();
    if (!data || typeof data !== "object" || !("batches" in data) || !Array.isArray(data.batches)) return null;
    const batches: ClassBatch[] = [];
    for (const raw of data.batches as unknown[]) {
      if (!raw || typeof raw !== "object") continue;
      const b = raw as Record<string, unknown>;
      const id = str(b.id, 80);
      const course = str(b.course);
      const title = str(b.title);
      if (!id || !course || !title || !Array.isArray(b.sessions)) continue;
      const sessions = (b.sessions as unknown[]).flatMap((s) => {
        const o = s as Record<string, unknown>;
        const day = str(o?.day, 40);
        const time = str(o?.time, 80);
        return day && time ? [{ day, time }] : [];
      });
      if (!sessions.length) continue;
      batches.push({ id, course, title, sessions, frequency: str(b.frequency, 60) ?? undefined });
    }
    if (!batches.length) return null;
    const rawNotes = (data as Record<string, unknown>).notes;
    const notes = Array.isArray(rawNotes)
      ? (rawNotes.map((n) => str(n, 400)).filter(Boolean) as string[])
      : [];
    return { batches, notes };
  } catch {
    return null;
  }
}
