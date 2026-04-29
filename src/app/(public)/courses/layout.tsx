import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Cambridge O Level, Literature, and Creative Writing programmes—rubric-aligned, feedback-driven, and structured for exam success.",
  alternates: { canonical: "/courses" },
  openGraph: {
    title: "Courses",
    description:
      "Cambridge O Level, Literature, and Creative Writing programmes—rubric-aligned, feedback-driven, and structured for exam success.",
    type: "website",
    url: "/courses",
  },
  twitter: {
    card: "summary_large_image",
    title: "Courses",
    description:
      "Cambridge O Level, Literature, and Creative Writing programmes—rubric-aligned, feedback-driven, and structured for exam success.",
  },
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
