"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CraftSectionTracker } from "@/components/site/tracking-actions";
import { publicConfig } from "@/lib/content/public-config";
import type { CollectionContent } from "@/types/domain";

export const OurStorySection = ({
  collections,
}: {
  collections: CollectionContent[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const applyPlaybackSettings = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
      video.playbackRate = 0.68;
    };

    applyPlaybackSettings();
    video.addEventListener("loadedmetadata", applyPlaybackSettings);

    return () => {
      video.removeEventListener("loadedmetadata", applyPlaybackSettings);
    };
  }, []);

  return (
    <section
      className={`collection-led-intro${expanded ? " is-story-expanded" : ""}`}
      id="our-story"
    >
      <CraftSectionTracker />
      <div className="collection-led-intro-media" aria-hidden="true">
        <video
          ref={videoRef}
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
      <div
        className="media-brand-badge collection-led-intro__brand-badge"
        aria-hidden="true"
      >
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
        <button
          className="collection-led-read-more"
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Read less" : "Read more"}
        </button>
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
            <Link
              key={collection.slug}
              className="collection-led-link"
              href={`/collections/${collection.slug}`}
            >
              {collection.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
