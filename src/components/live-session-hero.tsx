import Image from "next/image";
import Link from "next/link";
import type { HomepageContent } from "@/lib/admin/cms-types";
import type { Course } from "@/lib/data";
import { Arrow } from "@/components/editorial/arrow";
import { PointerField } from "@/components/editorial/pointer-field";
import {
  courseSyllabusCodes,
  SyllabusCode,
} from "@/components/editorial/interactive-course-row";
import { RegistrationLink } from "@/components/public-experience/registration-link";

/**
 * Miss Jay's supplied 1600 x 1600 PNG (white background, unretouched), stored
 * byte-for-byte in the public Supabase `resources` bucket. The file name carries
 * the first 8 hex characters of its SHA-256 so the URL is safely immutable.
 */
export const HERO_PORTRAIT_SRC =
  "https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/resources/site/miss-jay-hero-1600-b1544cd3.png";

type HeroProof = {
  /** Rounded A/A* share of the publicly shared records. */
  pct: number;
  aOrAStar: number;
  sharedResults: number;
  session: string;
};

/**
 * Homepage hero. Server-rendered: the headline, portrait and proof line are in
 * the first HTML response; only the CTA tracking and the bounded pointer depth
 * hydrate. Copy comes from the homepage CMS, figures from the results dataset.
 */
