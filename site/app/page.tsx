import Link from "next/link";

import { ContactForm } from "@/components/site/contact-form";
import { CollectionWorldCard } from "@/components/site/collection-world-card";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ConnectWhatsAppButton, OpenSelectionsButton } from "@/components/site/product-interactions";
import { CraftSectionTracker } from "@/components/site/tracking-actions";
import { getCollections } from "@/lib/content/data";
import { publicConfig } from "@/lib/content/public-config";

export default async function HomePage() {
  const collections = await getCollections();

  return (
    <>
      <div className="atmosphere" aria-hidden="true"></div>
      <SiteHeader />
      <main className="home-main collections-home" id="top">
        <section className="master-hero">
          <div className="master-hero-shell">
            <div className="master-hero-media">
              <img
                className="master-hero-image"
                src={publicConfig.masterHero}
                alt="A softly lit interior with embroidered cushions and layered textiles."
              />
            </div>
            <div className="master-hero-overlay" aria-hidden="true"></div>
            <div className="master-hero-copy">
              <p className="eyebrow">Collections</p>
              <h1>A Curation of Quiet Luxury</h1>
              <p className="hero-text">
                Textiles for rooms, rituals, and quieter living, composed with warmth,
                craftsmanship, and a slower sense of home.
              </p>
              <div className="hero-actions">
                <Link className="button button-filled" href="#collections">
                  Explore Collections
                </Link>
                <ConnectWhatsAppButton className="button button-outline-light">
                  Connect on WhatsApp
                </ConnectWhatsAppButton>
              </div>
            </div>
          </div>
        </section>

        <section className="collection-led-intro" id="our-story">
          <CraftSectionTracker />
          <div className="collection-led-intro-media" aria-hidden="true">
            <video
              className="collection-led-intro-video"
              src="/media/videos/mallowmauve-craft.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{ objectPosition: "58% 42%" }}
            />
          </div>
          <div className="collection-led-intro-overlay" aria-hidden="true"></div>
          <div className="media-brand-badge collection-led-intro__brand-badge" aria-hidden="true">
            <img src={publicConfig.brandLogo} alt="" width={721} height={548} />
          </div>
          <div className="section-shell section-shell-narrow collection-led-intro-shell">
            <p className="eyebrow collection-led-brandline collection-led-brandline-wordmark">
              <span>The House of</span>
              <img
                className="collection-led-wordmark"
                src={publicConfig.brandWordmark}
                alt="MallowMauve"
                width={1768}
                height={233}
              />
            </p>
            <h2>Born on the winding roads of India.</h2>
            <p className="section-lead collection-led-story-intro">
              As daughters of bureaucratic families, our childhoods were defined by
              changing horizons and an education in artistry. From the weight of
              authentic silks to the precision of hand embroidery, we developed a
              profound reverence for the heritage tucked away in every corner of the
              country.
            </p>
            <div className="collection-led-story-grid">
              <article className="collection-led-story-card">
                <h3>From Journeys to Sanctuaries</h3>
                <p>
                  As we transitioned into motherhood, our focus shifted to the
                  sanctuaries we built for our families. We sought pieces that mirrored
                  our own lives: sophisticated and minimalist, yet infused with the
                  warmth of tradition.
                </p>
              </article>
              <article className="collection-led-story-card">
                <h3>The Essence</h3>
                <p>
                  Founded by Parul and Arooshi, MallowMauve is a bridge between
                  storied Indian craftsmanship and the refined elegance of modern
                  living. We bring artisanal textiles into a contemporary, luxury
                  light. Every thread tells a story, every design is a homecoming.
                </p>
              </article>
            </div>
            <p className="collection-led-story-welcome">
              <span>Welcome to</span>
              <img
                className="collection-led-wordmark collection-led-wordmark-welcome"
                src={publicConfig.brandWordmark}
                alt="MallowMauve"
                width={1768}
                height={233}
              />
            </p>
            <div className="collection-led-list" id="collections">
              {collections.map((collection) => (
                <Link key={collection.slug} className="collection-led-link" href={`/collections/${collection.slug}`}>
                  {collection.title}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <div className="collection-worlds">
          {collections.map((collection, index) => (
            <CollectionWorldCard key={collection.slug} collection={collection} index={index} />
          ))}
        </div>

        <section className="whatsapp-section whatsapp-section-editorial" id="whatsapp">
          <div className="whatsapp-inner">
            <p className="eyebrow">Concierge Purchase</p>
            <h2>Selections gather quietly. Requests begin personally.</h2>
            <p>
              Build a private shortlist, then move into WhatsApp when you are ready
              for guidance, availability, and a slower exchange.
            </p>
            <div className="hero-actions">
              <ConnectWhatsAppButton className="button button-soft">
                Enquire Privately
              </ConnectWhatsAppButton>
              <OpenSelectionsButton className="button button-filled">
                View Selections
              </OpenSelectionsButton>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div className="contact-shell">
            <div className="contact-copy">
              <p className="eyebrow">Contact</p>
              <h2>Begin a quieter conversation with MallowMauve.</h2>
              <p>
                Share what you would like to enquire about and we will return with
                availability, guidance, and a considered response within 24 hours.
              </p>
              <div className="contact-details">
                <div className="contact-detail">
                  <span>Email</span>
                  <a href="mailto:info@mallowmauve.com">info@mallowmauve.com</a>
                </div>
                <div className="contact-detail">
                  <span>Phone</span>
                  <a href="tel:+919990709988">+91-9990709988</a>
                </div>
                <div className="contact-detail">
                  <span>Work Timings</span>
                  <p>11am to 6pm, Monday to Saturday</p>
                </div>
              </div>
            </div>
            <div className="contact-card">
              <p className="eyebrow">Inquiry Form</p>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
