import { ENROL_NOW_URL } from "@/lib/contact";

/** Marketing content in one place. No invented lesson sources: populate only approved media. */
export const publicExperience = {
  batch: {
    headline: "Your next A starts here.",
    message: "New batches start after 15 October.",
    startsAfter: "2026-10-15T23:59:59+05:00",
    visibleFrom: "2026-10-08T00:00:00+05:00",
    expiresAt: "2026-10-16T00:00:00+05:00",
    cta: "Join the New Batch",
    href: ENROL_NOW_URL,
  },
  lessons: [
    {
      id: "demo-1",
      title: "A first look at a real lesson",
      description:
        "See how Miss Jay explains a concept and turns it into useful exam practice.",
      courseId: "o-level-english-1123",
      src: "",
      poster: "",
      duration: "",
    },
    {
      id: "demo-2",
      title: "Put the technique into practice",
      description:
        "Follow a worked example, then bring the approach to your own answer.",
      courseId: "o-level-english-1123",
      src: "",
      poster: "",
      duration: "",
    },
  ],
  walkthrough: {
    src: "",
    poster: "",
    reference: "https://www.instagram.com/p/DeNJh7uDAni/",
  },
} as const;

export function isBatchAnnouncementActive(now = new Date()): boolean {
  return (
    now.getTime() >= Date.parse(publicExperience.batch.visibleFrom) &&
    now.getTime() < Date.parse(publicExperience.batch.expiresAt)
  );
}
