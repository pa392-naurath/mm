import Link from "next/link";

import { publicConfig } from "@/lib/content/public-config";

export const SiteFooter = () => (
  <footer className="site-footer">
    <span className="footer-mark">
      <img
        className="footer-wordmark-image"
        src={publicConfig.brandWordmark}
        alt="MallowMauve"
        width={1768}
        height={233}
      />
    </span>
    <div className="footer-links">
      <Link href="/#our-story">Our Story</Link>
      <Link href="/#collections">Collections</Link>
      <Link href="/#contact">Contact</Link>
    </div>
  </footer>
);
