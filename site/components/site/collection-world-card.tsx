import { CollectionExploreLink } from "@/components/site/tracking-actions";
import type { CollectionContent } from "@/types/domain";

export const CollectionWorldCard = ({
  collection,
  index,
}: {
  collection: CollectionContent;
  index: number;
}) => {
  const isRight = collection.textAlign === "right";

  return (
    <section
      id={`collection-${collection.slug}`}
      className={`collection-world-hero${isRight ? " collection-world-hero--right" : ""}`}
      style={
        {
          ["--collection-world-image-position-desktop" as string]:
            collection.heroObjectPositionDesktop,
          ["--collection-world-image-position-mobile" as string]:
            collection.heroObjectPositionMobile,
        }
      }
    >
      <div className="collection-world-hero__media">
        <picture className="collection-world-hero__picture">
          <source media="(max-width: 720px)" srcSet={collection.heroImageMobile} />
          <img
            className="collection-world-hero__image"
            src={collection.heroImageDesktop}
            alt={collection.title}
          />
        </picture>
      </div>
      <div className="collection-world-hero__overlay" aria-hidden="true"></div>
      <div className="collection-world-hero__content">
        <p className="eyebrow">{collection.label || `COLLECTION ${String(index + 1).padStart(2, "0")}`}</p>
        <h2>{collection.title}</h2>
        <p className="collection-world-hero__story">{collection.story}</p>
        <CollectionExploreLink
          className="button button-filled collection-world-hero__cta"
          href={`/collections/${collection.slug}`}
          collectionSlug={collection.slug}
        >
          Explore Collection
        </CollectionExploreLink>
      </div>
      <div className="collection-world-hero__brand-badge" aria-hidden="true">
        <img src="/brand/mallowmauve-logo.png" alt="" width={721} height={548} />
      </div>
    </section>
  );
};
