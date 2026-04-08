import type { Metadata } from "next";

import "@/app/globals.css";

import { SiteProviders } from "@/components/providers/site-providers";

export const metadata: Metadata = {
  title: "MallowMauve | Quiet Luxury Home Decor",
  description:
    "MallowMauve presents quiet luxury home textiles rooted in Indian craftsmanship and a concierge-led WhatsApp purchase journey.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="next-app">
        <SiteProviders>{children}</SiteProviders>
      </body>
    </html>
  );
}
