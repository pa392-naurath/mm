import { ProductActionGroup, ProductDetailGallery } from "@/components/site/product-interactions";
import { BackToCollectionsLink } from "@/components/site/tracking-actions";
import type { CollectionContent, ProductContent } from "@/types/domain";
import { formatPrice } from "@/lib/utils/format";

export const ProductDetail = ({
  collection,
  product,
}: {
  collection: CollectionContent;
  product: ProductContent;
}) => (
  <>
    <BackToCollectionsLink className="collection-backlink detail-backlink" slug={collection.slug} />

    <section className="detail-layout">
      <ProductDetailGallery product={product} />

      <div className="detail-info">
        <p className="eyebrow">{collection.title}</p>
        <h1 className="detail-name">{product.name}</h1>
        <p className="detail-variant-name">{product.variant}</p>
        <p className="detail-description detail-story">{product.story}</p>
        <p className="detail-description">{product.description}</p>
        <p className="detail-price">{formatPrice(product.price, product.currency)}</p>
        <div className="detail-meta">
          <div className="detail-meta-item">
            <span>Material</span>
            <p>{product.material}</p>
          </div>
          <div className="detail-meta-item">
            <span>Dimensions</span>
            <p>{product.dimensions}</p>
          </div>
        </div>
        <div className="detail-actions">
          <ProductActionGroup product={product} />
        </div>
      </div>
    </section>
  </>
);
