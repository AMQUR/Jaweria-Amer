import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { StructuredData } from "@/components/analytics/structured-data";
import { siteConfig } from "@/lib/data";
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
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "O Level English Teacher Karachi",
    "Best O Level English Teacher Karachi",
    "CAIE English Tutor",
    "Cambridge English Karachi",
    "O Level English 1123",
    "English Language Tuition Karachi",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    type: "website",
    locale: "en_US",
    url: "/",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: `${siteConfig.name} — Miss Jay`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
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
        <GoogleAnalytics />
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
