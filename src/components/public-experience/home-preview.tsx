import Link from "next/link";
import { publicExperience } from "@/lib/public-experience";
import { courses, RESOURCE_HUB_CATEGORIES } from "@/lib/data";
import { contact } from "@/lib/contact";
import { Arrow } from "@/components/editorial/arrow";
import { PointerField } from "@/components/editorial/pointer-field";
import { MediaPlayer } from "./media-player";
import { YouTubeEmbed } from "./youtube-embed";
import { RegistrationLink } from "./registration-link";

/** See the teaching: the two approved full lessons, click-to-play. */
export function LessonsSection() {
  return (
    <section id="free-lessons" className="ed-ink scroll-mt-24">
      <div className="ed-wrap py-16 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <p className="ed-label">See the teaching. Try the technique.</p>
            <h2 className="ed-h2 mt-5">Learn with Miss Jay before you join.</h2>
          </div>
          <p className="ed-lead lg:pb-1">
            Watch two complete O Level English Language 1123 lessons. Pause,
            practise the technique, and return to any part you want to revisit.
          </p>
        </div>
        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
          {publicExperience.lessons.map((lesson, i) => (
            <article key={lesson.id}>
              <MediaPlayer
                src={lesson.src}
                poster={lesson.poster}
                title={lesson.title}
                id={lesson.id}
              />
              <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-paper/15 pt-4 text-[0.875rem] font-semibold text-[#f0a79d]">
                <span>
                  {courses.find((c) => c.id === lesson.courseId)?.title} · 1123
                </span>
                {lesson.duration && (
                  <span className="shrink-0 tabular-nums text-paper/70">
                    {lesson.duration}
                  </span>
                )}
              </div>
              <h3 className="ed-h3 mt-3">
                {lesson.src ? lesson.title : `Lesson preview ${i + 1}`}
              </h3>
              <p className="mt-2 max-w-md leading-relaxed text-paper/75">
                {lesson.src
                  ? lesson.description
                  : "The lesson title, topic and recording will be confirmed before this preview goes live."}
              </p>
            </article>
          ))}
        </div>
        <a
          href={contact.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="ed-link mt-10 text-paper"
        >
          Watch more public lessons on YouTube
          <Arrow direction="up-right" />
        </a>
      </div>
    </section>
  );
}

const HOME_RESOURCE_DOORS = [
  "general-notes",
  "topicals",
  "yearly-past-papers",
  "quick-worksheets",
] as const;

/** Try the resources: four category doors, then the free-evaluation path. */
export function ResourcesAndEvaluation({
  evaluationReady,
}: {
  evaluationReady: boolean;
}) {
  const doors = HOME_RESOURCE_DOORS.map((id) =>
    RESOURCE_HUB_CATEGORIES.find((c) => c.id === id),
  ).filter((c): c is (typeof RESOURCE_HUB_CATEGORIES)[number] => Boolean(c));

  return (
    <section className="ed-paper">
      <div className="ed-wrap py-16 sm:py-24">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
          <div>
            <p className="ed-label">Free resource library</p>
            <h2 className="ed-h2 mt-5">Practise with the real material.</h2>
          </div>
          <p className="ed-lead lg:pb-1">
            Notes, topicals, yearlies and quick MCQ worksheets for Cambridge O
            Level English, organised so you always know what to open next.
          </p>
        </div>

        <PointerField as="ul" className="ed-rows mt-10">
          {doors.map((door) => (
            <li key={door.id}>
              <Link
                href={`/resources?cat=${door.id}#resource-hub`}
                className="ed-row ed-row-compact"
              >
                <span className="ed-row-body">
                  <span className="ed-row-title">{door.label}</span>
                </span>
                <span className="ed-row-meta">
                  <span>{door.blurb}</span>
                </span>
                <span className="ed-row-arrow" aria-hidden="true">
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </PointerField>
        <Link href="/resources" className="ed-link mt-8 text-crimson">
          Open the full library
          <Arrow />
        </Link>

        <div
          id="try-it-free"
          className="mt-20 grid scroll-mt-24 gap-10 border-t border-ink/15 pt-14 lg:grid-cols-2 lg:gap-20"
        >
          <div>
            <p className="ed-label">A little practice. A clearer plan.</p>
            <h2 className="ed-h2 mt-5">
              Your answer has a next level. Let’s find it.
            </h2>
            <p className="ed-lead mt-5">
              Send us a piece of your English work and discover what&apos;s
              already strong — and what could make your next answer better.
            </p>
            <Link href="/free-evaluation" className="ed-btn ed-btn-ink mt-7">
              {evaluationReady ? "Get My Feedback" : "Explore Free Evaluation"}
              <Arrow />
            </Link>
            <p className="mt-3 text-[0.875rem] text-slate">
              {evaluationReady
                ? "AI-assisted practice feedback. No official marks. No signup required."
                : "The feedback service is being prepared. No submissions are collected yet."}
            </p>
          </div>
          <div>
            <p className="text-[0.875rem] font-semibold text-crimson">
              What your feedback will cover
            </p>
            <ul className="mt-4 border-t border-ink/15">
              {[
                {
                  title: "Keep what works",
                  text: "Specific strengths, with evidence from your own answer.",
                },
                {
                  title: "Find the biggest opportunity",
                  text: "The change most likely to make your writing clearer.",
                },
                {
                  title: "Try something better",
                  text: "Practical suggestions and a clear next step for your practice.",
                },
              ].map((item) => (
                <li key={item.title} className="border-b border-ink/15 py-5">
                  <h3 className="ed-h3">{item.title}</h3>
                  <p className="mt-1.5 leading-relaxed text-slate">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/** After you join: what the programme includes, and the approved LMS walkthrough. */
export function StudentExperience() {
  const { walkthrough } = publicExperience;
  const hasVideo = Boolean(walkthrough.youtubeId || walkthrough.src);
  return (
    <section
      id="student-experience"
      className="scroll-mt-24 border-y border-ink/10 bg-paper-deep"
    >
      <div className="ed-wrap grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <p className="ed-label">After you join</p>
          <h2 className="ed-h2 mt-5">More practice. Less getting lost.</h2>
          <p className="ed-lead mt-5">
            Lessons, assignments, recordings and feedback — organized in your
            student portal so you can focus on the work.
          </p>
          <ul className="mt-8 border-t border-ink/15">
            {[
              {
                title: "Learn and revisit",
                text: "Live syllabus coverage, recorded lectures and exclusive notes.",
              },
              {
                title: "Practise and get feedback",
                text: "Personalised assignment feedback and biweekly tests with checked copies.",
              },
              {
                title: "Stay accountable",
                text: "Progress reports and attendance keep your preparation on track.",
              },
            ].map((item) => (
              <li
                key={item.title}
                className="grid gap-1 border-b border-ink/15 py-4 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
              >
                <h3 className="font-sans text-[1rem] font-semibold tracking-normal text-ink">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-slate">{item.text}</p>
              </li>
            ))}
          </ul>
          <RegistrationLink surface="lms_walkthrough" className="ed-btn mt-8">
            Join the Next Batch
            <Arrow />
          </RegistrationLink>
        </div>
        <div>
          <p className="mb-4 font-semibold text-ink">
            Take a look inside the student experience
          </p>
          {walkthrough.youtubeId ? (
            <YouTubeEmbed
              videoId={walkthrough.youtubeId}
              title="How to navigate the student portal"
            />
          ) : walkthrough.src ? (
            <MediaPlayer
              src={walkthrough.src}
              poster={walkthrough.poster}
              id="walkthrough"
              title="the student portal"
              kind="lms_walkthrough"
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 rounded-xl bg-paper p-6 text-center ring-1 ring-ink/10">
              <p className="max-w-xs leading-relaxed text-slate">
                See Miss Jay&apos;s walkthrough of the learning experience.
              </p>
              <a
                href={walkthrough.reference}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-btn ed-btn-ghost text-crimson"
              >
                Watch the walkthrough on Instagram
                <Arrow direction="up-right" />
              </a>
            </div>
          )}
          <p className="mt-4 text-[0.875rem] leading-relaxed text-slate">
            {hasVideo
              ? "A look at how your programme is organized."
              : "Opens the walkthrough shared by Miss Jay. A first-party recording will appear here when available."}
          </p>
        </div>
      </div>
    </section>
  );
}
