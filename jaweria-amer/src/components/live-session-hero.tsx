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
const HERO_GRAIN_FILTER_ID = "live-session-hero-grain";

const btnPrimary =
  "inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[0.8rem] font-bold text-rose-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";
const btnSecondary =
  "inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-[0.8rem] font-bold text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

export function LiveSessionHero({ bannerImagePath }: { bannerImagePath?: string }) {
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
              O Level&nbsp;·&nbsp;A Level&nbsp;·&nbsp;English Language
            </p>

            <h1 className="mb-3 font-serif tracking-tight">
              <span className="block text-[clamp(2.45rem,4.95vw,4.2rem)] font-bold leading-[1.05] text-white">
                Miss Jay
              </span>
              <span className="mt-0.5 block text-[clamp(2.45rem,4.95vw,4.2rem)] font-bold leading-[1.05] text-white/55">
                O &amp; A Level English
              </span>
            </h1>

            <p className="mb-2 text-[clamp(0.75rem,1.5vw,0.9rem)] font-medium leading-snug text-white/80">
              Your complete system to master O Level English 1123
            </p>
            <p className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold text-rose-200/90">
              <span className="h-[5px] w-[5px] rounded-full bg-emerald-400" aria-hidden />
              Used by 2,000+ students
            </p>

            {/* Primary CTA — YouTube */}
            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-red-600" aria-hidden>
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                Join on YouTube
              </a>
            </div>

            {/* Secondary CTAs — outline */}
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a href="https://www.instagram.com/englishwithjaweria/" target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-white" aria-hidden>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                Join on Instagram
              </a>
              <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-white" aria-hidden>
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Join on Facebook
              </a>
            </div>

            <p className="mb-5 text-[11px] font-medium text-white/55">
              New resources added weekly
            </p>

            <ul className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {BULLETS.map((b) => (
                <li key={b} className="flex items-start gap-1.5 text-[0.7rem] font-medium leading-snug tracking-tight text-white/80">
                  <span className="mt-[4px] h-[3px] w-[3px] shrink-0 rounded-full bg-rose-400/75" aria-hidden />
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
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2 py-[3px] text-[7.5px] font-semibold uppercase tracking-[0.15em] text-emerald-300/55 backdrop-blur-sm">
            <span className="h-[3.5px] w-[3.5px] shrink-0 rounded-full bg-emerald-400/60" aria-hidden />
            Open for All · Free
          </span>
        </div>
      </div>
    </div>
  );
}
