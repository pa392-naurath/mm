import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminIdentity } from "@/lib/security/admin";
import { ensureAdminUser, getDashboardAggregates } from "@/lib/tracking/service";

export default async function AdminDashboardPage() {
  const identity = await requireAdminIdentity();
  await ensureAdminUser(identity.authUserId, identity.email);
  const metrics = await getDashboardAggregates();

  const cards = [
    ["Total Sessions", metrics.total_sessions],
    ["Total Leads", metrics.total_leads],
    ["Wishlist Only", metrics.wishlist_only],
    ["Selection Started", metrics.selection_started],
    ["WhatsApp Clicked", metrics.whatsapp_clicked],
    ["WhatsApp Confirmed", metrics.whatsapp_confirmed],
    ["Closed Won", metrics.closed_won],
    ["Stale Leads", metrics.stale_leads],
  ];

  return (
    <AdminShell title="Lead Operations">
      <section className="collection-products-grid" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {cards.map(([label, value]) => (
          <article key={label} className="contact-card">
            <p className="eyebrow">{label}</p>
            <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "2.4rem" }}>{String(value)}</h2>
          </article>
        ))}
      </section>
    </AdminShell>
  );
}
