/**
 * Programme offerings: what appears in admin UI, public course directory, and filters.
 * Full unions stay available for stored JSON / TypeScript so legacy rows (e.g. A Level) remain valid.
 */

// --- Admin store (`AdminCourse.level`) ---

export const ADMIN_COURSE_LEVELS_ALL = ["O Level", "A Level", "Literature", "Creative Writing"] as const;
export type CourseLevel = (typeof ADMIN_COURSE_LEVELS_ALL)[number];

/** Levels shown when creating or editing a course. Append `"A Level"` to restore the A Level track in forms. */
export const ADMIN_COURSE_LEVELS_OFFERED: readonly CourseLevel[] = [
  "O Level",
  "Literature",
  "Creative Writing",
];

export function getAdminCourseLevelSelectOptions(currentLevel: CourseLevel | undefined): CourseLevel[] {
  const offered = [...ADMIN_COURSE_LEVELS_OFFERED];
  if (currentLevel && !offered.includes(currentLevel)) {
    offered.push(currentLevel);
  }
  return offered;
}

// --- Public marketing courses (`Course.category` slug) ---

export const COURSE_CATEGORY_SLUGS_ALL = ["o-level", "a-level", "literature", "creative-writing"] as const;
export type CourseCategory = (typeof COURSE_CATEGORY_SLUGS_ALL)[number];

const CATEGORY_LABELS: Record<CourseCategory, string> = {
  "o-level": "O Level",
  "a-level": "A Level",
  literature: "Literature",
  "creative-writing": "Creative Writing",
};

/** Categories listed on `/courses` and home featured carousel. Append `"a-level"` to surface A Level again. */
export const COURSE_CATEGORY_SLUGS_OFFERED: readonly CourseCategory[] = [
  "o-level",
  "literature",
  "creative-writing",
];

export function isCourseCategoryOffered(slug: CourseCategory): boolean {
  return (COURSE_CATEGORY_SLUGS_OFFERED as readonly string[]).includes(slug);
}

export function listMarketingCourses<T extends { category: CourseCategory }>(all: readonly T[]): T[] {
  return all.filter((c) => isCourseCategoryOffered(c.category));
}

export type MarketingCourseFilterValue = "all" | CourseCategory;

export const MARKETING_COURSE_FILTER_CHIPS: { value: MarketingCourseFilterValue; label: string }[] = [
  { value: "all", label: "All Programmes" },
  ...COURSE_CATEGORY_SLUGS_OFFERED.map((slug) => ({
    value: slug,
    label: CATEGORY_LABELS[slug],
  })),
];

export function marketingCategoryLabel(slug: CourseCategory): string {
  return CATEGORY_LABELS[slug];
}
