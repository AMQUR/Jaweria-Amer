import type { Metadata } from "next";
import { socialMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Structured learning hub: notes, topicals, yearlies, scripts, marking schemes, and MCQs for Cambridge O Level English.",
  alternates: { canonical: "/resources" },
  ...socialMetadata({
    title: "Resources — Jaweria Amer",
    description:
      "Structured learning hub: notes, topicals, yearlies, scripts, marking schemes, and MCQs for Cambridge O Level English.",
    path: "/resources",
  }),
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
