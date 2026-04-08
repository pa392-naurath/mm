"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { toProductSnapshot, useCommerce } from "@/components/providers/commerce-provider";
import type { ProductContent } from "@/types/domain";

const useActionFeedback = () => {
  const [message, setMessage] = useState("");
  const timerRef = useRef<number | null>(null);

  const flash = (next: string) => {
    setMessage(next);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    timerRef.current = window.setTimeout(() => {
      setMessage("");
    }, 2200);
  };

  useEffect(
    () => () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  return { message, flash };
};

export const ProductActionGroup = ({ product }: { product: ProductContent }) => {
  const { isSelected, isWishlisted, toggleSelection, toggleWishlist } = useCommerce();
  const snapshot = useMemo(() => toProductSnapshot(product), [product]);
  const { message, flash } = useActionFeedback();
  const selected = isSelected(product.id);
  const wishlisted = isWishlisted(product.id);

  return (
    <div className="product-action-stack">
      <div className="product-actions">
        <button
          className={`button ${selected ? "button-soft" : "button-filled"}`}
          type="button"
          aria-pressed={selected}
          onClick={async () => {
            const added = await toggleSelection(snapshot);
            flash(added ? "Added to Selections" : "Removed from Selections");
          }}
        >
          {selected ? "Selected" : "Add to Selections"}
        </button>
        <button
          className="text-action"
          type="button"
          aria-pressed={wishlisted}
          onClick={async () => {
            const added = await toggleWishlist(snapshot);
            flash(added ? "Saved to Wishlist" : "Removed from Wishlist");
          }}
        >
          {wishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
        </button>
      </div>
      <p className={`product-action-feedback${message ? " is-visible" : ""}`} aria-live="polite">
        {message || " "}
      </p>
    </div>
  );
};

export const ConnectWhatsAppButton = ({
  className,
  collectionSlug,
  children,
}: {
  className: string;
  collectionSlug?: string | null;
  children: React.ReactNode;
}) => {
  const { sendIntroWhatsapp } = useCommerce();

  return (
    <button className={className} type="button" onClick={() => void sendIntroWhatsapp(collectionSlug ?? null)}>
      {children}
    </button>
  );
};

export const OpenSelectionsButton = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => {
  const { openPanel } = useCommerce();

  return (
    <button className={className} type="button" onClick={() => openPanel("selections")}>
      {children}
    </button>
  );
};

const ZoomModal = ({
  alt,
  image,
  onClose,
}: {
  alt: string;
  image: string;
  onClose: () => void;
}) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.classList.add("zoom-modal-open");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("zoom-modal-open");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="image-zoom-modal" role="dialog" aria-modal="true" aria-label="Zoomed product image">
      <button className="image-zoom-backdrop" type="button" onClick={onClose} aria-label="Close image" />
      <div className="image-zoom-shell">
        <div className="image-zoom-toolbar">
          <button className="image-zoom-control" type="button" onClick={() => setScale((value) => Math.max(1, value - 0.2))}>
            −
          </button>
          <button className="image-zoom-control" type="button" onClick={() => setScale(1)}>
            100%
          </button>
          <button className="image-zoom-control" type="button" onClick={() => setScale((value) => Math.min(2.6, value + 0.2))}>
            +
          </button>
          <button className="image-zoom-close" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="image-zoom-stage">
          <img className="image-zoom-image" src={image} alt={alt} style={{ transform: `scale(${scale})` }} />
        </div>
      </div>
    </div>
  );
};

export const ProductMediaGallery = ({
  product,
  compact = false,
}: {
  product: ProductContent;
  compact?: boolean;
}) => {
  const lifestyle = { src: product.lifestyleImage, alt: `${product.name} ${product.variant}` };
  const studio = { src: product.studioImage, alt: `${product.name} studio view` };
  const [primary, setPrimary] = useState(lifestyle);
  const [secondary, setSecondary] = useState(studio);
  const [zoomOpen, setZoomOpen] = useState(false);

  const swapImages = () => {
    setPrimary(secondary);
    setSecondary(primary);
  };

  return (
    <>
      <div className="collection-product-media">
        <button
          className="collection-product-media-button"
          type="button"
          onClick={() => setZoomOpen(true)}
        >
          <div className="collection-product-media-main">
            <img className="collection-product-image" src={primary.src} alt={primary.alt} />
          </div>
        </button>
        {secondary.src ? (
          <button className="collection-product-studio" type="button" onClick={swapImages}>
            <img className="collection-product-studio-image" src={secondary.src} alt={secondary.alt} />
          </button>
        ) : null}
        <div
          className={`media-brand-badge media-brand-badge--product${compact ? " media-brand-badge--compact" : ""}`}
          aria-hidden="true"
        >
          <img src="/brand/mallowmauve-logo.png" alt="" width={721} height={548} />
        </div>
      </div>
      {zoomOpen ? <ZoomModal image={primary.src} alt={primary.alt} onClose={() => setZoomOpen(false)} /> : null}
    </>
  );
};

export const ProductDetailGallery = ({ product }: { product: ProductContent }) => {
  const lifestyle = { src: product.lifestyleImage, alt: `${product.name} ${product.variant}` };
  const studio = { src: product.studioImage, alt: `${product.name} studio view` };
  const [active, setActive] = useState<"lifestyle" | "studio">("lifestyle");
  const [zoomOpen, setZoomOpen] = useState(false);

  const primary = active === "lifestyle" ? lifestyle : studio;

  return (
    <>
      <div className="detail-gallery">
        <button className="detail-primary-image-button" type="button" onClick={() => setZoomOpen(true)}>
          <img className="detail-primary-image" src={primary.src} alt={primary.alt} />
        </button>
        <div className="media-brand-badge media-brand-badge--detail" aria-hidden="true">
          <img src="/brand/mallowmauve-logo.png" alt="" width={721} height={548} />
        </div>
        <div className="detail-thumbnails">
          <button
            className={`thumbnail-button${active === "lifestyle" ? " is-active" : ""}`}
            type="button"
            onClick={() => setActive("lifestyle")}
          >
            <img src={lifestyle.src} alt={`${product.name} lifestyle`} />
          </button>
          {studio.src ? (
            <button
              className={`thumbnail-button${active === "studio" ? " is-active" : ""}`}
              type="button"
              onClick={() => setActive("studio")}
            >
              <img src={studio.src} alt={`${product.name} studio`} />
            </button>
          ) : null}
        </div>
      </div>
      {zoomOpen ? <ZoomModal image={primary.src} alt={primary.alt} onClose={() => setZoomOpen(false)} /> : null}
    </>
  );
};
