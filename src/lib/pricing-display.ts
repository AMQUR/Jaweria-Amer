/**
 * Public course pricing is temporarily hidden while numeric values remain on `Course`
 * and in admin. Flip `SHOW_PUBLIC_COURSE_PRICING` to restore visible fees site-wide.
 */
export const SHOW_PUBLIC_COURSE_PRICING = false;

export const PUBLIC_PRICING_PLACEHOLDER = "Ask in our WhatsApp Community";

export function getPublicCoursePriceLabel(course: { price: string }): string {
  if (SHOW_PUBLIC_COURSE_PRICING) return course.price;
  return PUBLIC_PRICING_PLACEHOLDER;
}
