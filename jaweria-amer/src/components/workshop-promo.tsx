import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { workshopRegisterUrl } from "@/lib/contact";

/**
 * Homepage workshop banner (image only — artwork includes all copy) + reserve CTA block below.
 */
export function WorkshopPromoSection() {
  const registerHref = workshopRegisterUrl();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-3 pt-20 sm:px-6 sm:pt-24 lg:px-8">
      <div className="premium-reveal overflow-hidden rounded-2xl border border-border/60 shadow-lg">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
          <Image
            src="/images/homepage-banner.png"
            alt="Miss Jay O Level English Workshop — 5 to 7 day online and physical programme, syllabus revision, mock exams, and contact details on banner"
            fill
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, 1200px"
            className="workshop-banner-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
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
