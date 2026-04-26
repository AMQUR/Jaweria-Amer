"use client";

import Image from "next/image";
import { contact } from "@/lib/contact";

const BULLETS = [
  "Paper Pattern Overview",
  "How-To-Answer",
  "Sample Answers Review",
  "A* Candidate Scripts",
  "Tips & Tricks",
];

const GRID_PATTERN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0v40M0 0v40M0 0h40M0 40h40' stroke='%23ffffff' stroke-width='0.4' fill='none'/%3E%3C/svg%3E")`;

/** Inline grain — single hero per page, fixed id for filter url() */
const HERO_GRAIN_FILTER_ID = "live-session-hero-grain";

export function LiveSessionHero({ bannerImagePath }: { bannerImagePath?: string }) {
  const imageSrc = bannerImagePath ?? "/assets/miss-jay.png";

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 pb-6 pt-20 sm:pt-24 lg:px-12">
      <div
        className="premium-reveal relative h-auto overflow-hidden rounded-3xl border border-white/[0.08] shadow-xl lg:h-[clamp(480px,52vh,560px)]"
        role="region"
        aria-label="Free live session — O Level 1123 Paper 2 Writing"
      >
        {/* ── LAYER 1: Base depth (no flat pink endpoint — warmth comes from light layers) ── */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#7f1d1d] via-[#9f1239] to-[#be123c]" aria-hidden />

        {/* ── LAYER 2: Diffused “studio” key light behind subject (large, soft #fda4af) ── */}
        <div
          className="pointer-events-none absolute -right-[18%] top-1/2 z-0 h-[140%] w-[min(85%,720px)] -translate-y-1/2 rounded-full opacity-[0.23] blur-[100px] sm:blur-[120px]"
          style={{
            background: "radial-gradient(closest-side, #fda4af 0%, rgba(253,164,175,0.45) 42%, transparent 72%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.22]"
          style={{
            background:
              "radial-gradient(ellipse 95% 85% at 86% 52%, rgba(253,164,175,0.24) 0%, rgba(190,18,60,0.08) 38%, transparent 58%)",
          }}
          aria-hidden
        />

        {/* ── LAYER 3: Outfit tone bleed into scene (soft-light) ── */}
        <div
          className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light"
          style={{
            background:
              "linear-gradient(to left, transparent 0%, transparent 38%, rgba(190, 24, 93, 0.14) 88%, rgba(190, 24, 93, 0.16) 100%), radial-gradient(ellipse 55% 80% at 90% 58%, rgba(190, 24, 93, 0.12) 0%, transparent 62%)",
          }}
          aria-hidden
        />

        {/* ── LAYER 4: Soft radial falloff behind figure (replaces harsh rectangle) ── */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse 48% 72% at 88% 72%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.06) 42%, transparent 68%)",
          }}
          aria-hidden
        />

        {/* ── LAYER 5: Left readability — subtle (10–15%), not a heavy block ── */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[62%] bg-gradient-to-r from-black/[0.14] via-black/[0.07] to-transparent sm:w-[58%]"
          aria-hidden
        />

        {/* ── LAYER 6: Rim light from right + soft edge vignette ── */}
        <div
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "linear-gradient(to left, rgba(255,248,250,0.1) 0%, rgba(255,240,245,0.04) 12%, transparent 26%), radial-gradient(ellipse 105% 95% at 50% 50%, transparent 42%, rgba(0,0,0,0.12) 100%)",
          }}
          aria-hidden
        />

        {/* ── LAYER 7: Fine grid + film grain (reduces digital flatness) ── */}
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

        {/* ── CONTENT + IMAGE: responsive grid, no absolute clipping for subject ── */}
        <div className="relative z-10 grid h-auto w-full min-h-0 grid-cols-1 items-start gap-6 py-5 pl-6 pr-6 sm:gap-7 sm:py-5 sm:pl-8 sm:pr-8 lg:h-full lg:min-h-0 lg:grid-cols-2 lg:items-stretch lg:gap-6 lg:py-6 lg:pl-12 lg:pr-10 xl:pl-14 xl:pr-12">
          {/* LEFT: copy (safe ~60% readable width), vertically centered on desktop */}
          <div className="mx-auto flex w-full max-w-[min(36rem,92vw)] flex-col justify-center lg:mx-0 lg:max-w-none lg:min-h-0 lg:pr-4">
            <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/65">
              O Level&nbsp;·&nbsp;1123 English Language
            </p>

            <h1 className="mb-4 font-serif tracking-tight">
              <span className="block text-[clamp(2.45rem,4.95vw,4.2rem)] font-bold leading-[1.05] text-white">
                Paper&nbsp;2
              </span>
              <span className="mt-0.5 block text-[clamp(2.45rem,4.95vw,4.2rem)] font-bold leading-[1.05] text-white/55">
                Writing
              </span>
            </h1>

            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.07] px-3 py-[5px] text-[10.25px] font-semibold tracking-wide text-white/80 backdrop-blur-sm">
                <span className="h-[4px] w-[4px] shrink-0 rounded-full bg-rose-400" aria-hidden />
                Live Writing Workshop
              </span>
            </div>

            <p className="mb-5 text-[clamp(0.74rem,1.4vw,0.875rem)] font-medium leading-tight tracking-tight text-rose-200/85">
              Sunday, 26 April&nbsp;&nbsp;·&nbsp;&nbsp;6 PM – 8 PM
            </p>

            <a
              href={contact.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.8rem] font-bold text-rose-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-red-600" aria-hidden>
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              Join Live on YouTube
            </a>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {BULLETS.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-1.5 text-[0.7rem] font-medium leading-snug tracking-tight text-white/80"
                >
                  <span className="mt-[4px] h-[3px] w-[3px] shrink-0 rounded-full bg-rose-400/75" aria-hidden />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: subject — bottom-aligned on desktop; mobile: compact fixed slot */}
          <div className="relative mx-auto flex w-full max-w-md min-h-0 items-end justify-center self-stretch lg:mx-0 lg:max-w-none lg:justify-end">
            <div
              className="relative mx-auto h-[clamp(200px,34vw,255px)] max-h-[min(50vh,272px)] w-full max-w-[min(100%,360px)] sm:max-w-[min(100%,378px)] lg:mx-0 lg:ml-auto lg:mr-0 lg:h-[clamp(210px,28vw,405px)] lg:max-h-[min(472px,calc(100%-4px))] lg:max-w-[min(100%,400px)]"
            >
              {/* Soft radial separation only (no solid color block) */}
              <div
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  background:
                    "radial-gradient(ellipse 70% 85% at 70% 85%, rgba(0,0,0,0.2) 0%, transparent 55%)",
                }}
                aria-hidden
              />
              <div
                className="relative z-[1] h-full w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.28)]"
                style={{
                  WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 9%, black 100%)",
                  maskImage: "linear-gradient(to right, transparent 0%, black 9%, black 100%)",
                }}
              >
                <Image
                  src={imageSrc}
                  alt="Miss Jay — O & A Level English teacher"
                  fill
                  priority
                  quality={100}
                  sizes="(max-width: 1024px) 90vw, (max-width: 1536px) 45vw, 640px"
                  className="object-contain object-bottom [image-rendering:auto]"
                  style={{ objectPosition: "center bottom" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-[3px] text-[7.5px] font-semibold uppercase tracking-[0.15em] text-emerald-300/55 backdrop-blur-sm">
            <span className="h-[3.5px] w-[3.5px] shrink-0 rounded-full bg-emerald-400/60" aria-hidden />
            Open for All · Free
          </span>
        </div>
      </div>
    </div>
  );
}
