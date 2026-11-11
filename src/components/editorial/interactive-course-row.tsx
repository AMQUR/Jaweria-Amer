import type { Course } from "@/lib/data";
import { TrackedCourseSyllabusLink } from "@/components/analytics/tracked-links";
import { Arrow } from "./arrow";

/**
 * Cambridge syllabus code(s) for a course, read from its published subtitle
 * ("CAIE 0510 / 0511 - Complete Preparation" → ["0510", "0511"]). Data-derived
 * so a renamed or re-coded course can never show a stale number.
 */
export function courseSyllabusCodes(course: Pick<Course, "subtitle" | "id">): string[] {
  const fromSubtitle = course.subtitle.match(/\b\d{4}\b/g);
  if (fromSubtitle?.length) return fromSubtitle;
  return course.id.match(/\b\d{4}\b/g) ?? [];
}

export function SyllabusCode({ codes }: { codes: string[] }) {
  if (!codes.length) return null;
  const [first, ...rest] = codes;
  return (
    <>
      {first}
      {rest.map((code) => (
        <small key={code}>/{code}</small>
      ))}
    </>
  );
}

/**
 * One ruled programme row. The whole row is a single link to the course
 * page, so it is one tab stop and one tap target; hover, focus and press
 * all light it the same way (see `.ed-row` in globals.css).
 * Wrap a list of these in <PointerField as="ul" className="ed-rows">.
 */
export function InteractiveCourseRow({ course, headingLevel = "h3" }: { course: Course; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const codes = courseSyllabusCodes(course);
  return (
    <li>
      <TrackedCourseSyllabusLink
        href={`/courses/${course.id}`}
        courseId={course.id}
        className="ed-row"
        data-depth="tilt"
        data-course-row={course.id}
      >
        <span className="ed-row-code ed-num" aria-hidden="true">
          <SyllabusCode codes={codes} />
        </span>
        <span className="ed-row-body">
          <Heading className="ed-row-title">{course.title}</Heading>
          <span className="ed-row-sub">
            <span className="sr-only">Syllabus {codes.join(" and ")}. </span>
            {course.categoryLabel} · Cambridge {codes.join(" / ")}
          </span>
        </span>
        <span className="ed-row-meta">
          <span>{course.duration}</span>
          <span>{course.schedule}</span>
        </span>
        <span className="ed-row-arrow" aria-hidden="true">
          <Arrow />
        </span>
      </TrackedCourseSyllabusLink>
    </li>
  );
}
