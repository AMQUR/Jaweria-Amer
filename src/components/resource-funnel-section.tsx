import Link from "next/link";
import { BookOpen, LayoutGrid, FileText } from "lucide-react";

const PATHWAYS = [
  {
    level: "Beginner",
    icon: BookOpen,
    heading: "Build Foundation",
    description: "Start with structured notes on each topic before moving into practice.",
    tags: ["Notes"],
    href: "/resources?cat=general-notes",
    gradient: "from-rose-50 to-pink-50/60",
    border: "border-rose-200/60",
    accent: "text-rose-700",
    iconBg: "bg-rose-100 text-rose-700",
  },
  {
    level: "Practice",
    icon: LayoutGrid,
    heading: "Apply Concepts",
    description: "Work through topicals and past papers to build speed and accuracy.",
    tags: ["Topicals", "Yearlies"],
    href: "/resources?cat=topicals",
    gradient: "from-blue-50 to-sky-50/60",
    border: "border-blue-200/60",
    accent: "text-blue-700",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    level: "Master",
    icon: FileText,
    heading: "Learn Examiner Answers",
    description: "Study solved papers and the P2 Marathon for full exam mastery.",
    tags: ["Solved Papers", "Marathon"],
    href: "/resources?cat=solved-papers",
    gradient: "from-purple-50 to-violet-50/60",
    border: "border-purple-200/60",
    accent: "text-purple-700",
    iconBg: "bg-purple-100 text-purple-700",
  },
] as const;

export function ResourceFunnelSection() {
  return (
    <section className="border-b border-border/70 bg-white pb-10 pt-8 sm:pb-12 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Where to begin
        </p>
        <h2 className="mb-6 font-serif text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
          Start Here
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {PATHWAYS.map((p) => {
            const Icon = p.icon;
            return (
              <Link
                key={p.level}
                href={p.href}
                className={`group flex flex-col rounded-2xl border bg-gradient-to-br p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-md motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 ${p.gradient} ${p.border}`}
              >
                <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${p.iconBg}`}>
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <p className={`mb-1 text-[10px] font-bold uppercase tracking-widest ${p.accent}`}>
                  {p.level}
                </p>
                <h3 className="font-serif text-base font-semibold leading-snug text-ink">
                  {p.heading}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                  {p.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-border/60 bg-white px-2.5 py-0.5 text-[11px] font-medium text-ink"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
