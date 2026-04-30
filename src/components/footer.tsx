import Link from "next/link";
import type { SVGProps } from "react";
import { Mail, MapPin, Phone, PlayCircle, UsersRound, Camera, Newspaper } from "lucide-react";
import { TrackedOutboundLink, TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import { siteConfig } from "@/lib/data";
import { ContactEmailLink } from "@/components/contact-email-link";
import { contact, telUrl, whatsAppGroupUrl } from "@/lib/contact";

const whatsappGroupHref = whatsAppGroupUrl();

function InstagramGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-crimson text-white/75">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-4">
            <Link href="/" className="group inline-block">
              <p className="font-serif text-xl font-semibold tracking-tight text-white transition-colors group-hover:text-rose">
                {siteConfig.name}
              </p>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-white/65">
              Rubric-driven Cambridge English mentorship that builds clarity,
              examiner-aligned skill, and independent thinking for O Level
              students.
            </p>
          </div>

          <div>
            <h2 className="mb-5 font-serif text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Quick Links
            </h2>
            <ul className="space-y-3">
              {siteConfig.navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/70 transition-colors hover:text-rose"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-serif text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Contact
            </h2>
            <ul className="space-y-4 text-sm">
              <li className="inline-flex items-start gap-2.5 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
                <ContactEmailLink variant="onDark" />
              </li>
              <li>
                <a
                  href={telUrl()}
                  className="inline-flex items-start gap-2.5 text-white/70 transition-colors hover:text-rose"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
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
                  className="inline-flex items-start gap-2.5 text-white/70 transition-colors hover:text-rose"
                >
                  <UsersRound className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
                  <span>Join WhatsApp Community</span>
                </TrackedWhatsAppLink>
              </li>
              <li>
                <TrackedOutboundLink
                  href={contact.youtube}
                  channel="youtube"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Visit YouTube channel"
                  className="inline-flex items-start gap-2.5 text-white/70 transition-colors hover:text-rose"
                >
                  <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
                  <span>YouTube — English with Jaweria</span>
                </TrackedOutboundLink>
              </li>
              <li>
                <TrackedOutboundLink
                  href={contact.instagram}
                  channel="instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow on Instagram"
                  className="inline-flex items-start gap-2.5 text-white/70 transition-colors hover:text-rose"
                >
                  <Camera className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
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
                    aria-label="Visit Facebook page"
                    className="inline-flex items-start gap-2.5 text-white/70 transition-colors hover:text-rose"
                  >
                    <Newspaper className="mt-0.5 h-4 w-4 shrink-0 text-rose" aria-hidden />
                    <span>Facebook — Jaweria Amer</span>
                  </TrackedOutboundLink>
                </li>
              ) : null}
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" />
                <span>{contact.locationLine}</span>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-5 font-serif text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
              Legal
            </h2>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-white/70 transition-colors hover:text-rose"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-white/70 transition-colors hover:text-rose"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-crimson-dark/80">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-center text-xs text-white/50 sm:text-left">
              © 2026 Jaweria Amer. All Rights Reserved.
            </p>
            <TrackedOutboundLink
              href={contact.instagram}
              channel="instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-rose/50 hover:text-rose"
              aria-label="Follow on Instagram"
            >
              <InstagramGlyph className="h-5 w-5" />
            </TrackedOutboundLink>
          </div>
          <p className="mt-4 max-w-4xl text-center text-[11px] leading-relaxed text-[rgb(200,160,165)]/95 sm:text-left">
            CAIE™ and O Level™ are trademarks of Cambridge
            Assessment International Education. This site is not affiliated
            with or endorsed by Cambridge Assessment.
          </p>
        </div>
      </div>
    </footer>
  );
}
