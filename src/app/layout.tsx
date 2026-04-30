import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { StructuredData } from "@/components/analytics/structured-data";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

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
    images: ["/icon.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jaweria Amer",
    description:
      "Cambridge English specialist helping students master O Level English 1123 with structured lessons, notes, and practice.",
    images: ["/icon.png"],
  },
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {process.env.NEXT_PUBLIC_GA_ID &&
          process.env.NODE_ENV === "production" && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  window.gtag = gtag;
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
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
