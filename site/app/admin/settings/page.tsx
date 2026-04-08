import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminIdentity } from "@/lib/security/admin";
import { ensureAdminUser } from "@/lib/tracking/service";
import { env } from "@/lib/utils/env";

export default async function AdminSettingsPage() {
  const identity = await requireAdminIdentity();
  await ensureAdminUser(identity.authUserId, identity.email);

  return (
    <AdminShell title="Settings">
      <section className="contact-shell">
        <div className="contact-copy">
          <p className="eyebrow">Environment</p>
          <h2>Operational configuration.</h2>
          <p>App Environment: {env.appEnv}</p>
          <p>Site URL: {env.siteUrl}</p>
          <p>WhatsApp Number: {env.whatsappNumber}</p>
        </div>
        <div className="contact-card">
          <p className="eyebrow">Go Live Notes</p>
          <p>Review .env.example, Vercel project variables, and the DNS checklist before launch.</p>
        </div>
      </section>
    </AdminShell>
  );
}
