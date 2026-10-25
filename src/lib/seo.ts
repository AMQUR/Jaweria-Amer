import type { Metadata } from "next";

/**
 * A page-level `openGraph`/`twitter` object replaces the root layout's one, so
 * every page that sets its own social metadata must also carry the share image.
 */
export const SOCIAL_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Jaweria Amer — O & A Level English with Miss Jay",
} as const;

export function socialMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      title,
      description,
      type: "website",
      url: path,
      siteName: "Jaweria Amer",
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE.url],
    },
  };
}
