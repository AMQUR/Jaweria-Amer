import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Literata, Source_Sans_3 } from "next/font/google";
import Script from "next/script";
import { ContentAdvertising } from "@/components/analytics/content-advertising";
import { StructuredData } from "@/components/analytics/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

// Display: expressive variable grotesque (weight + width + optical size axes).
const display = Bricolage_Grotesque({
  variable: "--ff-display",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  display: "swap",
});

// Body / UI: bookish, quiet, highly legible at exam-instruction lengths.
const body = Source_Sans_3({
  variable: "--ff-body",
  subsets: ["latin"],
  display: "swap",
});

// Editorial serif, italic only, used sparingly for the teacher's own words.
const quote = Literata({
  variable: "--ff-quote",
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
const validGaId = gaId && /^G-[A-Z0-9]+$/.test(gaId) && !/^G-X+$/.test(gaId);

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Jaweria Amer — O & A Level English with Miss Jay",
    template: "%s — Jaweria Amer",
  },
  description:
    "Cambridge English specialist helping students master O Level English 1123 with structured lessons, notes, and practice.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  keywords: [
    "O Level English Teacher Karachi",
    "Best O Level English Teacher Karachi",
    "CAIE English Tutor",
    "Cambridge English Karachi",
    "O Level English 1123",
    "English Language Tuition Karachi",
  ],
  authors: [{ name: "Jaweria Amer" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Jaweria Amer",
    description:
      "Cambridge English specialist helping students master O Level English 1123.",
    url: "/",
    siteName: "Jaweria Amer",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaweria Amer",
    description:
      "Cambridge English specialist helping students master O Level English 1123 with structured lessons, notes, and practice.",
    images: ["/opengraph-image.png"],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${quote.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ContentAdvertising />
        {validGaId && process.env.NODE_ENV === "production" && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `}
            </Script>
          </>
        )}
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
