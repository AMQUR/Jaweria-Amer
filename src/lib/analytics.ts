/**
 * GA4-ready event helpers. Safe when `NEXT_PUBLIC_GA_ID` is unset or `gtag` is not yet loaded.
 * Never import server-only secrets here.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function hasPublicGaId(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GA_ID?.trim());
}

function sendGtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  gtag(...args);
}

/** Generic GA4 event (only fires when GA is configured and `gtag` exists). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!hasPublicGaId()) return;
  sendGtag("event", name, params ?? {});
}

export function trackWhatsAppClick(params?: { location?: string; variant?: "direct" | "group" }) {
  trackEvent("whatsapp_click", {
    variant: params?.variant ?? "direct",
    ...(params?.location ? { location: params.location } : {}),
  });
}

export function trackResourceView(
  resourceId: string,
  resourceTitle?: string,
  extra?: Record<string, unknown>
) {
  trackEvent("resource_view", {
    resource_id: resourceId,
    ...(resourceTitle ? { resource_title: resourceTitle } : {}),
    ...extra,
  });
}

export function trackCourseClick(courseId: string, surface: string) {
  trackEvent("course_click", { course_id: courseId, surface });
}

export function trackOutboundLink(url: string, channel?: string) {
  trackEvent("outbound_link", {
    link_url: url,
    channel: channel ?? "other",
  });
}
