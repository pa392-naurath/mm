"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCommerce } from "@/components/providers/commerce-provider";

export const CollectionExploreLink = ({
  href,
  collectionSlug,
  className,
  children,
}: {
  href: string;
  collectionSlug: string;
  className: string;
  children: React.ReactNode;
}) => {
  const { trackEvent } = useCommerce();

  return (
    <Link
      className={className}
      href={href as never}
      onClick={() => {
        void trackEvent({
          eventName: "collection_explore_clicked",
          eventSource: "site",
          collectionSlug,
          pagePath: window.location.pathname,
        });
      }}
    >
      {children}
    </Link>
  );
};

export const BackToCollectionsLink = ({
  slug,
  className,
}: {
  slug: string;
  className: string;
}) => {
  const router = useRouter();
  const { trackEvent } = useCommerce();

  return (
    <button
      className={className}
      type="button"
      onClick={() => {
        window.sessionStorage.setItem("mallowmauve.returnAnchor", `collection-${slug}`);
        void trackEvent({
          eventName: "back_to_collections_clicked",
          eventSource: "site",
          collectionSlug: slug,
          pagePath: window.location.pathname,
        });
        router.push("/");
      }}
    >
      <span aria-hidden="true">←</span>
      <span>Back to Collections</span>
    </button>
  );
};

export const CollectionViewTracker = ({
  eventName,
  collectionSlug,
  productId,
}: {
  eventName: "collection_view" | "product_view";
  collectionSlug: string;
  productId?: string;
}) => {
  const { trackEvent } = useCommerce();

  useEffect(() => {
    void trackEvent({
      eventName,
      eventSource: "site",
      collectionSlug,
      productId: productId ?? null,
      pagePath: window.location.pathname,
    });
  }, [collectionSlug, eventName, productId, trackEvent]);

  return null;
};

export const CraftSectionTracker = () => {
  const { trackEvent } = useCommerce();

  useEffect(() => {
    const element = document.getElementById("our-story");

    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    let seen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting || seen) {
          return;
        }

        seen = true;
        void trackEvent({
          eventName: "craft_section_viewed",
          eventSource: "site",
          pagePath: window.location.pathname,
        });
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [trackEvent]);

  return null;
};
