"use client";
import type { AnchorHTMLAttributes } from "react";
import { ENROL_NOW_URL } from "@/lib/contact";
import { trackEvent } from "@/lib/analytics";
export const registrationButton =
  "ed-btn";
export function RegistrationLink({
  surface,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { surface: string }) {
  return (
    <a
      href={ENROL_NOW_URL}
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
