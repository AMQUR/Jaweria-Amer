"use client";

import Image from "next/image";
import { contact, ENROL_NOW_URL, COMMUNITY_WHATSAPP_URL } from "@/lib/contact";

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
  "inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-300 via-amber-200 to-amber-100 px-7 py-3.5 text-[0.85rem] font-extrabold text-rose-900 shadow-[0_8px_24px_rgba(251,191,36,0.35)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_10px_30px_rgba(251,191,36,0.5)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-[0.8rem] font-bold text-rose-800 shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";
const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-white/10 px-6 py-3 text-[0.8rem] font-bold text-white backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] hover:bg-white/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60";

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

            {/* CTAs — Enrol Now dominates, then YouTube / Community / Instagram */}
            <div className="mb-5 flex flex-col gap-3">
              <a href={ENROL_NOW_URL} target="_blank" rel="noopener noreferrer" className={`${btnEnrol} w-full sm:w-fit`}>
                Enrol Now
                <svg viewBox="0 0 24 24" className="h-[14px] w-[14px] shrink-0 fill-rose-900" aria-hidden>
                  <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
                </svg>
              </a>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <a href={contact.youtube} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                  <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-red-600" aria-hidden>
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  Join on YouTube
                </a>
                {/* Join Our Community — WhatsApp group */}
                <a href={COMMUNITY_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                  <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-white" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Join Our Community
                </a>
                {/* TODO: Replace contact.instagram with the real Instagram URL when supplied
                    (user temporarily provided the WhatsApp community link as a stand-in). */}
                <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
                  <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] shrink-0 fill-white" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              </div>
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
