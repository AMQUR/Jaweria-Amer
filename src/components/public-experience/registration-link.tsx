"use client";
import type { AnchorHTMLAttributes } from "react";
import { ENROL_NOW_URL } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
export const registrationButton =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-crimson px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-crimson-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-crimson";
export function RegistrationLink({
  surface,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { surface: string }) {
  return (
    <a
      href={ENROL_NOW_URL}
      target="_blank"
      rel="noopener noreferrer"
      {...props}
      onClick={() => {
        trackEvent("registration_cta_click", { surface });
        if (surface === "evaluation")
          trackEvent("evaluation_registration_click");
      }}
    >
      {children}
    </a>
  );
}
