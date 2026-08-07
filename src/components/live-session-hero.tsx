"use client";

import Image from "next/image";
import { ENROL_NOW_URL } from "@/lib/contact";

/** Programme USPs shown as benefit chips in the enrolment cover. */
const USPS = [
  "LMS Portal Access",
  "Personalised feedback on assignments",
  "Biweekly tests with checked copies",
  "Exclusive notes",
  "Live syllabus coverage + recorded lectures",
  "Remedial extra support lessons",
  "TA assistance",
  "Biweekly progress reports & attendance",
];

const GRID_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0v40M0 0v40M0 0h40M0 40h40' stroke='%23ffffff' stroke-width='0.4' fill='none'/%3E%3C/svg%3E")`;
const HERO_GRAIN_FILTER_ID = "live-session-hero-grain";

const btnEnrol =
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 px-8 py-3.5 text-[0.9rem] font-extrabold text-rose-900 shadow-[0_8px_24px_rgba(251,191,36,0.35)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(251,191,36,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";

export function LiveSessionHero({ bannerImagePath }: { bannerImagePath?: string }) {
  // Portrait is served from the local cutout asset. TODO: upload a high-res Jaweria
  // portrait to Supabase Storage and pass its public URL via `bannerImagePath`
  // (CMS homepage banner) so the hero image is hosted off-repo.
  const cutoutSrc = bannerImagePath ?? "/assets/miss-jay.png";

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 pb-6 pt-20 sm:pt-24 lg:px-12">
      <div
        className="premium-reveal relative overflow-hidden rounded-3xl border border-white/[0.08] shadow-xl"
        role="region"
        aria-label="Miss Jay — O & A Level English"
      >
        {/* ── LAYER 1: Base gradient — no person baked in ── */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c]"
          aria-hidden
        />

        {/* ── LAYER 2: Radial glow on right behind subject ── */}
        <div
          className="pointer-events-none absolute right-0 top-0 z-0 h-full w-[55%] opacity-40"
          style={{
            background:
              "radial-gradient(ellipse 80% 90% at 85% 55%, #fda4af 0%, rgba(253,164,175,0.35) 45%, transparent 72%)",
          }}
          aria-hidden
        />

        {/* ── LAYER 3: Left-side readability veil ── */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[70%] bg-gradient-to-r from-black/30 via-black/10 to-transparent sm:w-[60%]"
          aria-hidden
        />

        {/* ── LAYER 4: Fine grid + film grain ── */}
        <div
          className="pointer-events-none absolute inset-0 z-[2] opacity-[0.028]"
          style={{ backgroundImage: GRID_PATTERN }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-[2] mix-blend-overlay opacity-[0.055]"
          aria-hidden
        >
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <defs>
              <filter id={HERO_GRAIN_FILTER_ID} x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence
                  type="fractalNoise"
                  baseFrequency="0.8"
                  numOctaves="4"
                  stitchTiles="stitch"
                  result="noise"
                />
                <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
              </filter>
            </defs>
            <rect width="100%" height="100%" fill="#ffffff" filter={`url(#${HERO_GRAIN_FILTER_ID})`} />
          </svg>
        </div>

        {/* ── CONTENT: text left + cutout right ── */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px]">

          {/* ── LEFT: Text content ── */}
          <div className="flex flex-col justify-center py-10 pl-6 pr-6 sm:py-12 sm:pl-10 lg:py-14 lg:pl-12 lg:pr-4 xl:pl-14">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
              O Levels&nbsp;·&nbsp;IGCSE&nbsp;·&nbsp;A Levels&nbsp;·&nbsp;English
            </p>

            <h1 className="mb-3 font-serif tracking-tight">
              <span className="block text-[clamp(2.3rem,4.6vw,3.9rem)] font-bold leading-[1.05] text-white">
                Learn English with Miss Jay
              </span>
              <span className="mt-1 block text-[clamp(1rem,2vw,1.35rem)] font-semibold leading-snug text-white/60">
                A guided live programme — structure, feedback &amp; real accountability
              </span>
            </h1>

            <p className="mb-2 text-[clamp(0.75rem,1.5vw,0.9rem)] font-medium leading-snug text-white/80">
              Complete preparation for O Level, IGCSE &amp; A Level English with checked work and progress you can track.
            </p>
            <p className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-200/90">
              <span className="h-[5px] w-[5px] rounded-full bg-emerald-400" aria-hidden />
              Trusted by 2,000+ students
            </p>

            {/* Primary CTA — social/community links live lower on the page */}
            <div className="mb-6">
              <a
                href={ENROL_NOW_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${btnEnrol} w-full sm:w-fit`}
              >
                Enrol Now
                <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] shrink-0 fill-rose-900" aria-hidden>
                  <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                </svg>
              </a>
              <p className="mt-2.5 max-w-sm text-[11px] font-medium leading-snug text-white/55">
                Ready for more help? Join the guided live programme.
              </p>
            </div>

            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
              What&apos;s included
            </p>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {USPS.map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-[0.7rem] font-medium leading-snug tracking-tight text-white/80">
                  <span className="mt-[4px] h-[3px] w-[3px] shrink-0 rounded-full bg-amber-300/80" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── RIGHT: Cutout — desktop only ── */}
          <div className="relative hidden items-end justify-center overflow-hidden lg:flex">
            {/* Bottom fade mask */}
            <div
              className="relative h-full w-full drop-shadow-2xl"
              style={{
                WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 10%, black 100%)",
                maskImage: "linear-gradient(to top, transparent 0%, black 10%, black 100%)",
              }}
            >
              <Image
                src={cutoutSrc}
                alt="Miss Jay — O & A Level English teacher"
                fill
                priority
                quality={95}
                sizes="(max-width: 1280px) 440px, 440px"
                className="object-contain object-bottom"
              />
            </div>
          </div>
        </div>

        {/* ── MOBILE: Cutout below text ── */}
        <div className="relative mx-auto flex max-h-[300px] w-full max-w-xs items-end justify-center overflow-hidden lg:hidden">
          <div
            className="relative h-[300px] w-full drop-shadow-xl"
            style={{
              WebkitMaskImage: "linear-gradient(to top, transparent 0%, black 15%, black 100%)",
              maskImage: "linear-gradient(to top, transparent 0%, black 15%, black 100%)",
            }}
          >
            <Image
              src={cutoutSrc}
              alt="Miss Jay — O & A Level English teacher"
              fill
              priority
              quality={90}
              sizes="320px"
              className="object-contain object-bottom"
            />
          </div>
        </div>

        {/* ── Badge ── */}
        <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-[3px] text-[7.5px] font-semibold uppercase tracking-[0.15em] text-emerald-300/70 backdrop-blur-sm">
            <span className="h-[3.5px] w-[3.5px] shrink-0 rounded-full bg-emerald-400/70" aria-hidden />
            Enrolment Open
          </span>
        </div>
      </div>
    </div>
  );
}
