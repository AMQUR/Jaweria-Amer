import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Cambridge O Level, Literature, and Creative Writing programmes—rubric-aligned, feedback-driven, and structured for exam success.",
  alternates: { canonical: "/courses" },
  ...socialMetadata({
    title: "Courses — Jaweria Amer",
    description:
      "Cambridge O Level, Literature, and Creative Writing programmes—rubric-aligned, feedback-driven, and structured for exam success.",
    path: "/courses",
  }),
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
