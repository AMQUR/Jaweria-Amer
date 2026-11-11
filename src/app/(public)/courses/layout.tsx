import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Courses",
  description:
    "Cambridge O Level 1123, IGCSE 0500 and 0510/0511, and AS/A Level 9093 English programmes — rubric-aligned, feedback-driven, and structured for exam success.",
  alternates: { canonical: "/courses" },
  ...socialMetadata({
    title: "Courses — Jaweria Amer",
    description:
      "Cambridge O Level 1123, IGCSE 0500 and 0510/0511, and AS/A Level 9093 English programmes — rubric-aligned, feedback-driven, and structured for exam success.",
    path: "/courses",
  }),
};

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
