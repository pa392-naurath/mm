import Link from "next/link";

import { publicConfig } from "@/lib/content/public-config";
import { HeaderActions } from "@/components/site/header-actions";

export const SiteHeader = ({ variant = "default" }: { variant?: "default" | "home" }) => (
  <header className={`site-header${variant === "home" ? " site-header--home" : ""}`}>
    <div className="header-top">
      <Link className="brand-logo" href="/" aria-label="MallowMauve home">
        <img
          className="brand-logo-image"
          src={publicConfig.brandLogo}
          alt=""
          width={721}
          height={548}
        />
      </Link>
      <Link className="wordmark" href="/" aria-label="MallowMauve home">
        <img
          className="wordmark-image"
          src={publicConfig.brandWordmark}
          alt="MallowMauve"
          width={1768}
          height={233}
        />
      </Link>
      <HeaderActions />
    </div>
    <nav className="site-nav" aria-label="Primary">
      <Link href="/#collections">Collections</Link>
      <Link href="/#our-story">Our Story</Link>
      <Link href="/#contact">Contact</Link>
    </nav>
  </header>
);
