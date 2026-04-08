import Link from "next/link";

import { CollectionWorldCard } from "@/components/site/collection-world-card";
import { ContactSection } from "@/components/site/contact-section";
import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { OurStorySection } from "@/components/site/our-story-section";
import { ConnectWhatsAppButton, OpenSelectionsButton } from "@/components/site/product-interactions";
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

        <OurStorySection collections={collections} />

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

        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
