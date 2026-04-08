(function () {
  const config = window.MALLOW_SITE_CONFIG;

  if (!config) {
    return;
  }

  const state = {
    collections: [],
    collectionLookup: {},
    productsBySlug: {},
    productCatalog: {},
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const cleanText = (value) => String(value ?? "").trim();

  const formatPrice = (price, currency = "INR") => {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
      return cleanText(price);
    }

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      return `${currency} ${amount}`;
    }
  };

  const fetchJson = async (path) => {
    try {
      const response = await fetch(path, { cache: "no-store" });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      return null;
    }
  };

  const getCollectionPathSlug = () => {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const lastPart = parts.at(-1) || "";

    if (lastPart === "index.html") {
      return parts.at(-2) || "";
    }

    return lastPart;
  };

  const getCollectionEntryAnchor = (slug) => `#collection-${encodeURIComponent(slug)}`;

  const buildCollectionHref = (slug) => `/collections/${encodeURIComponent(slug)}/`;

  const getCollectionReturnHref = (slug) => {
    try {
      const savedAnchor = window.sessionStorage.getItem("mallowmauve.returnAnchor");
      if (savedAnchor) {
        return savedAnchor;
      }
    } catch (error) {
      // Ignore storage access issues.
    }

    return getCollectionEntryAnchor(slug);
  };

  const buildProductHref = (product) =>
    `/product.html?collection=${encodeURIComponent(product.collectionSlug)}&product=${encodeURIComponent(
      product.id,
    )}`;

  const normalizeCollection = (collection) => ({
    slug: cleanText(collection.slug),
    order: Number(collection.order) || 0,
    title: cleanText(collection.title),
    label: cleanText(collection.label) || "Collection",
    story: cleanText(collection.story),
    heroImageDesktop: cleanText(collection.heroImageDesktop),
    heroImageMobile: cleanText(collection.heroImageMobile) || cleanText(collection.heroImageDesktop),
    heroObjectPositionDesktop:
      cleanText(collection.heroObjectPositionDesktop) || "center center",
    heroObjectPositionMobile:
      cleanText(collection.heroObjectPositionMobile) ||
      cleanText(collection.heroObjectPositionDesktop) ||
      "center center",
    textAlign: cleanText(collection.textAlign) === "right" ? "right" : "left",
  });

  const normalizeProduct = (product) => {
    const currency = cleanText(product.currency) || "INR";

    return {
      id: cleanText(product.id),
      collectionSlug: cleanText(product.collectionSlug),
      name: cleanText(product.name),
      variant: cleanText(product.variant),
      price: Number(product.price),
      currency,
      priceDisplay: formatPrice(product.price, currency),
      story: cleanText(product.story),
      description: cleanText(product.description),
      material: cleanText(product.material),
      dimensions: cleanText(product.dimensions),
      lifestyleImage: cleanText(product.lifestyleImage),
      studioImage: cleanText(product.studioImage),
      whatsappLabel: cleanText(product.whatsappLabel) || cleanText(product.name),
      status: cleanText(product.status) || "active",
      order: Number(product.order) || 0,
    };
  };

  const sortByOrder = (items) => [...items].sort((a, b) => a.order - b.order);

  const buildCollectionPicture = (
    collection,
    pictureClass,
    imageClass,
    desktopVar,
    mobileVar,
  ) => {
    if (!collection.heroImageDesktop && !collection.heroImageMobile) {
      return "";
    }

    const desktopSrc = collection.heroImageDesktop || collection.heroImageMobile;
    const mobileSource = collection.heroImageMobile
      ? `<source media="(max-width: 720px)" srcset="${escapeHtml(collection.heroImageMobile)}" />`
      : "";

    return `
      <picture class="${pictureClass}">
        ${mobileSource}
        <img
          class="${imageClass}"
          src="${escapeHtml(desktopSrc)}"
          alt="${escapeHtml(collection.title)}"
          style="
            ${desktopVar}: ${escapeHtml(collection.heroObjectPositionDesktop)};
            ${mobileVar}: ${escapeHtml(collection.heroObjectPositionMobile)};
          "
        />
      </picture>
    `;
  };

  const buildMediaPlaceholder = (label) => `
    <div class="media-placeholder" aria-hidden="true">
      <span>${escapeHtml(label)}</span>
    </div>
  `;

  const buildBrandBadge = (className = "media-brand-badge") => `
    <div class="${className}" aria-hidden="true">
      <img
        src="/public/brand/mallowmauve-logo.png"
        alt=""
        width="721"
        height="548"
      />
    </div>
  `;

  const buildProductMedia = (product) => {
    const primaryImage = product.lifestyleImage || product.studioImage;
    const secondaryImage =
      product.studioImage && product.studioImage !== primaryImage ? product.studioImage : "";

    const primaryAlt = `${product.name} ${product.variant}`;
    const secondaryAlt = `${product.name} studio view`;

    const lifestyleMarkup = primaryImage
      ? `
        <div
          class="collection-product-media-main"
          data-gallery-open
          role="button"
          tabindex="0"
          aria-label="Zoom ${escapeHtml(product.name)}"
        >
          <img
            class="collection-product-image"
            src="${escapeHtml(primaryImage)}"
            alt="${escapeHtml(primaryAlt)}"
            data-gallery-main-image
            loading="lazy"
            decoding="async"
          />
        </div>
      `
      : buildMediaPlaceholder("Mapped lifestyle image pending");

    const studioMarkup = secondaryImage
      ? `
        <button
          class="collection-product-studio"
          type="button"
          data-gallery-swap
          aria-label="Swap to alternate view of ${escapeHtml(product.name)}"
        >
          <img
            class="collection-product-studio-image"
            src="${escapeHtml(secondaryImage)}"
            alt="${escapeHtml(secondaryAlt)}"
            data-gallery-thumb-image
            loading="lazy"
            decoding="async"
          />
        </button>
      `
      : "";

    return `
      <div class="collection-product-media" data-gallery-root>
        ${lifestyleMarkup}
        ${studioMarkup}
        ${primaryImage ? buildBrandBadge("media-brand-badge media-brand-badge--product") : ""}
      </div>
    `;
  };

  const productActionsMarkup = () => `
    <div class="product-actions">
      <button class="button button-soft" type="button" data-add-inquiry>Add to Selections</button>
      <button class="text-action" type="button" data-add-wishlist>Save to Wishlist</button>
    </div>
  `;

  const productSpecsMarkup = (product) => `
    <div class="collection-product-specs">
      <div class="collection-product-spec">
        <span>Material</span>
        <p>${escapeHtml(product.material)}</p>
      </div>
      <div class="collection-product-spec">
        <span>Dimensions</span>
        <p>${escapeHtml(product.dimensions)}</p>
      </div>
    </div>
  `;

  const renderMasterHero = () => {
    const heroRoot = document.querySelector("[data-master-hero]");
    const hero = config.masterHero;

    if (!heroRoot || !hero) {
      return;
    }

    heroRoot.innerHTML = `
      <div class="master-hero-shell">
        <div class="master-hero-media">
          <img
            class="master-hero-image"
            src="${escapeHtml(hero.image)}"
            alt="${escapeHtml(hero.alt)}"
            style="object-position: ${escapeHtml(hero.position || "center center")};"
          />
        </div>
        <div class="master-hero-overlay" aria-hidden="true"></div>
        <div class="master-hero-copy">
          <p class="eyebrow">${escapeHtml(hero.eyebrow)}</p>
          <h1>${escapeHtml(hero.title)}</h1>
          <p class="hero-text">${escapeHtml(hero.description)}</p>
          <div class="hero-actions">
            <a class="button button-filled" href="${escapeHtml(hero.primaryCta.href)}">${escapeHtml(
              hero.primaryCta.label,
            )}</a>
            <a class="button button-outline-light" href="${escapeHtml(
              hero.secondaryCta.href,
            )}" target="_blank" rel="noreferrer">
              ${escapeHtml(hero.secondaryCta.label)}
            </a>
          </div>
        </div>
      </div>
    `;
  };

  const renderCraftIntro = () => {
    const section = document.querySelector("[data-craft-intro]");
    const mediaRoot = section?.querySelector("[data-craft-intro-media]");
    const shell = section?.querySelector(".collection-led-intro-shell");
    const media = config.craftIntro?.media;
    const pendingText = config.craftIntro?.pendingText;

    if (!section || !mediaRoot || !shell) {
      return;
    }

    const existingStatus = shell.querySelector(".collection-led-intro-status");

    if (existingStatus) {
      existingStatus.remove();
    }

    if (!media || media.approved === false || media.type !== "video" || !media.video) {
      section.classList.add("collection-led-intro-no-media");
      mediaRoot.innerHTML = `
        <div class="collection-led-intro-placeholder" aria-hidden="true">
          <span>Mapped craft film required</span>
        </div>
      `;

      if (pendingText) {
        shell.insertAdjacentHTML(
          "beforeend",
          `<p class="collection-led-intro-status">${escapeHtml(pendingText)}</p>`,
        );
      }

      return;
    }

    section.classList.remove("collection-led-intro-no-media");
    mediaRoot.innerHTML = `
      <video
        class="collection-led-intro-video"
        src="${escapeHtml(media.video)}"
        poster="${escapeHtml(media.poster || "")}"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        disablepictureinpicture
        disableremoteplayback
        controlslist="nodownload noplaybackrate noremoteplayback"
        style="object-position: ${escapeHtml(media.position || "center center")};"
        aria-label="${escapeHtml(media.alt || "")}"
      ></video>
    `;

    const video = mediaRoot.querySelector(".collection-led-intro-video");

    if (!video) {
      return;
    }

    const playbackRate = media.playbackRate || 0.72;
    const enforceSilentPlayback = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.volume = 0;
      video.playbackRate = playbackRate;
      video.play().catch(() => {});
    };

    video.defaultMuted = true;
    video.muted = true;
    video.volume = 0;
    video.loop = true;
    video.autoplay = true;
    video.playsInline = true;
    video.playbackRate = playbackRate;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "true");

    if (video.readyState >= 2) {
      enforceSilentPlayback();
    } else {
      video.addEventListener("loadedmetadata", enforceSilentPlayback, { once: true });
    }

    video.addEventListener("play", () => {
      video.muted = true;
      video.volume = 0;
      video.playbackRate = playbackRate;
    });
  };

  const renderCollectionLinks = () => {
    const linksRoot = document.querySelector("[data-collection-links]");

    if (!linksRoot) {
      return;
    }

    linksRoot.innerHTML = state.collections
      .map(
        (collection) => `
          <a
            class="collection-led-link"
            href="${buildCollectionHref(collection.slug)}"
            data-collection-entry="collection-${escapeHtml(collection.slug)}"
          >
            ${escapeHtml(collection.title)}
          </a>
        `,
      )
      .join("");
  };

  const renderCollectionWorlds = () => {
    const homeRoot = document.querySelector("[data-collections-home]");

    if (!homeRoot) {
      return;
    }

    homeRoot.innerHTML = state.collections
      .map((collection) => {
        const hasImage = Boolean(collection.heroImageDesktop || collection.heroImageMobile);
        const heroClass = hasImage
          ? `collection-world-hero collection-world-hero--${collection.textAlign}`
          : "collection-world-hero collection-world-hero--text-only";
        const mediaMarkup = hasImage
          ? `
            <div class="collection-world-hero__media" data-collection-media>
              ${buildCollectionPicture(
                collection,
                "collection-world-hero__picture",
                "collection-world-hero__image",
                "--collection-world-image-position-desktop",
                "--collection-world-image-position-mobile",
              )}
            </div>
            <div class="collection-world-hero__overlay" aria-hidden="true"></div>
          `
          : buildMediaPlaceholder("Mapped collection hero pending");

        return `
          <section class="${heroClass}" data-collection-world id="collection-${escapeHtml(
            collection.slug,
          )}">
            ${mediaMarkup}
            <div class="collection-world-hero__content" data-collection-copy>
              <p class="eyebrow">${escapeHtml(collection.label)}</p>
              <h2>${escapeHtml(collection.title)}</h2>
              <p class="collection-world-hero__story">${escapeHtml(collection.story)}</p>
              <a
                class="button button-filled collection-world-hero__cta"
                href="${buildCollectionHref(collection.slug)}"
                data-collection-entry="collection-${escapeHtml(collection.slug)}"
              >Explore Collection</a>
            </div>
            ${
              hasImage
                ? `
                  <div class="collection-world-hero__brand-badge" aria-hidden="true">
                    <img
                      src="/public/brand/mallowmauve-logo.png"
                      alt=""
                      width="721"
                      height="548"
                    />
                  </div>
                `
                : ""
            }
          </section>
        `;
      })
      .join("");
  };

  const restoreHomepageCollectionAnchor = () => {
    if (!document.body.classList.contains("home-page")) {
      return;
    }

    let targetHash = "";

    try {
      const pending = cleanText(window.sessionStorage.getItem("mallowmauve.pendingReturnAnchor"));
      if (pending) {
        targetHash = pending;
        window.sessionStorage.removeItem("mallowmauve.pendingReturnAnchor");
      }
    } catch (error) {
      // Ignore storage access issues.
    }

    if (!targetHash) {
      targetHash = cleanText(window.location.hash);
    }

    if (!targetHash || !targetHash.startsWith("#collection-")) {
      return;
    }

    const target = document.querySelector(targetHash);

    if (!target) {
      return;
    }

    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }, 180);
  };

  const renderCollectionPage = () => {
    const pageRoot = document.querySelector("[data-collection-page]");

    if (!pageRoot) {
      return;
    }

    const slug = getCollectionPathSlug();
    const collection = state.collectionLookup[slug];
    const products = state.productsBySlug[slug] || [];

    if (!collection) {
      pageRoot.innerHTML = `
        <section class="collection-missing">
          <p class="eyebrow">Collection</p>
          <h1>This collection is being prepared.</h1>
          <p>Return to the homepage to continue through the current collection worlds.</p>
          <a class="button button-soft" href="/">Return Home</a>
        </section>
      `;
      return;
    }

    document.title = `MallowMauve | ${collection.title}`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `${collection.title} by MallowMauve. ${collection.story}`,
      );
    }

    const hasHeroImage = Boolean(collection.heroImageDesktop || collection.heroImageMobile);
    const returnHref = getCollectionReturnHref(collection.slug);
    const heroMedia = hasHeroImage
      ? `
        <div class="collection-hero-media">
          ${buildCollectionPicture(
            collection,
            "collection-hero-picture",
            "collection-hero-image",
            "--collection-page-hero-position-desktop",
            "--collection-page-hero-position-mobile",
          )}
        </div>
        <div class="collection-hero-overlay" aria-hidden="true"></div>
      `
      : "";

    pageRoot.innerHTML = `
      <section class="${hasHeroImage ? "collection-hero" : "collection-hero collection-hero-text-only"}">
        ${heroMedia}
        <a
          class="collection-backlink collection-hero__backlink"
          href="/"
          data-back-collections
          data-return-anchor="${escapeHtml(returnHref)}"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Collections</span>
        </a>
        ${hasHeroImage ? buildBrandBadge("media-brand-badge collection-hero__brand-badge") : ""}
        <div class="collection-hero-copy">
          <p class="eyebrow">${escapeHtml(collection.label)}</p>
          <h1>${escapeHtml(collection.title)}</h1>
          <p class="collection-hero-story">${escapeHtml(collection.story)}</p>
        </div>
      </section>

      <section class="collection-products">
        <div class="section-shell section-shell-narrow">
          <p class="eyebrow">Selected Pieces</p>
          <h2>Presented with the same quieter pace as the rooms they enter.</h2>
          <p class="section-lead">
            Each piece below is drawn directly from the structured collection file,
            with Selections and Wishlist leading into the same guided WhatsApp journey.
          </p>
        </div>

        <div class="collection-products-grid">
          ${
            products.length
              ? products
                  .map(
                    (product, index) => `
                      <article
                        class="collection-product-card${index % 2 === 1 ? " is-reversed" : ""}"
                        data-product-root
                        data-product-id="${escapeHtml(product.id)}"
                      >
                        ${buildProductMedia(product)}
                        <div class="collection-product-copy">
                          <p class="eyebrow">${escapeHtml(collection.title)}</p>
                          <a class="collection-product-name-link" href="${buildProductHref(product)}">
                            <h2>${escapeHtml(product.name)}</h2>
                          </a>
                          <p class="detail-variant-name">${escapeHtml(product.variant)}</p>
                          <p class="detail-price">${escapeHtml(product.priceDisplay)}</p>
                          <p class="collection-product-description">${escapeHtml(product.description)}</p>
                          ${productSpecsMarkup(product)}
                          <a class="text-action collection-product-link" href="${buildProductHref(product)}">View Piece</a>
                          ${productActionsMarkup(product)}
                          <p class="product-feedback product-feedback-detail" aria-live="polite"></p>
                        </div>
                      </article>
                    `,
                  )
                  .join("")
              : `
                <section class="collection-missing">
                  <p class="eyebrow">${escapeHtml(collection.label)}</p>
                  <h1>Product details are being prepared.</h1>
                  <p>This collection will appear here as soon as its mapped product file is ready.</p>
                </section>
              `
          }
        </div>
      </section>
    `;
  };

  const renderProductDetailPage = () => {
    const pageRoot = document.querySelector("[data-product-detail-page]");

    if (!pageRoot) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = cleanText(params.get("product") || params.get("id"));
    const collectionSlug = cleanText(params.get("collection"));
    const scopedProducts = collectionSlug ? state.productsBySlug[collectionSlug] || [] : [];
    const product =
      scopedProducts.find((item) => item.id === productId) || state.productCatalog[productId];
    const collection = product ? state.collectionLookup[product.collectionSlug] : null;

    if (!product || !collection) {
      pageRoot.innerHTML = `
        <section class="collection-missing">
          <p class="eyebrow">Product</p>
          <h1>This piece is being prepared.</h1>
          <p>Return to Collections to continue through the current MallowMauve worlds.</p>
          <a class="button button-soft" href="/">Return Home</a>
        </section>
      `;
      return;
    }

    document.title = `MallowMauve | ${product.name}`;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        `${product.name} by MallowMauve. ${product.story}`,
      );
    }

    const primaryImage = product.lifestyleImage || product.studioImage;
    const secondaryImage = product.studioImage && product.studioImage !== primaryImage
      ? product.studioImage
      : "";
    const thumbnails = [primaryImage, secondaryImage].filter(Boolean);

    pageRoot.innerHTML = `
      <a class="collection-backlink detail-backlink" href="${buildCollectionHref(collection.slug)}">
        <span aria-hidden="true">←</span>
        <span>Back to ${escapeHtml(collection.title)}</span>
      </a>

      <section class="detail-layout" data-product-root data-product-id="${escapeHtml(product.id)}">
        <div class="detail-gallery">
          ${
            primaryImage
              ? `
                <button
                  class="detail-primary-image-button"
                  type="button"
                  data-gallery-open
                  aria-label="Zoom ${escapeHtml(product.name)}"
                >
                  <img
                    class="detail-primary-image"
                    src="${escapeHtml(primaryImage)}"
                    alt="${escapeHtml(`${product.name} ${product.variant}`)}"
                    data-detail-main-image
                  />
                </button>
              `
              : buildMediaPlaceholder("Mapped product image pending")
          }
          ${primaryImage ? buildBrandBadge("media-brand-badge media-brand-badge--detail") : ""}
          ${
            thumbnails.length > 1
              ? `
                <div class="detail-thumbnails">
                  ${thumbnails
                    .map(
                      (image, index) => `
                        <button
                          class="thumbnail-button${index === 0 ? " is-active" : ""}"
                          type="button"
                          data-thumbnail-src="${escapeHtml(image)}"
                          data-thumbnail-alt="${escapeHtml(`${product.name} ${index === 0 ? "lifestyle" : "studio"} view`)}"
                        >
                          <img src="${escapeHtml(image)}" alt="${escapeHtml(`${product.name} thumbnail ${index + 1}`)}" />
                        </button>
                      `,
                    )
                    .join("")}
                </div>
              `
              : ""
          }
        </div>

        <div class="detail-info">
          <p class="eyebrow">${escapeHtml(collection.title)}</p>
          <h1 class="detail-name">${escapeHtml(product.name)}</h1>
          <p class="detail-variant-name">${escapeHtml(product.variant)}</p>
          <p class="detail-description detail-story">${escapeHtml(product.story)}</p>
          <p class="detail-description">${escapeHtml(product.description)}</p>
          <p class="detail-price">${escapeHtml(product.priceDisplay)}</p>
          <div class="detail-meta">
            <div class="detail-meta-item">
              <span>Material</span>
              <p>${escapeHtml(product.material)}</p>
            </div>
            <div class="detail-meta-item">
              <span>Dimensions</span>
              <p>${escapeHtml(product.dimensions)}</p>
            </div>
          </div>
          <div class="detail-actions">
            <button class="button button-filled" type="button" data-add-inquiry>
              Add to Selections
            </button>
            <button class="text-action" type="button" data-add-wishlist>
              Save to Wishlist
            </button>
          </div>
          <p class="product-feedback product-feedback-detail" aria-live="polite"></p>
        </div>
      </section>

      <section class="detail-sections reveal">
        <article class="detail-section">
          <p class="eyebrow">Story</p>
          <h2>Composed with a quieter point of view.</h2>
          <p>${escapeHtml(product.story)}</p>
        </article>

        <article class="detail-section">
          <p class="eyebrow">Details</p>
          <h2>Material and making.</h2>
          <p>${escapeHtml(product.material)}</p>
        </article>

        <article class="detail-section">
          <p class="eyebrow">Dimensions</p>
          <h2>Measured for placement.</h2>
          <p>${escapeHtml(product.dimensions)}</p>
        </article>
      </section>
    `;
  };

  const buildProductCatalog = () => {
    state.productCatalog = Object.fromEntries(
      Object.values(state.productsBySlug)
        .flat()
        .map((product) => [
          product.id,
          {
            ...product,
            detailHref: buildProductHref(product),
          },
        ]),
    );

    window.MALLOW_PRODUCT_CATALOG = state.productCatalog;
    window.dispatchEvent(
      new CustomEvent("mallow:catalog-ready", {
        detail: { catalog: state.productCatalog },
      }),
    );
  };

  const loadContent = async () => {
    const collectionData = await fetchJson(config.content.collections);
    const collections = Array.isArray(collectionData)
      ? sortByOrder(collectionData.map(normalizeCollection))
      : [];

    state.collections = collections;
    state.collectionLookup = Object.fromEntries(collections.map((collection) => [collection.slug, collection]));

    const productEntries = await Promise.all(
      collections.map(async (collection) => {
        const data = await fetchJson(
          `${config.content.productsBase}/${encodeURIComponent(collection.slug)}.json`,
        );
        const products = Array.isArray(data)
          ? sortByOrder(
              data
                .map(normalizeProduct)
                .filter(
                  (product) =>
                    product.collectionSlug === collection.slug && product.status !== "archived",
                ),
            )
          : [];
        return [collection.slug, products];
      }),
    );

    state.productsBySlug = Object.fromEntries(productEntries);
    buildProductCatalog();
  };

  const signalContentReady = () => {
    window.MALLOW_CONTENT_READY = true;
    window.dispatchEvent(new CustomEvent("mallow:content-ready"));
  };

  const initialize = async () => {
    renderMasterHero();
    renderCraftIntro();
    await loadContent();
    renderCollectionLinks();
    renderCollectionWorlds();
    restoreHomepageCollectionAnchor();
    renderCollectionPage();
    renderProductDetailPage();
    signalContentReady();
  };

  initialize();
})();
