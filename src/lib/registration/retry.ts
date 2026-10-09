"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/admin/auth";
import { registrationInput } from "@/lib/registration/contracts";
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
  const parsed = registrationInput.safeParse({
    name: lead.name,
    email: lead.email,
    course: lead.course,
    batch: lead.batch_letter ?? undefined,
    consent: "yes",
    website: "",
    ticket: "retry-ticket-is-not-used-for-the-lms-request",
  });
  if (!parsed.success) return;
  const routing = await forwardRegistration(parsed.data, lead.id);
  await registrationRpc("update_registration_routing", {
    lead_id: lead.id,
    next_destination: routing.destinationName,
    next_status: routing.routingStatus,
  });
  revalidatePath("/admin/registrations");
}
