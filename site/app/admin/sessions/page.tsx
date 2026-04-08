import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminIdentity } from "@/lib/security/admin";
import { ensureAdminUser, getSessionTableRows } from "@/lib/tracking/service";

export default async function AdminSessionsPage() {
  const identity = await requireAdminIdentity();
  await ensureAdminUser(identity.authUserId, identity.email);
  const sessions = await getSessionTableRows();

  return (
    <AdminShell title="Sessions">
      <div className="contact-card" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left" }}>
              {["Session Ref", "Landing Page", "Status", "Last Seen", "Device", "Browser", "UTM Campaign"].map(
                (label) => (
                  <th key={label} style={{ padding: "0.8rem 0.6rem", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {sessions.map((session: Record<string, unknown>) => (
              <tr key={String(session.id)} style={{ borderTop: "1px solid rgba(132, 104, 95, 0.12)" }}>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.session_ref)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.landing_page)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.current_status)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.last_seen_at)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.device_type)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.browser)}</td>
                <td style={{ padding: "0.9rem 0.6rem" }}>{String(session.utm_campaign ?? "-")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
