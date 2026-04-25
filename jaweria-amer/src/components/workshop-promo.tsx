"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { workshopRegisterUrl } from "@/lib/contact";

const DEFAULT_BANNER = "/assets/hero-legacy.jpg";

function getValidBanner(src?: string): string {
  if (!src || typeof src !== "string") return DEFAULT_BANNER;

  // block invalid formats
  if (!src.startsWith("/")) return DEFAULT_BANNER;

  // block legacy + deleted assets
  if (
    src.includes("hero-premium") ||
    src.includes("homepage-banner") ||
    src.includes("/images/")
  ) {
    return DEFAULT_BANNER;
  }

  return src;
}

/**
 * Homepage hero banner (image-driven — artwork includes all copy) + reserve CTA block below.
 */
export function WorkshopPromoSection({ bannerImagePath }: { bannerImagePath?: string }) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const bannerSrc = getValidBanner(bannerImagePath);
  const registerHref = workshopRegisterUrl();

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    if (window.innerWidth < 768) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const raw = rect.top * 0.08;
          const offset = Math.max(-20, Math.min(20, raw));

          el.style.transform = `translateY(${offset}px)`;

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-3 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <div className="premium-reveal relative h-[220px] w-full overflow-hidden rounded-2xl shadow-xl sm:h-[320px] md:h-[420px] lg:h-[520px] xl:h-[580px]">
        <div
          ref={heroRef}
          className="relative h-full w-full will-change-transform"
        >
          <Image
            src={bannerSrc}
            alt="Hero Banner"
            fill
            priority
            quality={85}
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/5 pointer-events-none" />
        </div>
      </div>

      <section
        id="workshop-reserve"
        className="mx-auto max-w-lg px-2 py-12 text-center sm:py-14"
        aria-labelledby="workshop-reserve-heading"
      >
        <h2
          id="workshop-reserve-heading"
          className="font-serif text-[2.15rem] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[2.35rem]"
        >
          Reserve your spot
        </h2>
        <p className="mt-3 text-sm leading-relaxed tracking-tight text-slate sm:text-[0.98rem]">
          Limited seats available
        </p>
        <TrackedWhatsAppLink
          href={registerHref}
          location="workshop_promo"
          variant="direct"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-7 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:hover:translate-y-0"
        >
          Reserve via WhatsApp
          <ArrowRight className="size-4 shrink-0" aria-hidden />
        </TrackedWhatsAppLink>
      </section>
    </div>
  );
}
