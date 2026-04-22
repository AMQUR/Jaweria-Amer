import { Metadata } from "next";
import {
  ArrowRight,
  GraduationCap,
  Globe,
  BookOpen,
  Heart,
  CheckCircle2,
  ExternalLink,
  Newspaper,
} from "lucide-react";
import { TrackedOutboundLink, TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { ContactEmailLink } from "@/components/contact-email-link";
import { AboutLatestYoutube } from "@/components/about-latest-youtube";
import { contact, whatsAppGroupUrl, whatsAppUrl } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { cn } from "@/lib/utils";

const channelCardBase =
  "group flex flex-col rounded-2xl p-7 transition-all duration-300 ease-out sm:p-8 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(34,16,18,0.08)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconYouTube({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "About",
  description:
    "Meet Jaweria Amer. Cambridge English mentor focused on rubric-driven practice, examiner-aligned feedback, and calm mentorship for O Level students.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About",
    description:
      "Meet Jaweria Amer. Cambridge English mentor focused on rubric-driven practice, examiner-aligned feedback, and calm mentorship for O Level students.",
  },
  twitter: {
    card: "summary_large_image",
    title: "About",
    description:
      "Meet Jaweria Amer. Cambridge English mentor focused on rubric-driven practice, examiner-aligned feedback, and calm mentorship for O Level students.",
  },
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-crimson to-crimson-dark pb-20 pt-28 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="premium-reveal mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70 sm:text-xs">
            About
          </p>
          <h1 className="premium-reveal premium-reveal-delay-1 mb-5 max-w-3xl font-serif text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.35rem] sm:leading-[1.1] lg:text-[2.65rem] lg:leading-[1.08]">
            {siteConfig.name}
          </h1>
          <p className="premium-reveal premium-reveal-delay-2 max-w-xl text-base leading-[1.65] text-white/72 sm:text-lg sm:leading-[1.62]">
            Cambridge English mentor with international education experience,
            dedicated to structured mentorship that builds independent thinkers.
          </p>
        </div>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-20">
            {/* Portrait placeholder */}
            <div className="lg:col-span-2">
              <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-border/60 bg-crimson/5 shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(34,16,18,0.07)]">
                <div className="text-center px-8">
                  <div className="w-24 h-24 rounded-full bg-crimson/10 flex items-center justify-center mx-auto mb-4">
                    <span className="font-serif text-3xl font-bold text-crimson">
                      JA
                    </span>
                  </div>
                  <p className="font-serif text-lg font-semibold text-ink">
                    {siteConfig.name}
                  </p>
                  <p className="mt-1 text-xs leading-snug text-slate-light">
                    Cambridge English mentor
                  </p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <h2 className="mb-4 font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  Teaching Philosophy
                </h2>
                <div className="space-y-5 text-slate">
                  <p className="border-l-2 border-rose/25 pl-5 text-sm leading-[1.7] sm:text-base sm:leading-[1.68]">
                    My approach is simple: reduce confusion, increase control.
                    We work with real paper patterns, build repeatable writing
                    structures, and practise under timed conditions &mdash; while
                    keeping confidence intact.
                  </p>
                  <p className="text-sm leading-[1.7] sm:text-base sm:leading-[1.68]">
                    I teach English the way high-performing students need it:
                    clear structures, precise feedback, and habits that hold up
                    on exam day. Every session is designed around Cambridge
                    marking criteria, because understanding how examiners think
                    is what changes grades.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: GraduationCap,
                    title: "Pedagogical Expertise",
                    desc: "Trained in flipped classrooms, active learning strategies, and medical education innovation.",
                  },
                  {
                    icon: Globe,
                    title: "International Experience",
                    desc: "Education administration across Karachi, London, and Athens. A global perspective on university pathways.",
                  },
                  {
                    icon: BookOpen,
                    title: "Cambridge Specialist",
                    desc: "Deep expertise in CAIE English Language (1123, 9093) and Literature syllabi.",
                  },
                  {
                    icon: Heart,
                    title: "Student-Centred",
                    desc: "Mentorship that prioritises well-being alongside academic rigour. No shortcuts, no burnout.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-border/60 bg-white p-5 shadow-[0_1px_3px_rgba(34,16,18,0.04)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border/80 hover:shadow-[0_10px_32px_rgba(34,16,18,0.08)] motion-reduce:hover:translate-y-0"
                  >
                    <item.icon className="w-5 h-5 text-rose mb-3" />
                    <h3 className="mb-1.5 font-serif text-sm font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="mb-4 font-serif text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                  What Sets This Apart
                </h2>
                <div className="space-y-3.5">
                  {[
                    "Rubric-driven instruction aligned to how Cambridge actually marks",
                    "Examiner-style feedback on every piece of work",
                    "Structured programmes, not ad-hoc sessions",
                    "Calm, supportive mentorship that builds independence",
                    "Transparent method: diagnostic, plan, practice, feedback",
                    "No grade guarantees, no inflated claims. Just honest, consistent work",
                  ].map((item) => (
                    <div key={item} className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rose" />
                      <span className="text-sm leading-relaxed text-slate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* YouTube — authority */}
      <section className="border-t border-border/70 bg-white pb-24 pt-20 sm:pb-28 sm:pt-24">
        <div className="premium-reveal mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-serif text-2xl font-semibold leading-[1.2] tracking-tight text-ink sm:text-3xl">
            Learn directly from Jaweria
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-[1.65] text-slate sm:text-base sm:leading-[1.68]">
            Full lessons and paper-style breakdowns on YouTube — structured, calm, and aligned to how
            Cambridge marks.
          </p>
          <AboutLatestYoutube />
          <p className="mx-auto mt-5 max-w-lg text-center text-xs leading-relaxed text-slate-light sm:mt-6 sm:text-sm">
            Used by students preparing for Cambridge O Level English exams
          </p>
          <TrackedOutboundLink
            href={contact.youtube}
            channel="youtube"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-crimson underline-offset-4 transition-colors hover:text-rose sm:mt-6"
          >
            Open full channel
            <ExternalLink className="h-4 w-4 opacity-80" aria-hidden />
          </TrackedOutboundLink>
        </div>
      </section>

      {/* Multi-channel connect — extra top padding separates from YouTube block */}
      <section className="border-t border-rose/10 bg-cream pb-16 pt-16 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Connect</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-light sm:text-[0.9375rem]">
              Choose how you want to learn and stay updated
            </p>
          </div>

          <div
            className={cn(
              "mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 sm:gap-7",
              contact.facebook.trim() ? "lg:max-w-none lg:grid-cols-4" : "lg:mx-auto lg:max-w-5xl lg:grid-cols-3"
            )}
          >
            <TrackedWhatsAppLink
              href={whatsAppGroupUrl()}
              location="about_connect"
              variant="group"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                channelCardBase,
                "border-2 border-primary/40 bg-gradient-to-b from-white via-white to-crimson/[0.06] shadow-[0_10px_40px_rgba(112,20,20,0.14)] hover:border-primary/50 hover:shadow-lg"
              )}
            >
              <span className="mb-5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-crimson text-white shadow-sm">
                <IconWhatsApp className="h-5 w-5" />
              </span>
              <h3 className="flex-1 font-serif text-base font-semibold leading-snug text-ink sm:text-lg">
                Get direct guidance and updates on WhatsApp
              </h3>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-crimson">
                Join the WhatsApp Group
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
              </span>
            </TrackedWhatsAppLink>

            <TrackedOutboundLink
              href={contact.youtube}
              channel="youtube"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                channelCardBase,
                "border border-border/70 bg-white shadow-sm hover:border-border hover:shadow-md"
              )}
            >
              <span className="mb-5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-ink">
                <IconYouTube className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-lg font-semibold text-ink">YouTube</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                Watch full lessons and breakdowns
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-crimson">
                Visit channel
                <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
              </span>
            </TrackedOutboundLink>

            <TrackedOutboundLink
              href={contact.instagram}
              channel="instagram"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                channelCardBase,
                "border border-border/70 bg-white shadow-sm hover:border-border hover:shadow-md"
              )}
            >
              <span className="mb-5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-brand">
                <IconInstagram className="h-5 w-5" />
              </span>
              <h3 className="font-serif text-lg font-semibold text-ink">Instagram</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                Daily tips and writing insights
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-crimson">
                Follow on Instagram
                <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
              </span>
            </TrackedOutboundLink>

            {contact.facebook.trim() ? (
              <TrackedOutboundLink
                href={contact.facebook.trim()}
                channel="facebook"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  channelCardBase,
                  "border border-border/70 bg-white shadow-sm hover:border-border hover:shadow-md"
                )}
              >
                <span className="mb-5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-brand">
                  <Newspaper className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-serif text-lg font-semibold text-ink">Facebook</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                  Updates and announcements
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-medium text-crimson">
                  Open Facebook
                  <ExternalLink className="h-4 w-4 opacity-70" aria-hidden />
                </span>
              </TrackedOutboundLink>
            ) : null}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-crimson to-crimson-dark py-[4.5rem] sm:py-24">
        <div className="premium-reveal mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 font-serif text-2xl font-semibold leading-[1.2] tracking-tight text-white sm:text-3xl">
            Let&apos;s Start with a Conversation
          </h2>
          <p className="mx-auto mb-6 max-w-lg leading-[1.65] text-white/70">
            A short call to understand where you are, where you want to be, and
            whether this is the right fit. No obligation.
          </p>
          <p className="mb-8 text-sm text-white/65 max-w-lg mx-auto">
            Prefer email?{" "}
            <ContactEmailLink variant="onDark" className="font-medium" />
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <TrackedWhatsAppLink
              href={whatsAppUrl()}
              location="about_footer_cta"
              variant="direct"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-rose px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-rose-dark hover:shadow-md active:scale-100 motion-reduce:hover:scale-100 sm:w-auto"
            >
              Book a Clarity Call
              <ArrowRight className="w-4 h-4" />
            </TrackedWhatsAppLink>
            <TrackedWhatsAppLink
              href={whatsAppGroupUrl()}
              location="about_footer_cta"
              variant="group"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 py-3.5 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20 active:scale-100 motion-reduce:hover:scale-100 sm:w-auto"
            >
              Join WhatsApp group
            </TrackedWhatsAppLink>
          </div>
        </div>
      </section>
    </>
  );
}
