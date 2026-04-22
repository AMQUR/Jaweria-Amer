import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { workshopRegisterUrl } from "@/lib/contact";

/**
 * Homepage workshop banner (image only — artwork includes all copy) + reserve CTA block below.
 */
export function WorkshopPromoSection({ bannerImagePath = "/images/homepage-banner.png" }: { bannerImagePath?: string }) {
  const registerHref = workshopRegisterUrl();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <div className="premium-reveal overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <div className="relative w-full">
          <Image
            src={bannerImagePath}
            alt="O Level English Workshop Banner"
            width={1024}
            height={379}
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="h-auto w-full object-contain"
          />
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
