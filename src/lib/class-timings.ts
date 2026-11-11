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

/** Last good answer kept per server instance so one slow or failed fetch never blanks the page. */
let lastGood: { at: number; data: ClassTimings } | null = null;
const FRESH_MS = 5 * 60_000;
const STALE_OK_MS = 6 * 60 * 60_000;

function parse(data: unknown): ClassTimings | null {
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
  const rawNotes = (data as Record<string, unknown>).notes;
  const notes = Array.isArray(rawNotes) ? (rawNotes.map((n) => str(n, 400)).filter(Boolean) as string[]) : [];
  // An empty list is a valid answer (nothing is published right now); it is returned as-is.
  return { batches, notes };
}

async function fetchOnce(): Promise<ClassTimings> {
  const res = await fetch(FEED, {
    headers: { Accept: "application/json" },
    // Never let the framework cache a failed or stale read; freshness is handled below.
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`feed status ${res.status}`);
  const parsed = parse(await res.json());
  if (!parsed) throw new Error("feed schema invalid");
  return parsed;
}

export async function getClassTimings(): Promise<ClassTimings | null> {
  const now = Date.now();
  if (lastGood && now - lastGood.at < FRESH_MS) return lastGood.data;
  let lastError = "unknown";
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const data = await fetchOnce();
      lastGood = { at: Date.now(), data };
      return data;
    } catch (e) {
      lastError = e instanceof Error ? `${e.name}: ${e.message}` : "unknown";
      if (attempt === 0) await new Promise((r) => setTimeout(r, 400));
    }
  }
  // Real upstream outage: log the class of failure (no secrets), then prefer a recent
  // good answer over a blank page; only say "unavailable" when there is nothing to show.
  console.error(`[class-timings] LMS feed unavailable: ${lastError}`);
  if (lastGood && now - lastGood.at < STALE_OK_MS) return lastGood.data;
  return null;
}
