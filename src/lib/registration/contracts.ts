import { z } from "zod";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";

export const registrationInput = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
  course: z.enum(PUBLIC_ENGLISH_SYLLABUSES),
  consent: z.literal("yes"),
  website: z.string().max(0),
  ticket: z.string().max(200),
});
export type RegistrationInput = z.infer<typeof registrationInput>;
