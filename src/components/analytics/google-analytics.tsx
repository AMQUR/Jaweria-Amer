import Script from "next/script";

/**
 * Loads GA4 only in production when `NEXT_PUBLIC_GA_ID` is set. No-ops safely otherwise.
 */
export function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const isProd = process.env.NODE_ENV === "production";
  if (!isProd || !gaId) return null;

  return (
    <>
      <Script
        id="ga4-gtag-js"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-config" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { send_page_view: true });
`}
      </Script>
    </>
  );
}
