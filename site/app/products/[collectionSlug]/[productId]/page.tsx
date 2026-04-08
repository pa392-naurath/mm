import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { ProductDetail } from "@/components/site/product-detail";
import { CollectionViewTracker } from "@/components/site/tracking-actions";
import { getCollectionBySlug, getCollections, getProductById, getProductsByCollection } from "@/lib/content/data";

export async function generateStaticParams() {
  const collections = await getCollections();
  const productParams = await Promise.all(
    collections.map(async (collection) => {
      const products = await getProductsByCollection(collection.slug);
      return products.map((product) => ({
        collectionSlug: collection.slug,
        productId: product.id,
      }));
    }),
  );

  return productParams.flat();
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ collectionSlug: string; productId: string }>;
}) {
  const { collectionSlug, productId } = await params;
  const [collection, product] = await Promise.all([
    getCollectionBySlug(collectionSlug),
    getProductById(collectionSlug, productId),
  ]);

  if (!collection || !product) {
    notFound();
  }

  return (
    <>
      <div className="atmosphere" aria-hidden="true"></div>
      <SiteHeader />
      <main className="detail-main">
        <CollectionViewTracker
          eventName="product_view"
          collectionSlug={collection.slug}
          productId={product.id}
        />
        <ProductDetail collection={collection} product={product} />
      </main>
      <SiteFooter />
    </>
  );
}
