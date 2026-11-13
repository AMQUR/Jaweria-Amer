import { z } from "zod";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";

const O_LEVEL = "O Level English Language 1123";

export const PHONE_ERROR =
  "Enter a valid WhatsApp or phone number with country code, for example +92 300 1234567.";

/**
 * Normalise a visitor-typed phone number to E.164 ("+923001234567"), or return
 * null when it is not plausible. Spaces, dashes, dots and brackets are removed
 * and a leading "00" becomes "+". A country code is required (no guessing a
 * default country), 8–15 digits in total, and obviously fake numbers made of a
 * single repeated digit are rejected. Pure and isomorphic: the browser form and
 * the server contract share it.
 */
export function normalizePhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.trim();
  if (!text || text.length > 32) return null;
  if (!/^[+\d\s().\-]+$/.test(text)) return null;
  if (text.indexOf("+") > 0 || text.split("+").length > 2) return null;
  const compact = text.replace(/[\s().\-]/g, "");
  const e164 = compact.startsWith("00") ? `+${compact.slice(2)}` : compact;
  if (!/^\+[1-9]\d{7,14}$/.test(e164)) return null;
  if (/^(\d)\1+$/.test(e164.slice(1))) return null;
  return e164;
}

export const registrationInput = z
  .object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().toLowerCase().max(254).pipe(z.email()),
    phone: z.string().max(32).transform((value, context) => {
      const phone = normalizePhone(value);
      if (!phone) {
        context.addIssue({ code: "custom", message: PHONE_ERROR });
        return z.NEVER;
      }
      return phone;
    }),
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
