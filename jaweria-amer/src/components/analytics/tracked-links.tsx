"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { trackCourseClick, trackOutboundLink, trackWhatsAppClick } from "@/lib/analytics";
import { getWhatsAppUrl, isInvalidWhatsAppLink } from "@/lib/contact";

type TrackedWhatsAppProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  location: string;
  variant?: "group";
};

/** WhatsApp community link with click analytics. Always opens the community — never direct chat. */
export function TrackedWhatsAppLink({
  href,
  location,
  variant = "group",
  onClick,
  children,
  ...rest
}: TrackedWhatsAppProps) {
  let safeHref = href;
  if (!href || isInvalidWhatsAppLink(href)) {
    if (typeof window !== "undefined") {
      console.warn("Blocked invalid WhatsApp link:", href);
    }
    safeHref = getWhatsAppUrl();
  }

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        trackWhatsAppClick({ location, variant });
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

type OutboundChannel = "youtube" | "instagram" | "facebook" | "drive" | "other";

type TrackedOutboundProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  channel: OutboundChannel;
};

export function TrackedOutboundLink({
  href,
  channel,
  onClick,
  children,
  ...rest
}: TrackedOutboundProps) {
  return (
    <a
      href={href}
      onClick={(e) => {
        trackOutboundLink(href, channel);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}

type TrackedCourseSyllabusProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  courseId: string;
};

/** Internal navigation to a course detail page (vault card "View syllabus"). */
export function TrackedCourseSyllabusLink({ href, courseId, onClick, ...rest }: TrackedCourseSyllabusProps) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        trackCourseClick(courseId, "course_card_syllabus");
        onClick?.(e);
      }}
      {...rest}
    />
  );
}
