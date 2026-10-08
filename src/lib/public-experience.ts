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
      title: "Directed Writing — Complete Revision",
      description:
        "Revise the approach to Directed Writing with a complete O Level lesson.",
      courseId: "o-level-english-1123",
      src: "https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/public-lessons/v1/directed-writing/index.m3u8",
      poster:
        "https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/public-lessons/v1/directed-writing/poster-topic.jpg",
      duration: "1 hr 14 min 28 sec",
    },
    {
      id: "demo-2",
      title: "Writer’s Effect",
      description:
        "Explore how a writer’s language creates effects, and how to explain them clearly. The original recording also references IGCSE 0500.",
      courseId: "o-level-english-1123",
      src: "https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/public-lessons/v1/writers-effect/index.m3u8",
      poster:
        "https://upyxhhbpdjlnbpraykow.supabase.co/storage/v1/object/public/public-lessons/v1/writers-effect/poster-topic.jpg",
      duration: "54 min 44 sec",
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

export function getBatchAnnouncement(now = new Date()) {
  return isBatchAnnouncementActive(now)
    ? publicExperience.batch
    : {
        ...publicExperience.batch,
        message:
          "Build your English skills with guided lessons and personal feedback.",
        cta: "Explore the Next Batch",
      };
}
