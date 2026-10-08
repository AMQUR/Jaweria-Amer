import { requireAuth } from "@/lib/admin/auth";
import { listRegistrations } from "@/lib/registration/server";
export const dynamic = "force-dynamic";
export default async function RegistrationsPage() {
  await requireAuth();
  let leads;
  try {
    leads = await listRegistrations();
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
        Latest 200 enquiries from the website. Contact students at their
        supplied email to share batch details. Records expire after 180 days;
        this inbox does not create LMS accounts.
      </p>
      <div className="mt-6 space-y-4">
        {leads.length ? (
          leads.map((lead) => (
            <article
              key={lead.id}
              className="rounded-xl border border-border bg-white p-5"
            >
              <h2 className="font-semibold text-ink">{lead.name}</h2>
              <p className="mt-2 break-all text-sm text-slate">{lead.email}</p>
              <p className="mt-2 text-sm text-ink">{lead.course}</p>
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
