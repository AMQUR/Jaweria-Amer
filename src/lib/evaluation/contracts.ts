import { z } from "zod";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";

// Verified public tracks and visible topics; Directed Writing stays hidden.
export const evaluationCourses = PUBLIC_ENGLISH_SYLLABUSES;
export const evaluationTypes = [
  "Narrative writing",
  "Descriptive writing",
  "Summary",
  "Comprehension",
  "Grammar",
] as const;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;
export const evaluationInput = z.object({
  firstName: z.string().trim().min(1).max(60),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  course: z.enum(evaluationCourses),
  assignmentType: z.enum(evaluationTypes),
  answer: z.string().trim().max(12000),
  task: z
    .string()
    .trim()
    .min(10, "Include the question or task so your feedback is relevant.")
    .max(6000),
  consent: z.literal("yes"),
});
const feedbackPoint = z
  .object({
    observation: z.string().min(1).max(600),
    evidence: z.string().min(1).max(300),
  })
  .strict();
export const evaluationFeedback = z
  .object({
    readable: z.boolean(),
    strengths: z.array(feedbackPoint).max(4),
    biggestOpportunity: z.string().min(1).max(800),
    improvements: z.array(z.string().min(1).max(600)).max(4),
    originalExample: z.string().max(500),
    improvedExample: z.string().max(700),
    nextFocus: z.string().min(1).max(600),
  })
  .strict();
export type EvaluationFeedback = z.infer<typeof evaluationFeedback>;

export function validateAssignmentFile(
  name: string,
  mime: string,
  bytes: Uint8Array,
): string | null {
  if (!bytes.length || bytes.length > MAX_FILE_BYTES)
    return "Choose a file under 2 MB.";
  const ext = name.toLowerCase().split(".").pop();
  const pdf =
    mime === "application/pdf" &&
    ext === "pdf" &&
    Buffer.from(bytes.subarray(0, 5)).toString() === "%PDF-";
  const png =
    bytes.length >= 8 &&
    mime === "image/png" &&
    ext === "png" &&
    bytes
      .subarray(0, 8)
      .every((b, i) => b === [137, 80, 78, 71, 13, 10, 26, 10][i]);
  const jpg =
    mime === "image/jpeg" &&
    ["jpg", "jpeg"].includes(ext ?? "") &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes[2] === 255;
  if (!(pdf || png || jpg))
    return "Use a valid PDF, JPG or PNG. You can also paste your answer.";
  // Encrypted PDFs cannot be read; avoid passing embedded actions/files to the processor.
  if (
    pdf &&
    /\/(Encrypt|JavaScript|JS|EmbeddedFile|Launch)\b/.test(
      Buffer.from(bytes).toString("latin1"),
    )
  )
    return "Use a plain, unencrypted PDF or paste your answer.";
  return null;
}
