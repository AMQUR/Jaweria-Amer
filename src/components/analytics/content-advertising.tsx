"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";

/** Keep advertising on content pages, outside the conversion and private admin flows. */
export function ContentAdvertising() {
  const pathname = usePathname();
  if (
    !pathname.startsWith("/resources") &&
    !pathname.startsWith("/courses") &&
    pathname !== "/results" &&
    pathname !== "/about"
  )
    return null;
  return (
    <Script
      id="adsense"
      strategy="lazyOnload"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4448002138954159"
      crossOrigin="anonymous"
    />
  );
}
