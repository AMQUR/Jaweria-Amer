import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import AnimatedCounter from "@/components/ui/animated-counter";
import { distributeRows, getMj26Headline, getMj26Results, SESSION_LABEL } from "@/lib/results/public";
import { ResultCapsuleRows } from "./result-capsule-rows";
import { selectHeadline } from "./results-headline";

/**
 * Homepage proof block. Server component: every figure comes straight from
 * the committed, public-safe dataset — nothing is typed in by hand.
 * The headline sells the dream · the numbers prove it · the moving results
 * show the scale · the individual evidence makes it believable.
 */
export function ResultsShowcase({ titleTag: Title = "h2" }: { titleTag?: "h1" | "h2" }) {
  const h = getMj26Headline();
  const { records, summary } = getMj26Results();
  const rows = distributeRows(records, 3);
  const headline = selectHeadline(h);
  const pct = Math.round(h.aOrAStarPct);

  return (
    <section id="results" className="results-ink relative isolate overflow-hidden" aria-labelledby="results-heading">
      <div className="results-grid-texture absolute inset-0" aria-hidden="true" />
      <FlowLines />

      <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 lg:pb-14">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="results-eyebrow">{SESSION_LABEL} · Cambridge English</p>
            <Title id="results-heading" className="results-display mt-4">
              Our
              <br />
              <span style={{ color: "var(--results-pink)" }}>Results</span>
            </Title>
            <p className="mt-6 max-w-xl text-[clamp(1.2rem,2.3vw,1.7rem)] font-semibold leading-snug tracking-tight">
              {headline.line}
            </p>
          </div>

          <div className="lg:justify-self-end">
            <div className="rounded-2xl p-6 sm:p-7" style={{ background: "var(--results-card)", border: "1px solid var(--results-line)" }}>
              <p className="results-eyebrow">Verified headline</p>
              <p className="results-metric mt-2 text-[clamp(4rem,9vw,6.5rem)] font-extrabold leading-none" style={{ color: "var(--results-pink)" }}>
                <AnimatedCounter value={`${pct}%`} />
              </p>
              <p className="mt-1 text-[15px] font-semibold" data-results-statistic="">
                achieved an A or A* — {h.statisticSentence}
              </p>
              <dl className="mt-5 grid grid-cols-3 gap-3 border-t pt-4" style={{ borderColor: "var(--results-line)" }}>
                <Metric value={h.aStar} label="A* grades" />
                <Metric value={h.a} label="A grades" />
                <Metric value={h.sharedResults} label="Shared results" />
              </dl>
              <p className="mt-4 inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--results-mute)" }}>
                <ShieldCheck className="size-3.5" style={{ color: "var(--results-pink-2)" }} aria-hidden="true" />
                Every result shared with the student&rsquo;s permission.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative py-2 md:py-4">
        <ResultCapsuleRows rows={rows} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pt-8 pb-14 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/results"
            className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-[14px] font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 motion-reduce:hover:translate-y-0"
            style={{ background: "var(--results-pink)", color: "var(--results-bg)", ["--tw-ring-color" as string]: "var(--results-pink)" }}
          >
            Explore all {h.sharedResults} results
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <p className="text-[12.5px]" style={{ color: "var(--results-mute)" }}>
            {summary.shareable.named} named · {summary.shareable.anonymous} listed without a name · grades self-reported with a statement of results on file.
          </p>
        </div>

        <details className="group mt-8 rounded-2xl border" style={{ borderColor: "var(--results-line)", background: "var(--results-card)" }}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[13.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden" style={{ ["--tw-ring-color" as string]: "var(--results-pink)" }}>
            How these figures were calculated
            <span className="text-[11px] uppercase tracking-[0.18em] transition-transform group-open:rotate-180" style={{ color: "var(--results-pink-2)" }} aria-hidden="true">
              ▾
            </span>
          </summary>
          <div className="border-t px-5 pt-4 pb-5 text-[13px] leading-relaxed" style={{ borderColor: "var(--results-line)", color: "var(--results-mute)" }}>
            <ul className="space-y-2">
              <li>
                <strong style={{ color: "var(--results-cream)" }}>Source.</strong> The May/June 2026 results form ({summary.rawResponses} responses), each with a screenshot of the student&rsquo;s statement of results on file.
              </li>
              <li>
                <strong style={{ color: "var(--results-cream)" }}>Duplicates.</strong> {summary.exactDuplicatesRemoved} re-submissions of the same result were merged (latest kept); {summary.ambiguousDuplicates} conflicting duplicates were held out.
              </li>
              <li>
                <strong style={{ color: "var(--results-cream)" }}>Exclusions.</strong> {summary.gradeUnclassified} responses with no classifiable grade and {summary.syllabusUnknown} with no syllabus are never counted as any grade.
              </li>
              <li>
                <strong style={{ color: "var(--results-cream)" }}>Permission.</strong> Only students who chose &ldquo;Yes, with my name&rdquo; or &ldquo;Yes, but hide my name&rdquo; appear or count; {summary.privateRecords} results were kept private.
              </li>
              <li>
                <strong style={{ color: "var(--results-cream)" }}>Denominator.</strong> {pct}% means {h.aOrAStar} of the {h.sharedResults} publicly shared result records — never &ldquo;all students taught&rdquo;.
              </li>
            </ul>
            <Link href="/results#methodology" className="mt-4 inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline" style={{ color: "var(--results-pink-2)" }}>
              Full methodology and every shared result
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>
        </details>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.12em]" style={{ color: "var(--results-mute)" }}>{label}</dt>
      <dd className="results-metric mt-0.5 text-[1.6rem] font-extrabold leading-none">{value}</dd>
    </div>
  );
}

/** Thin flowing lines — static SVG, no animation cost. */
function FlowLines() {
  return (
    <svg className="results-flow" viewBox="0 0 1440 700" preserveAspectRatio="none" aria-hidden="true">
      <path d="M-40 520 C 240 420, 420 640, 720 540 S 1180 380, 1500 470" fill="none" stroke="var(--results-pink)" strokeOpacity="0.28" strokeWidth="1.2" />
      <path d="M-40 580 C 260 500, 480 700, 760 600 S 1200 440, 1500 540" fill="none" stroke="var(--results-cream)" strokeOpacity="0.12" strokeWidth="1" />
      <path d="M-40 120 C 300 60, 520 240, 840 160 S 1240 40, 1500 120" fill="none" stroke="var(--results-cream)" strokeOpacity="0.08" strokeWidth="1" />
    </svg>
  );
}
