import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
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
  title: "Jaweria Amer",
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
        <GoogleAnalytics />
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
