import { getMj26Results } from "@/lib/results/public";

/** "How these figures were calculated" — every public number traces to this table. */
export function ResultsMethodology() {
  const { summary: s, generatedAt, portraitsPublished } = getMj26Results();
  const rows: Array<[string, number, string]> = [
    ["Raw form responses", s.rawResponses, "Every non-blank row in the results form export"],
    ["Incomplete rows removed", s.incompleteRows, "No e-mail, name or grade"],
    ["Exact duplicates removed", s.exactDuplicatesRemoved, "Same student re-submitting the same result — latest kept"],
    ["Ambiguous duplicates held", s.ambiguousDuplicates, "Same student, conflicting grade — held out entirely"],
    ["Unique result records", s.uniqueRecords, "One row per student per syllabus"],
    ["Grade not classifiable", s.gradeUnclassified, "Answered “Other” or blank — never counted as any grade"],
    ["Graded unique records", s.graded.total, "Records with a Cambridge grade A*–U (internal reference)"],
    ["Kept private", s.privateRecords + s.syllabusUnknown, "Student chose privacy, gave no answer, gave conflicting answers, or the syllabus was blank"],
    ["Publicly shared records", s.shareable.total, "Students who chose “Yes, with my name” or “Yes, but hide my name”"],
  ];
  const pct = (n: number | null) => (n === null ? "—" : `${n.toFixed(1)}%`);

  return (
    <section id="methodology" aria-labelledby="methodology-heading" className="scroll-mt-28">
      <p className="results-eyebrow">Methodology</p>
      <h2 id="methodology-heading" className="mt-2 font-serif text-[1.75rem] font-semibold tracking-tight">How these figures were calculated</h2>
      <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed" style={{ color: "var(--results-mute)" }}>
        Every result on this page was submitted by the student through our May/June 2026 results form,
        with a screenshot of their statement of results on file. Figures are recomputed by a tested
        script from that form export; nothing is typed in by hand. Percentages use the{" "}
        <strong style={{ color: "var(--results-cream)" }}>publicly shared records</strong> as the denominator —
        never the full response set and never &ldquo;all students taught&rdquo; — so a student who asked for privacy is neither shown nor counted.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl" style={{ border: "1px solid var(--results-line)" }}>
        <table className="w-full min-w-[520px] text-left text-[13.5px]">
          <caption className="sr-only">Denominators used for the May/June 2026 results</caption>
          <thead>
            <tr style={{ background: "var(--results-card)" }}>
              <th scope="col" className="px-4 py-3 font-semibold">Step</th>
              <th scope="col" className="px-4 py-3 text-right font-semibold tabular-nums">Count</th>
              <th scope="col" className="px-4 py-3 font-semibold">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([label, n, meaning]) => (
              <tr key={label} style={{ borderTop: "1px solid var(--results-line)" }}>
                <th scope="row" className="px-4 py-2.5 font-medium">{label}</th>
                <td className="px-4 py-2.5 text-right tabular-nums">{n}</td>
                <td className="px-4 py-2.5" style={{ color: "var(--results-mute)" }}>{meaning}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat label="A* among shared results" value={`${s.shareable.aStar} · ${pct(s.shareable.aStarPct)}`} />
        <Stat label="A among shared results" value={`${s.shareable.a}`} />
        <Stat label="A or A* among shared results" value={`${s.shareable.aOrAStar} · ${pct(s.shareable.aOrAStarPct)}`} />
      </div>

      <ul className="mt-6 space-y-2 text-[13px]" style={{ color: "var(--results-mute)" }}>
        <li>Names appear only for students who chose “Yes, with my name”; {s.shareable.anonymous} students chose to be listed without a name and appear by archive number.</li>
        <li>Portraits appear only where the student agreed to a photo and supplied one ({s.shareable.withPhoto} students); {portraitsPublished} are shown after an editorial check that each is a photo of the student alone, with no third-party people or branding.</li>
        <li>Result screenshots, messages and contact details are never published.</li>
        <li>Grades are self-reported by students and are not Cambridge-verified statistics. Syllabus mix: {s.shareable.bySyllabus["1123"].total} × 1123, {s.shareable.bySyllabus["0500"].total} × 0500, {s.shareable.bySyllabus["0510"].total} × 0510/0511.</li>
        <li>Past results do not guarantee any future grade. Dataset generated {new Date(generatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.</li>
      </ul>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--results-card)", border: "1px solid var(--results-line)" }}>
      <p className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--results-mute)" }}>{label}</p>
      <p className="results-metric mt-1 text-[1.35rem] font-extrabold">{value}</p>
    </div>
  );
}
