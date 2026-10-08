import type { Metadata } from "next";
import { EvaluationForm } from "@/components/public-experience/evaluation-form";
import { evaluationAvailable, evaluationLimit } from "@/lib/evaluation/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Free English Evaluation — O Level 1123",
  description:
    "Discover what is strong in your English answer and what to improve next with our free assessment preview.",
  alternates: { canonical: "/free-evaluation" },
};
export default function FreeEvaluationPage() {
  return (
    <div className="bg-cream px-4 pb-20 pt-28 sm:px-6 sm:pt-36">
      <div className="mx-auto max-w-3xl">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-crimson">
          Try the feedback experience
        </p>
        <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
          Know what to improve before your next paper.
        </h1>
        <p className="mb-10 mt-5 max-w-2xl text-base leading-relaxed text-slate">
          Send a piece of your own work. Get specific strengths, practical
          suggestions and one clear next step.
        </p>
        <EvaluationForm
          available={evaluationAvailable()}
          limit={evaluationLimit()}
        />
      </div>
    </div>
  );
}
