import type { Metadata } from "next";
import Link from "next/link";
import { socialMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/editorial/page-intro";
import { getClassTimings } from "@/lib/class-timings";
import { ENROL_NOW_URL, getWhatsAppUrl } from "@/lib/contact";

// Rendered per request (the feed read is cached in-process for 5 minutes with a last-good fallback),
// so a failed build-time or revalidation fetch can never freeze the "unavailable" message into the page.
export const dynamic = "force-dynamic";

const description =
  "Current online batches, session days and times in Pakistan Standard Time for Miss Jay's Cambridge English classes.";
export const metadata: Metadata = {
  title: "Class Timings",
  description,
  alternates: { canonical: "/class-timings" },
  ...socialMetadata({ title: "Class Timings", description, path: "/class-timings" }),
};

export default async function ClassTimingsPage() {
  const timings = await getClassTimings();
  return (
    <>
      <PageIntro
        label="Schedule · Pakistan Standard Time"
        title="Class timings"
        size="md"
        lead="Live sessions for the current online batches. All times are Pakistan Standard Time (PKT, UTC+5)."
      />
      <section className="ed-paper ed-margin pb-24">
        <div className="ed-wrap">
          {timings && timings.batches.length === 0 ? (
            <p role="status" className="max-w-2xl border-l-4 border-ink/30 bg-ink/[0.04] p-5 text-ink">
              No batch timings are published right now. Please message Miss Jay on WhatsApp for the latest schedule.
            </p>
          ) : timings ? (
            <>
              <ul className="border-t border-ink/15">
                {timings.batches.map((b) => (
                  <li key={b.id} className="grid gap-4 border-b border-ink/15 py-8 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-10">
                    <div>
                      <p className="ed-label">{b.course}</p>
                      <h2 className="ed-h3 mt-3">{b.title}</h2>
                      {b.frequency && <p className="mt-1 text-slate">{b.frequency}</p>}
                    </div>
                    <ul className="space-y-2">
                      {b.sessions.map((s) => (
                        <li key={`${s.day}-${s.time}`} className="flex justify-between gap-4 border-b border-ink/10 pb-2">
                          <span className="font-semibold text-ink">{s.day}</span>
                          <span className="text-ink">{s.time} PKT</span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
              {timings.notes.length > 0 && (
                <ul className="mt-8 max-w-2xl list-disc space-y-2 pl-5 text-slate">
                  {timings.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p role="status" className="max-w-2xl border-l-4 border-crimson bg-crimson/[0.06] p-5 text-ink">
              The live timetable is unavailable right now, so no times are shown rather than risk showing the wrong
              ones. Please message Miss Jay on WhatsApp to confirm the current schedule.
            </p>
          )}
          <div className="mt-12 flex flex-wrap gap-3">
            <Link href={ENROL_NOW_URL} className="ed-btn ed-btn-lg">Join the next batch</Link>
            <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-ink ed-btn-lg">
              Ask about seats on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
