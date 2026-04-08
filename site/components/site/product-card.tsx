import Link from "next/link";

import { ProductActionGroup, ProductMediaGallery } from "@/components/site/product-interactions";
import type { ProductContent } from "@/types/domain";
import { formatPrice } from "@/lib/utils/format";

export const ProductCard = ({
  product,
  collectionTitle,
  reversed = false,
}: {
  product: ProductContent;
  collectionTitle: string;
  reversed?: boolean;
}) => (
  <article className={`collection-product-card${reversed ? " is-reversed" : ""}`}>
    <ProductMediaGallery product={product} compact />
    <div className="collection-product-copy">
      <p className="eyebrow">{collectionTitle}</p>
      <Link
        className="collection-product-name-link"
        href={`/products/${product.collectionSlug}/${product.id}`}
      >
        <h2>{product.name}</h2>
      </Link>
      <p className="detail-variant-name">{product.variant}</p>
      <p className="detail-price">{formatPrice(product.price, product.currency)}</p>
      <p className="collection-product-description">{product.description}</p>
      <div className="collection-product-specs">
        <div className="collection-product-spec">
          <span>Material</span>
          <p>{product.material}</p>
        </div>
        <div className="collection-product-spec">
          <span>Dimensions</span>
          <p>{product.dimensions}</p>
        </div>
      </div>
      <Link className="text-action collection-product-link" href={`/products/${product.collectionSlug}/${product.id}`}>
        View Piece
      </Link>
      <ProductActionGroup product={product} />
    </div>
  </article>
);
