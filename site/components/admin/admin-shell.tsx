import Link from "next/link";

export const AdminShell = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <main className="detail-main" style={{ paddingTop: "2rem" }}>
    <div style={{ display: "grid", gap: "1.5rem" }}>
      <header style={{ display: "grid", gap: "0.75rem" }}>
        <p className="eyebrow">Admin</p>
        <h1 className="detail-name" style={{ maxWidth: "none", fontSize: "clamp(2.4rem, 5vw, 4rem)" }}>
          {title}
        </h1>
        <nav className="site-nav" style={{ justifyContent: "flex-start", marginTop: 0 }}>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/leads">Leads</Link>
          <Link href="/admin/sessions">Sessions</Link>
          <Link href="/admin/analytics">Analytics</Link>
          <Link href="/admin/settings">Settings</Link>
        </nav>
      </header>
      {children}
    </div>
  </main>
);
