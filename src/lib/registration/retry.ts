"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import { PUBLIC_ENGLISH_SYLLABUSES } from "@/lib/course-offerings";
import {
  forwardRegistration,
  listRegistrations,
  registrationRpc,
} from "@/lib/registration/server";

export async function retryRegistrationRouting(formData: FormData) {
  await requireAuth();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const leads = await listRegistrations();
  const lead = leads.find((item) => item.id === id);
  if (!lead || lead.routing_status !== "pending_resolution") return;
  // Historical enquiries have no phone number, and routing never needs one.
  const course = PUBLIC_ENGLISH_SYLLABUSES.find((item) => item === lead.course);
  if (!course) return;
  const routing = await forwardRegistration(
    {
      name: lead.name,
      email: lead.email,
      course,
      batch: (lead.batch_letter ?? undefined) as "A" | "B" | "C" | undefined,
    },
    lead.id,
  );
  await registrationRpc("update_registration_routing", {
    lead_id: lead.id,
    next_destination: routing.destinationName,
    next_status: routing.routingStatus,
  });
  revalidatePath("/admin/registrations");
}
