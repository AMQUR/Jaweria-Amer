import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileCheck2,
  LayoutDashboard,
  PlayCircle,
} from "lucide-react";
import { publicExperience } from "@/lib/public-experience";
import { courses } from "@/lib/data";
import { contact } from "@/lib/contact";
import { MediaPlayer } from "./media-player";
import { RegistrationLink, registrationButton } from "./registration-link";

export function HomePreview({ evaluationReady }: { evaluationReady: boolean }) {
  return (
    <>
      <section
        id="free-lessons"
        className="scroll-mt-24 bg-white px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-9 max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-crimson">
              See the teaching. Try the technique.
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
              Learn with Miss Jay before you join.
            </h2>
            <p className="mt-4 text-slate">
              Watch two complete O Level English Language 1123 lessons. Pause,
              practise the technique, and return to any part you want to
              revisit.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {publicExperience.lessons.map((lesson, i) => (
              <article
                key={lesson.id}
                className="rounded-3xl border border-border p-4 sm:p-5"
              >
                <MediaPlayer
                  src={lesson.src}
                  poster={lesson.poster}
                  title={lesson.title}
                  id={lesson.id}
                />
                <div className="p-3 pt-5">
                  <p className="text-xs font-semibold text-crimson">
                    {courses.find((c) => c.id === lesson.courseId)?.title} ·
                    1123
                  </p>
                  <h3 className="mt-2 font-serif text-xl text-ink">
                    {lesson.src ? lesson.title : `Lesson preview ${i + 1}`}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {lesson.src
                      ? lesson.description
                      : "The lesson title, topic and recording will be confirmed before this preview goes live."}
                  </p>
                  {lesson.duration && (
                    <p className="mt-3 text-xs text-slate">{lesson.duration}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
          <a
            href={contact.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-crimson underline-offset-4 hover:underline"
          >
            <PlayCircle className="h-4 w-4" aria-hidden />
            Watch more public lessons on YouTube{" "}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </a>
        </div>
      </section>
      <section
        id="try-it-free"
        className="scroll-mt-24 bg-cream px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-crimson">
              A little practice. A clearer plan.
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
              Your answer has a next level.
              <br />
              <span className="text-crimson">Let’s find it.</span>
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate">
              Send us a piece of your English work and discover what&apos;s
              already strong — and what could make your next answer better.
            </p>
            <Link
              href="/free-evaluation"
              className={`${registrationButton} mt-7`}
            >
              {evaluationReady ? "Get My Feedback" : "Explore Free Evaluation"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <p className="mt-3 text-xs text-slate">
              {evaluationReady
                ? "AI-assisted practice feedback. No official marks. No signup required."
                : "The feedback service is being prepared. No submissions are collected yet."}
            </p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-white p-6 shadow-[0_12px_40px_rgba(95,20,40,0.05)] sm:p-8">
            <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-crimson">
              <FileCheck2 className="h-4 w-4" aria-hidden />
              What your feedback will cover
            </p>
            {[
              {
                n: "01",
                title: "Keep what works",
                text: "Specific strengths, with evidence from your own answer.",
              },
              {
                n: "02",
                title: "Find the biggest opportunity",
                text: "The change most likely to make your writing clearer.",
              },
              {
                n: "03",
                title: "Try something better",
                text: "Practical suggestions and a clear next step for your practice.",
              },
            ].map((item) => (
              <div
                key={item.n}
                className="flex gap-4 border-t border-border py-5 last:pb-0"
              >
                <span className="pt-1 text-xs font-semibold text-crimson">
                  {item.n}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="student-experience"
        className="scroll-mt-24 border-y border-border/60 bg-cream px-4 py-16 sm:px-6 sm:py-24"
      >
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-crimson">
              After you join
            </p>
            <h2 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">
              More practice.
              <br />
              Less getting lost.
            </h2>
            <p className="mt-4 text-slate">
              Lessons, assignments, recordings and feedback — organized in your
              student portal so you can focus on the work.
            </p>
            <ul className="mt-6 space-y-4">
              {[
                {
                  icon: BookOpen,
                  title: "Learn and revisit",
                  text: "Live syllabus coverage, recorded lectures and exclusive notes.",
                },
                {
                  icon: FileCheck2,
                  title: "Practise and get feedback",
                  text: "Personalised assignment feedback and biweekly tests with checked copies.",
                },
                {
                  icon: LayoutDashboard,
                  title: "Stay accountable",
                  text: "Progress reports and attendance keep your preparation on track.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <item.icon
                    className="mt-1 h-5 w-5 shrink-0 text-crimson"
                    aria-hidden
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <RegistrationLink
              surface="lms_walkthrough"
              className={`${registrationButton} mt-7`}
            >
              Join the Next Batch <ArrowRight className="h-4 w-4" aria-hidden />
            </RegistrationLink>
          </div>
          <div className="rounded-3xl border border-border bg-white p-5 sm:p-7">
            <p className="mb-4 text-sm font-semibold text-ink">
              Take a look inside the student experience
            </p>
            {publicExperience.walkthrough.src ? (
              <MediaPlayer
                src={publicExperience.walkthrough.src}
                poster={publicExperience.walkthrough.poster}
                id="walkthrough"
                title="the student portal"
                kind="lms_walkthrough"
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-2xl bg-rose-50 p-6 text-center">
                <LayoutDashboard
                  className="h-10 w-10 text-crimson"
                  aria-hidden
                />
                <p className="max-w-xs text-sm leading-relaxed text-slate">
                  See Miss Jay&apos;s walkthrough of the learning experience.
                </p>
                <a
                  href={publicExperience.walkthrough.reference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-crimson/20 bg-white px-4 py-3 text-sm font-semibold text-crimson"
                >
                  Watch the walkthrough on Instagram{" "}
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </a>
              </div>
            )}
            <p className="mt-4 text-xs leading-relaxed text-slate">
              {publicExperience.walkthrough.src
                ? "A look at how your programme is organized."
                : "Opens the walkthrough shared by Miss Jay. A first-party recording will appear here when available."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
