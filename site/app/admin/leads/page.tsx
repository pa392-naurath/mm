import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminIdentity } from "@/lib/security/admin";
import { ensureAdminUser, getLeadTableRows } from "@/lib/tracking/service";

export default async function AdminLeadsPage() {
  const identity = await requireAdminIdentity();
  await ensureAdminUser(identity.authUserId, identity.email);
  const leads = await getLeadTableRows();

  return (
    <AdminShell title="Leads">
      <div className="contact-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {[
                "Lead Ref",
                "Session Ref",
                "Stage",
                "Wishlist",
                "Selections",
                "WhatsApp Clicks",
                "Created",
                "Last Seen",
                "UTM Source",
                "Country",
                "Assigned To",
              ].map((label) => (
                <th key={label} style={{ padding: "0.8rem 0.6rem", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead: Record<string, unknown>) => (
              <tr key={String(lead.lead_ref)} style={{ borderTop: "1px solid rgba(132, 104, 95, 0.12)" }}>
                <td style={{ padding: "0.9rem 0.6rem" }}>
                  <Link href={`/admin/leads/${lead.lead_ref}`}>{String(lead.lead_ref)}</Link>
                </td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.session_ref ?? "-")}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.stage)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.wishlist_count ?? 0)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.selection_count ?? 0)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.whatsapp_click_count ?? 0)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.created_at ?? "-")}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.last_seen_at ?? "-")}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.utm_source ?? "-")}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.country ?? "-")}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(lead.assigned_to ?? "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
