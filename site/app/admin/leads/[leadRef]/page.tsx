import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminIdentity } from "@/lib/security/admin";
import { ensureAdminUser, getLeadDetail } from "@/lib/tracking/service";

export default async function AdminLeadDetailPage({
  params,
}: {
  params: Promise<{ leadRef: string }>;
}) {
  const identity = await requireAdminIdentity();
  await ensureAdminUser(identity.authUserId, identity.email);

  const { leadRef } = await params;
  const detail = await getLeadDetail(leadRef);

  if (!detail) {
    notFound();
  }

  return (
    <AdminShell title={`Lead ${detail.lead.lead_ref}`}>
      <section className="contact-shell" style={{ gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)" }}>
        <div className="contact-copy">
          <p className="eyebrow">Lead Profile</p>
          <h2>{detail.lead.lead_ref}</h2>
          <p>Stage: {detail.lead.stage}</p>
          <p>Session Ref: {detail.session?.session_ref ?? "-"}</p>
          <p>Anonymous ID: {detail.lead.anonymous_id}</p>
          <p>WhatsApp Clicks: {detail.lead.whatsapp_click_count}</p>
        </div>
        <div className="contact-card">
          <p className="eyebrow">Timeline</p>
          <div className="contact-details">
            {detail.events.map((event: Record<string, unknown>) => (
              <div key={String(event.id)} className="contact-detail">
                <span>{String(event.event_name)}</span>
                <p>{String(event.occurred_at)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
