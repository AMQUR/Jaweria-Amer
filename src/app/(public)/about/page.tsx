import { socialMetadata } from "@/lib/seo";
import { Metadata } from "next";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { TrackedOutboundLink, TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { ContactEmailLink } from "@/components/contact-email-link";
import { AboutLatestYoutube } from "@/components/about-latest-youtube";
import { contact, whatsAppGroupUrl } from "@/lib/contact";
import { siteConfig } from "@/lib/data";
import { Arrow } from "@/components/editorial/arrow";
import { PageIntro } from "@/components/editorial/page-intro";
import { PointerField } from "@/components/editorial/pointer-field";
import { RegistrationLink } from "@/components/public-experience/registration-link";

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
  ...socialMetadata({
    title: "About — Jaweria Amer",
    description:
      "Meet Jaweria Amer. Cambridge English mentor focused on rubric-driven practice, examiner-aligned feedback, and calm mentorship for O Level students.",
    path: "/about",
  }),
};

const EXPERTISE = [
  {
    title: "Pedagogical Expertise",
    desc: "Trained in flipped classrooms, active learning strategies, and medical education innovation.",
  },
  {
    title: "International Experience",
    desc: "Experience across multiple education systems, bringing a global perspective to student learning and academic pathways.",
  },
  {
    title: "Cambridge Specialist",
    desc: "Deep expertise in CAIE English Language (1123, 9093) and Literature syllabi.",
  },
  {
    title: "Student-Centred",
    desc: "Mentorship that prioritises well-being alongside academic rigour. No shortcuts, no burnout.",
  },
];

const DIFFERENCES = [
  "Rubric-driven instruction aligned to how Cambridge actually marks",
  "Examiner-style feedback on every piece of work",
  "Structured programmes, not ad-hoc sessions",
  "Calm, supportive mentorship that builds independence",
  "Transparent method: diagnostic, plan, practice, feedback",
  "No grade guarantees, no inflated claims. Just honest, consistent work",
];

