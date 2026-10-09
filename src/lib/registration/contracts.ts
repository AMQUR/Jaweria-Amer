import { z } from "zod";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";

const O_LEVEL = "O Level English Language 1123";

export const registrationInput = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    course: z.enum(PUBLIC_ENGLISH_SYLLABUSES),
    batch: z.enum(["A", "B", "C"]).optional(),
    consent: z.literal("yes"),
    website: z.string().max(0),
    ticket: z.string().max(200),
  })
  .superRefine((value, context) => {
    if (value.course === O_LEVEL && !value.batch) {
      context.addIssue({
        code: "custom",
        path: ["batch"],
        message: "Choose a batch",
      });
    }
    if (value.course !== O_LEVEL && value.batch) {
      context.addIssue({
        code: "custom",
        path: ["batch"],
        message: "This course does not use an O Level batch",
      });
    }
  });
export type RegistrationInput = z.infer<typeof registrationInput>;

export function isOLevelRegistration(course: string) {
  return course === O_LEVEL;
}
