import { Clock, CalendarDays, ArrowRight, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrackedCourseSyllabusLink, TrackedWhatsAppLink } from "@/components/analytics/tracked-links";
import type { Course } from "@/lib/data";
import { getPublicCoursePriceLabel } from "@/lib/pricing-display";
import { whatsAppGroupUrl } from "@/lib/contact";

const categoryColors: Record<string, string> = {
  "o-level": "border-crimson/15 bg-crimson/8 text-crimson",
  "a-level": "border-rose/20 bg-rose/10 text-rose-dark",
  literature: "border-border bg-brand-soft/80 text-brand",
  "creative-writing": "border-border bg-muted text-ink-muted",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <Card className="group overflow-hidden border-border/60 shadow-sm motion-reduce:hover:translate-y-0 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="flex h-full flex-col p-6 sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-3">
          <Badge
            variant="outline"
            className={categoryColors[course.category] ?? "border-border bg-muted/50 text-muted-foreground"}
          >
            {course.categoryLabel}
          </Badge>
          <span className="max-w-[14rem] shrink-0 text-right text-xs font-medium leading-relaxed text-muted-foreground sm:max-w-[15rem] sm:text-sm">
            {getPublicCoursePriceLabel(course)}
          </span>
        </div>

        <h3 className="mb-1.5 font-serif text-xl font-semibold leading-relaxed tracking-tight text-ink sm:text-2xl">
          {course.title}
        </h3>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{course.subtitle}</p>

        <p className="mb-6 flex-1 text-sm leading-relaxed text-slate sm:text-base">{course.description}</p>

        <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            {course.duration}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            {course.schedule}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <TrackedWhatsAppLink
            href={whatsAppGroupUrl()}
            location="course_card"
            variant="group"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            Join WhatsApp Community
            <ArrowRight className="h-4 w-4" />
          </TrackedWhatsAppLink>
          <TrackedCourseSyllabusLink
            href={`/courses/${course.id}`}
            courseId={course.id}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border/60 bg-white py-3 text-sm font-medium text-ink shadow-sm transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border hover:bg-muted/40 hover:shadow-md active:scale-[0.98] motion-reduce:hover:translate-y-0"
          >
            View syllabus
          </TrackedCourseSyllabusLink>
        </div>
      </CardContent>
    </Card>
  );
}
