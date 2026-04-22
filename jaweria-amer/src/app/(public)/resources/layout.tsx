import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Structured learning hub: notes, topicals, yearlies, scripts, marking schemes, and MCQs for Cambridge O Level English.",
  alternates: { canonical: "/resources" },
  openGraph: {
    title: "Resources",
    description:
      "Structured learning hub: notes, topicals, yearlies, scripts, marking schemes, and MCQs for Cambridge O Level English.",
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
