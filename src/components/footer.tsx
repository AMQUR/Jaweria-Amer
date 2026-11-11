import Link from "next/link";
import type { SVGProps } from "react";
import {
  Mail,
  MapPin,
  Phone,
  PlayCircle,
  UsersRound,
  Camera,
  Newspaper,
} from "lucide-react";
import {
  TrackedOutboundLink,
  TrackedWhatsAppLink,
} from "@/components/analytics/tracked-links";
import { courses, siteConfig } from "@/lib/data";
import { listMarketingCourses } from "@/lib/course-offerings";
import { courseSyllabusCodes } from "@/components/editorial/interactive-course-row";
import { Arrow } from "@/components/editorial/arrow";
import { ContactEmailLink } from "@/components/contact-email-link";
import { contact, ENROL_NOW_URL, telUrl, whatsAppGroupUrl } from "@/lib/contact";

const whatsappGroupHref = whatsAppGroupUrl();

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

const footLink =
  "inline-flex min-h-9 items-center gap-2.5 text-[0.95rem] text-paper/70 transition-colors hover:text-paper";
const footHead = "mb-4 text-[0.8125rem] font-semibold text-[#f0a79d]";

export function Footer() {
  const programmes = listMarketingCourses(courses);
  return (
    <footer className="ed-ink">
      <div className="ed-wrap pb-10 pt-16 sm:pt-24">
        {/* Closing statement: the brand, then the single next step. */}
        <div className="flex flex-col gap-8 border-b border-paper/15 pb-12 lg:flex-row lg:items-end lg:justify-between">
          <Link href="/" className="group block">
            <p
              className="ed-display text-[clamp(3.2rem,13vw,10.5rem)] text-paper transition-colors duration-500 group-hover:text-[#f0a79d]"
              aria-label={siteConfig.name}
            >
              Jaweria
              <br />
              Amer
            </p>
          </Link>
          <div className="max-w-sm lg:pb-3">
            <p className="ed-quote text-[1.35rem] text-paper/90">
              Rubric-driven Cambridge English mentorship that builds clarity,
              examiner-aligned skill, and independent thinking.
            </p>
            <TrackedOutboundLink
              href={ENROL_NOW_URL}
              channel="enrol"
              className="ed-btn ed-btn-paper mt-6"
            >
              Join the Next Batch
              <Arrow />
            </TrackedOutboundLink>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 pt-12 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <h2 className={footHead}>Programmes</h2>
            <ul>
              {programmes.map((course) => (
                <li key={course.id}>
                  <Link href={`/courses/${course.id}`} className={footLink}>
                    <span className="ed-num w-[4.6rem] shrink-0 text-[0.95rem] text-paper">
                      {courseSyllabusCodes(course).join("/")}
                    </span>
                    {course.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className={footHead}>Explore</h2>
            <ul>
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/free-evaluation" className={footLink}>
                  Free evaluation
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <h2 className={footHead}>Contact</h2>
            <ul>
              <li className={footLink}>
                <Mail className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                <ContactEmailLink variant="onDark" />
              </li>
              <li>
                <a href={telUrl()} className={footLink}>
                  <Phone className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                  <span>{contact.phone}</span>
                </a>
              </li>
              <li>
                <TrackedWhatsAppLink
                  href={whatsappGroupHref}
                  location="footer"
                  variant="group"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footLink}
                >
                  <UsersRound className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                  <span>Text us on WhatsApp</span>
                </TrackedWhatsAppLink>
              </li>
              <li>
                <TrackedOutboundLink
                  href={contact.youtube}
                  channel="youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footLink}
                >
                  <PlayCircle className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                  <span>YouTube — English with Jaweria</span>
                </TrackedOutboundLink>
              </li>
              <li>
                <TrackedOutboundLink
                  href={contact.instagram}
                  channel="instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={footLink}
                >
                  <Camera className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                  <span>Instagram — @englishwithmissjay</span>
                </TrackedOutboundLink>
              </li>
              {contact.facebook.trim() ? (
                <li>
                  <TrackedOutboundLink
                    href={contact.facebook.trim()}
                    channel="facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={footLink}
                  >
                    <Newspaper className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                    <span>Facebook — Jaweria Amer</span>
                  </TrackedOutboundLink>
                </li>
              ) : null}
              <li className={footLink}>
                <MapPin className="h-4 w-4 shrink-0 text-[#f0a79d]" aria-hidden />
                <span>{contact.locationLine}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className={footHead}>Legal</h2>
            <ul>
              <li>
                <Link href="/terms" className={footLink}>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className={footLink}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-paper/60">
            © 2026 Jaweria Amer. All Rights Reserved.
          </p>
          <TrackedOutboundLink
            href={contact.instagram}
            channel="instagram"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/20 text-paper/70 transition-colors hover:border-paper/60 hover:text-paper"
            aria-label="Follow on Instagram"
          >
            <InstagramGlyph className="h-5 w-5" />
          </TrackedOutboundLink>
        </div>
        <p className="mt-4 max-w-4xl pb-16 text-[0.75rem] leading-relaxed text-paper/55 sm:pb-0">
          CAIE™ and O Level™ are trademarks of Cambridge Assessment
          International Education. This site is not affiliated with or endorsed
          by Cambridge Assessment.
        </p>
      </div>
    </footer>
  );
}
