import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { evaluationPubliclyListed } from "@/lib/evaluation/visibility";
import { socialMetadata } from "@/lib/seo";
import { PageIntro } from "@/components/editorial/page-intro";
import { EvaluationForm } from "@/components/public-experience/evaluation-form";
import { evaluationAvailable, evaluationLimit } from "@/lib/evaluation/server";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: evaluationPubliclyListed() ? undefined : { index: false, follow: false },
  title: "Free English Evaluation — O Level 1123",
  description:
    "Discover what is strong in your English answer and what to improve next with our free assessment preview.",
  alternates: { canonical: "/free-evaluation" },
  ...socialMetadata({
    title: "Free English Evaluation — O Level 1123",
    description:
      "Discover what is strong in your English answer and what to improve next with our free assessment preview.",
    path: "/free-evaluation",
  }),
};
export default function FreeEvaluationPage() {
  if (!evaluationPubliclyListed()) notFound();
  return (
    <>
      <PageIntro
        size="md"
        label="Try the feedback experience"
        title="Know what to improve before your next paper."
        lead="Send a piece of your own work. Get specific strengths, practical suggestions and one clear next step."
      />
      <div className="ed-paper border-t border-ink/10 pb-20 pt-10 sm:pt-14">
        <div className="ed-wrap">
          <div className="max-w-3xl">
            <EvaluationForm
              available={evaluationAvailable()}
              limit={evaluationLimit()}
            />
          </div>
        </div>
      </div>
    </>
  );
}
