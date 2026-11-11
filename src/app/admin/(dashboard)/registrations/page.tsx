import { requireAuth } from "@/lib/admin/auth";
import { LEGACY_LIST_CAP, listAllRegistrations, registrationRpc } from "@/lib/registration/server";
import { retryRegistrationRouting } from "@/lib/registration/retry";
export const dynamic = "force-dynamic";
export default async function RegistrationsPage() {
  await requireAuth();
  let leads;
  let total = 0;
  let complete = true;
  let health: { pending: number; failed: number; dead: number; sent: number; last_error: string | null } | null = null;
  try {
    const set = await listAllRegistrations();
    complete = set.complete;
    leads = set.leads.slice(0, 200);
    total = set.leads.length;
    const rows: unknown = await registrationRpc("registration_notification_health", {}).catch(() => null);
    if (Array.isArray(rows) && rows[0]) health = rows[0];
  } catch {
    return (
      <div>
        <h1 className="font-serif text-2xl text-ink">Registration interest</h1>
        <p role="alert" className="mt-5 text-crimson">
          The private inbox could not be loaded. Please try again.
        </p>
      </div>
    );
  }
  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Registration interest</h1>
      <p className="mt-2 text-sm text-slate">
        Newest enquiries first (the page lists up to 200; the Excel sheet holds every saved enquiry). A batch preference is saved for review and applied
        only when the school creates the LMS account. This inbox does not
        create accounts or enroll anyone. Records expire after 180 days.
      </p>
      <p className="mt-3 text-sm font-semibold text-ink">
        {total} saved {total === 1 ? "enquiry" : "enquiries"}; showing {leads.length}.
      </p>
      {health && (health.dead > 0 || health.failed > 0) ? (
        <p role="alert" className="mt-3 rounded-lg border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink">
          Teacher e-mail needs attention: {health.dead} could not be delivered, {health.failed} waiting to retry
          {health.last_error ? ` (last problem: ${health.last_error})` : ""}. Every enquiry is saved and is in the Excel sheet.
        </p>
      ) : health ? (
        <p className="mt-2 text-sm text-slate">Teacher e-mail: {health.sent} sent, {health.pending} waiting.</p>
      ) : null}
      {!complete && leads.length >= LEGACY_LIST_CAP && (
        <p
          role="status"
          className="mt-3 rounded-lg border-l-4 border-crimson bg-crimson/5 p-4 text-sm text-ink"
        >
          This page and the Excel sheet can currently list only the most recent{" "}
          {LEGACY_LIST_CAP} enquiries. Older enquiries are still stored (for
          180 days) and appear in earlier notification emails, but are not
          shown here until the paginated export is enabled.
        </p>
      )}
      <a
        href="/api/admin/registrations/export"
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-crimson px-4 text-sm font-semibold text-white hover:bg-crimson-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-crimson"
      >
        Download Excel sheet
      </a>
      <div className="mt-6 space-y-4">
        {leads.length ? (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-border bg-white p-5"
            >
              <h2 className="font-semibold text-ink">{lead.name}</h2>
              <p className="mt-2 break-all text-sm text-slate">{lead.email}</p>
              <p className="mt-2 text-sm text-ink">
                {lead.course}
                {lead.batch_letter ? ` · Batch ${lead.batch_letter}` : ""}
              </p>
              <p className="mt-2 text-sm text-ink">
                {lead.routing_status === "pending_account"
                  ? `Destination: ${lead.destination_name ?? "Confirmed batch"}`
                  : lead.routing_status === "needs_review"
                    ? "Needs review before a batch can be assigned"
                    : lead.routing_status === "pending_resolution"
                      ? "Batch confirmation is waiting to be retried"
                      : lead.routing_status === "not_applicable"
                        ? "No automatic batch for this syllabus"
                        : "Received"}
              </p>
              {lead.routing_status === "pending_resolution" && (
                <form action={retryRegistrationRouting} className="mt-3">
                  <input type="hidden" name="id" value={lead.id} />
                  <button className="min-h-11 rounded-lg border border-border px-3 text-sm font-semibold text-ink">
                    Retry batch confirmation
                  </button>
                </form>
              )}
              <time
                className="mt-2 block text-xs text-slate"
                dateTime={lead.created_at}
              >
                {new Date(lead.created_at).toLocaleString("en-GB", {
                  timeZone: "Asia/Karachi",
                })}{" "}
                PKT
              </time>
            </article>
          ))
        ) : (
          <p className="text-slate">No registration enquiries yet.</p>
        )}
      </div>
    </div>
  );
}
