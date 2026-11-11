/**
 * Footer "Help" links. Each entry stays hidden until its page exists on this
 * branch, so the footer can never link to a 404.
 *
 * The four entries below belong to the help pages (class timings, FAQ, exam
 * countdown, study plans) that are still in progress outside this branch.
 * When those pages land, flip `live` to true for each one — nothing else in
 * the footer needs to change.
 */
export const FOOTER_HELP_LINKS: readonly {
  href: string;
  label: string;
  live: boolean;
}[] = [
  { href: "/class-timings", label: "Class Timings", live: false },
  { href: "/faq", label: "FAQ", live: false },
  { href: "/exam-countdown", label: "Exam Countdown", live: false },
  { href: "/study-plan", label: "Free Study Plans", live: false },
];

export function liveFooterHelpLinks() {
  return FOOTER_HELP_LINKS.filter((link) => link.live);
}