export default function AboutPage() {
  const channels = [
    {
      key: "whatsapp",
      icon: <IconWhatsApp className="h-5 w-5" />,
      title: "WhatsApp",
      text: "Text us with questions or to get updates",
    },
    {
      key: "youtube",
      icon: <IconYouTube className="h-5 w-5" />,
      title: "YouTube",
      text: "Watch full lessons and breakdowns",
    },
    {
      key: "instagram",
      icon: <IconInstagram className="h-5 w-5" />,
      title: "Instagram",
      text: "Daily tips and writing insights",
    },
  ];
  const rowInner = (c: (typeof channels)[number]) => (
    <>
      <span className="ed-row-body">
        <span className="ed-row-title flex items-center gap-3">
          {c.icon}
          {c.title}
        </span>
      </span>
      <span className="ed-row-meta">
        <span>{c.text}</span>
      </span>
      <span className="ed-row-arrow" aria-hidden="true">
        <Arrow direction="up-right" />
      </span>
    </>
  );

  return (
    <>
      <PageIntro
        label="About"
        title={siteConfig.name}
        lead="Cambridge English mentor with international education experience, dedicated to structured mentorship that builds independent thinkers."
      />

      <section className="ed-paper border-t border-ink/10">
        <div className="ed-wrap grid gap-12 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16">
          {/* Portrait — the real photograph, art-directed on the brand crimson */}
          <PointerField className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div
                className="ed-stage relative mx-auto aspect-[4/5] w-full max-w-[26rem] overflow-hidden rounded-t-[999px] bg-crimson"
                data-depth="tilt"
                style={{
                  backgroundImage:
                    "radial-gradient(120% 80% at 50% 12%, rgba(255,196,186,0.34), transparent 60%)",
                }}
              >
                <div className="ed-stage-figure absolute inset-0">
                  <Image
                    src="/assets/miss-jay.png"
                    alt="Jaweria Amer, Cambridge English teacher"
                    fill
                    sizes="(min-width: 1024px) 34vw, 416px"
                    className="object-contain object-bottom"
                  />
                </div>
              </div>
              <p className="mx-auto mt-4 max-w-[26rem] border-t border-ink/15 pt-3 text-[0.875rem] text-slate">
                {siteConfig.name} — Miss Jay to her students. Karachi, Pakistan.
              </p>
            </div>
          </PointerField>

          <div className="space-y-16 lg:col-span-7">
            <section aria-labelledby="philosophy-heading">
              <p className="ed-label">Teaching philosophy</p>
              <h2 id="philosophy-heading" className="sr-only">
                Teaching Philosophy
              </h2>
              <blockquote className="ed-quote mt-6 text-[clamp(1.5rem,3.1vw,2.5rem)] text-ink">
                “My approach is simple: reduce confusion and give students a
                sense of control.”
              </blockquote>
              <div className="mt-8 max-w-2xl space-y-5 text-[1.06rem] leading-[1.7] text-ink-muted">
                <p>
                  We work with real paper patterns, build repeatable writing
                  structures, and practise under timed conditions — all while
                  keeping confidence intact.
                </p>
                <p>
                  Having achieved 9A*s &amp; 1A in O Levels and 3A*s and 2As, I
                  know the exact pressure students face in an exam. I&apos;ve
                  experienced it firsthand, which is why my focus is not just
                  on teaching content, but on helping students stay composed
                  and perform under pressure.
                </p>
                <p>
                  I teach English the way high-performing students actually
                  need it: clear structures, precise feedback, and habits that
                  hold up on exam day. Every session is built around Cambridge
                  marking criteria, so students learn how to think like
                  examiners and turn their writing into marks.
                </p>
              </div>
            </section>

            <section aria-label="Background">
              <dl className="grid border-t border-ink/15 sm:grid-cols-2 sm:gap-x-12">
                {EXPERTISE.map((item) => (
                  <div key={item.title} className="border-b border-ink/15 py-5">
                    <dt className="ed-h3">{item.title}</dt>
                    <dd className="mt-1.5 leading-relaxed text-slate">
                      {item.desc}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="apart-heading">
              <h2 id="apart-heading" className="ed-h2">
                What sets this apart
              </h2>
              <ul className="mt-8 border-t border-ink/15">
                {DIFFERENCES.map((item) => (
                  <li
                    key={item}
                    className="flex gap-4 border-b border-ink/15 py-4"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-1 h-5 w-5 shrink-0 text-crimson"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M4 12.5 9.5 18 20 6.5" />
                    </svg>
                    <span className="text-[1.06rem] leading-relaxed text-ink-muted">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </section>

      {/* YouTube — see the teaching */}
      <section className="ed-ink">
        <div className="ed-wrap grid gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-5">
            <p className="ed-label">On YouTube</p>
            <h2 className="ed-h2 mt-5">Learn directly from Jaweria</h2>
            <p className="ed-lead mt-5">
              Full lessons and paper-style breakdowns on YouTube — structured,
              calm, and aligned to how Cambridge marks.
            </p>
            <p className="mt-4 text-[0.9rem] text-paper/65">
              Used by students preparing for Cambridge O Level English exams
            </p>
            <TrackedOutboundLink
              href={contact.youtube}
              channel="youtube"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-link mt-6 text-paper"
            >
              Open full channel
              <Arrow direction="up-right" />
            </TrackedOutboundLink>
          </div>
          <div className="lg:col-span-7">
            <AboutLatestYoutube />
          </div>
        </div>
      </section>

      {/* Connect */}
      <section className="ed-paper">
        <div className="ed-wrap py-16 sm:py-24">
          <p className="ed-label">Connect</p>
          <h2 className="ed-h2 mt-5">
            Choose how you want to learn and stay updated
          </h2>
          <PointerField as="ul" className="ed-rows mt-10">
            <li>
              <TrackedWhatsAppLink
                href={whatsAppGroupUrl()}
                location="about_connect"
                variant="group"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-row ed-row-compact"
              >
                {rowInner(channels[0])}
              </TrackedWhatsAppLink>
            </li>
            <li>
              <TrackedOutboundLink
                href={contact.youtube}
                channel="youtube"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-row ed-row-compact"
              >
                {rowInner(channels[1])}
              </TrackedOutboundLink>
            </li>
            <li>
              <TrackedOutboundLink
                href={contact.instagram}
                channel="instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-row ed-row-compact"
              >
                {rowInner(channels[2])}
              </TrackedOutboundLink>
            </li>
            {contact.facebook.trim() ? (
              <li>
                <TrackedOutboundLink
                  href={contact.facebook.trim()}
                  channel="facebook"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-row ed-row-compact"
                >
                  {rowInner({
                    key: "facebook",
                    icon: <Newspaper className="h-5 w-5" aria-hidden />,
                    title: "Facebook",
                    text: "Updates and announcements",
                  })}
                </TrackedOutboundLink>
              </li>
            ) : null}
          </PointerField>
        </div>
      </section>

      {/* CTA */}
      <section className="ed-crimson">
        <div className="ed-wrap grid gap-8 py-16 sm:py-24 lg:grid-cols-12 lg:items-end lg:gap-16">
          <h2 className="ed-display text-[clamp(2.4rem,7vw,5.5rem)] lg:col-span-7">
            Let&apos;s start with a conversation
          </h2>
          <div className="lg:col-span-5">
            <p className="text-[1.06rem] leading-relaxed text-paper/80">
              A short call to understand where you are, where you want to be,
              and whether this is the right fit. No obligation.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <TrackedWhatsAppLink
                href={whatsAppGroupUrl()}
                location="about_footer_cta"
                variant="group"
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn ed-btn-paper ed-btn-lg"
              >
                Text us
                <Arrow direction="up-right" />
              </TrackedWhatsAppLink>
              <RegistrationLink
                surface="about_footer_cta"
                className="ed-btn ed-btn-ghost ed-btn-lg text-paper"
              >
                Join the Next Batch
                <Arrow />
              </RegistrationLink>
            </div>
            <p className="mt-5 text-[0.9rem] text-paper/70">
              Prefer email?{" "}
              <ContactEmailLink variant="onDark" className="font-medium" />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
