import { SYLLABUSES, formatExamDate, sortPapers } from "@/lib/exam/exam-dates";
import { getTimetable } from "@/lib/exam/timetable";
import { updateExamDate } from "./actions";

export const dynamic = "force-dynamic";

export default async function ExamDatesAdminPage() {
  const { timetable, source } = await getTimetable();
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Exam dates</h1>
      <p className="mt-2 max-w-2xl text-sm text-slate">
        The one timetable for the website countdown, the study plans and the LMS student dashboard.
        Changes appear within a few minutes. No start times are stored; students are told to confirm
        them with their exam centre.
      </p>
      {source === "fallback" && (
        <p role="alert" className="mt-3 text-sm text-crimson">
          The database is unreachable, so the built-in dates are being shown and edits cannot be saved yet.
        </p>
      )}
      <div className="mt-6 space-y-6">
        {SYLLABUSES.map((s) => (
          <section key={s.key} className="rounded-xl border border-border bg-white p-5">
            <h2 className="font-semibold text-ink">{s.short}</h2>
            <ul className="mt-3 space-y-3">
              {sortPapers(timetable[s.key]).map((p) => (
                <li key={p.paper}>
                  <form action={updateExamDate} className="flex flex-wrap items-end gap-3">
                    <input type="hidden" name="syllabus" value={s.key} />
                    <input type="hidden" name="paper" value={p.paper} />
                    <span className="min-w-40 text-sm text-ink">{p.paper}</span>
                    <label className="text-xs text-slate">
                      Date
                      <input type="date" name="date" defaultValue={p.date} required className="mt-1 block min-h-11 rounded-lg border border-border px-3 text-sm text-ink" />
                    </label>
                    <label className="text-xs text-slate">
                      Session
                      <select name="session" defaultValue={p.session} className="mt-1 block min-h-11 rounded-lg border border-border px-3 text-sm text-ink">
                        <option>Morning</option>
                        <option>Afternoon</option>
                      </select>
                    </label>
                    <button className="min-h-11 rounded-lg bg-crimson px-4 text-sm font-semibold text-white">Save</button>
                    <span className="text-xs text-slate">{formatExamDate(p.date)}</span>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
