import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminIdentity } from "@/lib/security/admin";
import { ensureAdminUser, getDashboardAggregates } from "@/lib/tracking/service";

export default async function AdminAnalyticsPage() {
  const identity = await requireAdminIdentity();
  await ensureAdminUser(identity.authUserId, identity.email);
  const metrics = await getDashboardAggregates();

  return (
    <AdminShell title="Analytics">
      <section className="contact-shell">
        <div className="contact-copy">
          <p className="eyebrow">Operational Funnel</p>
          <h2>From browsing to WhatsApp intent.</h2>
          <p>Total Sessions: {metrics.total_sessions}</p>
          <p>Wishlist Only: {metrics.wishlist_only}</p>
          <p>Selection Started: {metrics.selection_started}</p>
          <p>WhatsApp Clicked: {metrics.whatsapp_clicked}</p>
        </div>
        <div className="contact-card">
          <p className="eyebrow">PostHog</p>
          <p>
            Embed PostHog funnels here for:
            Collection View → Product View → Add to Wishlist → Add to Selections →
            WhatsApp Click.
          </p>
        </div>
      </section>
    </AdminShell>
  );
}