export function LiveSessionHero({
  bannerImagePath,
  enrolmentOpen = false,
  heroContent,
  proof,
  programmes = [],
}: {
  bannerImagePath?: string;
  /** Kept for callers; the announcement strip now owns the nav offset. */
  announcementActive?: boolean;
  /** Only true while a dated batch window is open; never a standing claim. */
  enrolmentOpen?: boolean;
  heroContent?: Pick<
    HomepageContent,
    "heroKicker" | "heroTitlePrimary" | "heroTitleSecondary" | "heroDescription"
  >;
  proof?: HeroProof;
  programmes?: Course[];
}) {
  const portraitSrc = bannerImagePath || HERO_PORTRAIT_SRC;
  const title = heroContent?.heroTitlePrimary ?? "Learn English with Miss Jay";

  return (
    <section
      className="ed-paper ed-margin relative overflow-x-clip"
      aria-label="Miss Jay — O & A Level English"
    >
      <PointerField className="ed-wrap grid gap-x-10 gap-y-8 pt-8 sm:pt-10 lg:grid-cols-12 lg:gap-y-0 lg:pt-12">
        <div className="relative z-10 min-w-0 lg:col-span-7 lg:pb-14">
          <div className="ed-rise flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="ed-label">
              {heroContent?.heroKicker ??
                "O Levels · IGCSE · A Levels · English"}
            </p>
            {enrolmentOpen && (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-800/25 bg-emerald-700/10 px-3 py-1 text-[0.8125rem] font-semibold text-emerald-900">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-emerald-600"
                  aria-hidden
                />
                Enrolment Open
              </span>
            )}
          </div>

          <h1 className="ed-display mt-5 text-[clamp(3rem,10.6vw,8.6rem)] text-ink lg:-mr-10">
            <span className="ed-line">
              <span>{title}</span>
            </span>
          </h1>

          <p
            className="ed-quote ed-rise mt-6 max-w-xl text-[clamp(1.3rem,2.4vw,1.9rem)] text-crimson"
            style={{ ["--d" as string]: "0.18s" }}
          >
            {heroContent?.heroTitleSecondary ??
              "A guided live programme — structure, feedback & real accountability"}
          </p>
          <p
            className="ed-lead ed-rise mt-4"
            style={{ ["--d" as string]: "0.26s" }}
          >
            {heroContent?.heroDescription ??
              "Complete preparation for O Level, IGCSE & A Level English with checked work and progress you can track."}
          </p>

          <div
            className="ed-rise mt-8 flex flex-col gap-x-7 gap-y-2 sm:flex-row sm:items-center"
            style={{ ["--d" as string]: "0.34s" }}
          >
            <RegistrationLink
              surface="home_hero"
              className="ed-btn ed-btn-lg w-full sm:w-auto"
              data-depth="magnet"
            >
              Join the Next Batch
              <Arrow />
            </RegistrationLink>
            <Link href="#free-lessons" className="ed-link self-start text-ink">
              Watch a full lesson first
              <Arrow direction="down" />
            </Link>
          </div>
          <p
            className="ed-rise mt-3 text-[0.875rem] text-slate"
            style={{ ["--d" as string]: "0.4s" }}
          >
            Share your interest. No Google sign-in required.
          </p>
        </div>

        {/* Portrait stage — one of the two surfaces allowed to tilt. */}
        <div className="relative lg:col-span-5 lg:self-end lg:pl-8">
          <div
            className="ed-stage ed-rise relative mx-auto aspect-square w-full max-w-[21rem] lg:max-w-[30rem] lg:ml-auto"
            data-depth="tilt"
            style={{ ["--d" as string]: "0.2s" }}
          >
            <div
              className="absolute inset-x-0 bottom-0 top-[8%] rounded-t-[999px] bg-crimson"
              style={{
                backgroundImage:
                  "radial-gradient(120% 80% at 50% 12%, rgba(255,196,186,0.34), transparent 60%)",
              }}
              aria-hidden
            />
            <div className="ed-stage-figure absolute inset-x-[4%] bottom-0 top-[8%] overflow-hidden rounded-t-[999px] bg-white">
              {/* The supplied photo is square with a white background, so it is
                  shown whole (never cropped or upscaled) inside a white arch.
                  Intrinsic size 480 keeps the optimiser at <=1080px even on
                  3x screens; it never requests the 3840px variant. */}
              <Image
                src={portraitSrc}
                alt="Miss Jay — O & A Level English teacher"
                width={480}
                height={480}
                loading="eager"
                fetchPriority="high"
                quality={90}
                className="absolute inset-x-0 bottom-0 h-auto w-full"
              />
            </div>
            {proof ? (
              <Link
                href="/results"
                className="group absolute -left-2 bottom-5 z-10 max-w-[13.5rem] rounded-xl bg-paper p-4 text-ink shadow-[0_18px_40px_-18px_rgba(31,14,17,0.55)] ring-1 ring-ink/10 transition-[translate] duration-500 hover:-translate-y-1 sm:-left-8 lg:-left-12"
              >
                <span className="ed-num block text-[3.1rem] text-crimson">
                  {proof.pct}%
                </span>
                <span className="mt-1 block text-[0.875rem] font-semibold leading-snug">
                  A or A* — {proof.aOrAStar} of {proof.sharedResults} results
                  shared with permission, {proof.session}
                </span>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-crimson">
                  See every result
                  <Arrow />
                </span>
              </Link>
            ) : null}
          </div>
        </div>
      </PointerField>

      {/* Syllabus index: the four offered tracks, set like a fixture list. */}
      {programmes.length > 0 ? (
        <nav
          aria-label="Programmes by syllabus code"
          className="relative z-10 border-y border-ink/15"
        >
          <ul className="ed-wrap grid grid-cols-2 lg:grid-cols-4">
            {programmes.map((course, i) => (
              <li
                key={course.id}
                className={
                  "border-ink/15 " +
                  (i % 2 === 1 ? "border-l " : "") +
                  (i >= 2 ? "max-lg:border-t " : "") +
                  (i > 0 ? "lg:border-l" : "")
                }
              >
                <Link
                  href={`/courses/${course.id}`}
                  className="group flex h-full min-h-24 flex-col justify-between gap-2 px-3 py-4 transition-colors duration-300 hover:bg-crimson hover:text-paper focus-visible:bg-crimson focus-visible:text-paper focus-visible:outline-none sm:px-5 lg:py-6"
                >
                  <span className="ed-num text-[clamp(1.7rem,3.4vw,2.9rem)] text-crimson transition-colors duration-300 group-hover:text-paper group-focus-visible:text-paper">
                    <SyllabusCode codes={courseSyllabusCodes(course)} />
                  </span>
                  <span className="text-[0.875rem] font-semibold leading-snug">
                    {course.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
