import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductCard } from "@/components/site/product-card";
import { BackToCollectionsLink, CollectionViewTracker } from "@/components/site/tracking-actions";
import { getCollectionBySlug, getCollections, getProductsByCollection } from "@/lib/content/data";

export async function generateStaticParams() {
  const collections = await getCollections();
  return collections.map((collection) => ({ slug: collection.slug }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const products = await getProductsByCollection(slug);

  return (
    <>
      <div className="atmosphere" aria-hidden="true"></div>
      <SiteHeader />
      <main className="collection-main">
        <CollectionViewTracker eventName="collection_view" collectionSlug={collection.slug} />
        <section
          className="collection-hero"
          style={
            {
              ["--collection-page-hero-position-desktop" as string]:
                collection.heroObjectPositionDesktop,
              ["--collection-page-hero-position-mobile" as string]:
                collection.heroObjectPositionMobile,
            }
          }
        >
          <div className="collection-hero-media">
            <picture className="collection-hero-picture">
              <source media="(max-width: 720px)" srcSet={collection.heroImageMobile} />
              <img className="collection-hero-image" src={collection.heroImageDesktop} alt={collection.title} />
            </picture>
          </div>
          <div className="collection-hero-overlay" aria-hidden="true"></div>
          <BackToCollectionsLink className="collection-backlink collection-hero__backlink" slug={collection.slug} />
          <div className="media-brand-badge collection-hero__brand-badge" aria-hidden="true">
            <img src="/brand/mallowmauve-logo.png" alt="" width={721} height={548} />
          </div>
          <div className="collection-hero-copy">
            <p className="eyebrow">{collection.label}</p>
            <h1>{collection.title}</h1>
            <p className="collection-hero-story">{collection.story}</p>
          </div>
        </section>

        <section className="collection-products">
          <div className="section-shell section-shell-narrow">
            <p className="eyebrow">Selected Pieces</p>
            <h2>Presented with the same quieter pace as the rooms they enter.</h2>
            <p className="section-lead">
              Each piece below is drawn directly from the structured collection file,
              with Selections and Wishlist leading into the same guided WhatsApp journey.
            </p>
          </div>
          <div className="collection-products-grid">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                collectionTitle={collection.title}
                reversed={index % 2 === 1}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
