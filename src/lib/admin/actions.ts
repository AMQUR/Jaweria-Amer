"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, normalizeAdminEmail } from "./auth";
import { after } from "next/server";
import { headers } from "next/headers";
import { hashNetwork } from "./reset-tokens";
import {
  completeAdminPasswordReset,
  issueAdminPasswordReset,
} from "./password-reset";
import { ADMIN_COURSE_LEVELS_ALL } from "@/lib/course-offerings";
import {
  saveCourse,
  deleteCourse,
  saveResource,
  updateResourceVisibility,
  deleteResource,
  updateLeadStatus,
  deleteLead,
  saveSettings,
  type CourseStatus,
  type ResourceVisibility,
  type ResourceCategory,
  type LeadStatus,
} from "./store";

// --- Auth actions ---

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(_prev: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await login(parsed.data.email, parsed.data.password);
  if (!result.success) {
    return { error: result.error };
  }

  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

/** Keyed hash of the caller's address; never the address itself. */
async function callerNetworkHash(): Promise<string> {
  let address = "";
  try {
    const h = await headers();
    address = h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ?? "";
  } catch {
    // No request scope (tests).
  }
  return hashNetwork(address || (process.env.NODE_ENV !== "production" ? "local" : "unknown"));
}

export async function requestPasswordResetAction(_prev: unknown, formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim();
  if (adminEmail && normalizeAdminEmail(parsed.data.email) === normalizeAdminEmail(adminEmail)) {
    // The store call and the e-mail run after the response, so the reply and
    // its timing are the same whether or not the address matched.
    const networkHash = await callerNetworkHash();
    after(() => issueAdminPasswordReset(adminEmail, networkHash));
  } else {
    console.warn("[admin password reset] request for an address that is not the admin");
  }

  // Same reply whether or not the address matched, was limited, or the e-mail failed.
  return { success: true as const };
}

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset link is invalid"),
    password: z.string().min(8, "Use at least 8 characters").max(128, "Password is too long"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export async function resetPasswordAction(_prev: unknown, formData: FormData) {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: issue?.message ?? "Invalid input" };
  }

  const result = await completeAdminPasswordReset(
    parsed.data.token,
    parsed.data.password,
    await callerNetworkHash(),
  );
  if (result !== "ok") {
    return {
      error:
        result === "expired"
          ? "This reset link has expired. Request a new one."
          : result === "used"
            ? "This reset link was already used. Request a new one."
            : result === "limited"
              ? "Too many attempts. Please wait a few minutes and try again."
              : result === "unavailable"
                ? "Password reset is not available right now. Please contact the site administrator."
                : result === "store_error"
                  ? "Password reset is temporarily unavailable. Please try again shortly."
                  : "This reset link is invalid. Request a new one.",
    };
  }

  // Whoever completed the reset signs in again with the new password.
  await logout();
  redirect("/admin/login?reset=1");
}

// --- Course actions ---

const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200),
  level: z.enum(ADMIN_COURSE_LEVELS_ALL),
  price: z.coerce.number().min(0, "Price must be positive").max(1000000),
  status: z.enum(["active", "draft"]),
  syllabusFile: z.string().max(200).optional(),
});

export async function saveCourseAction(_prev: unknown, formData: FormData) {
  const rawSyllabus = formData.get("syllabusFile");
  const parsed = courseSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    level: formData.get("level"),
    price: formData.get("price"),
    status: formData.get("status"),
    syllabusFile: rawSyllabus && typeof rawSyllabus === "string" && rawSyllabus.trim() ? rawSyllabus.trim() : undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await saveCourse({
    ...parsed.data,
    level: parsed.data.level,
    status: parsed.data.status as CourseStatus,
  });

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteCourseAction(id: string) {
  await deleteCourse(id);
  revalidatePath("/admin/courses");
}

// --- Resource actions ---

const resourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  category: z.enum(["past-paper", "notes", "marking-scheme", "examiner-report", "worksheet", "checklist"]),
  visibility: z.enum(["public", "student-only"]),
  fileName: z.string().min(1),
  fileSize: z.coerce.number().min(1).max(50 * 1024 * 1024, "File size must be under 50MB"),
});

export async function saveResourceAction(_prev: unknown, formData: FormData) {
  const parsed = resourceSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    visibility: formData.get("visibility"),
    fileName: formData.get("fileName"),
    fileSize: formData.get("fileSize"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await saveResource({
    ...parsed.data,
    category: parsed.data.category as ResourceCategory,
    visibility: parsed.data.visibility as ResourceVisibility,
  });

  revalidatePath("/admin/resources");
  return { success: true };
}

export async function toggleResourceVisibilityAction(id: string, visibility: ResourceVisibility) {
  await updateResourceVisibility(id, visibility);
  revalidatePath("/admin/resources");
}

export async function deleteResourceAction(id: string) {
  await deleteResource(id);
  revalidatePath("/admin/resources");
}

// --- Lead actions ---

export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  await updateLeadStatus(id, status);
  revalidatePath("/admin/leads");
}

export async function deleteLeadAction(id: string) {
  await deleteLead(id);
  revalidatePath("/admin/leads");
}

// --- Settings actions ---

const statEntrySchema = z.object({
  value: z.preprocess(
    (v) => (v == null || v === undefined ? "" : String(v)).trim(),
    z.string().min(1, "Value is required")
  ),
  label: z.preprocess(
    (v) => (v == null || v === undefined ? "" : String(v)).trim(),
    z.string().min(1, "Label is required")
  ),
});

const settingsSchema = z.object({
  whatsappNumber: z.preprocess(
    (v) => (v == null || v === undefined ? "" : String(v)).trim(),
    z.string().min(10, "Invalid phone number").max(15)
  ),
  stats: z.array(statEntrySchema).min(1).max(6),
});

export async function saveSettingsAction(_prev: unknown, formData: FormData) {
  const statsCountStr = String(formData.get("statsCount") ?? "0");
  let statsCount = 0;
  for (let p = 0; p < statsCountStr.length; p++) {
    const digit = statsCountStr.charCodeAt(p) - 48;
    if (digit < 0 || digit > 9) {
      statsCount = 0;
      break;
    }
    statsCount = statsCount * 10 + digit;
  }
  statsCount = Math.min(6, Math.max(0, statsCount));
  const stats: { value: string; label: string }[] = [];
  for (let i = 0; i < statsCount; i++) {
    stats.push({
      value: String(formData.get(`stat_value_${i}`) || "").trim(),
      label: String(formData.get(`stat_label_${i}`) || "").trim(),
    });
  }

  const parsed = settingsSchema.safeParse({
    whatsappNumber: String(formData.get("whatsappNumber") ?? ""),
    stats,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await saveSettings(parsed.data);
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}
