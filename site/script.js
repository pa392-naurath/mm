const body = document.body;
const drawer = document.querySelector(".inquiry-drawer");
const backdrop = document.querySelector(".drawer-backdrop");
const inquiryCount = document.querySelector("[data-inquiry-count]");
const wishlistCount = document.querySelector("[data-wishlist-count]");
const wishlistNavCount = document.querySelector("[data-wishlist-count-nav]");
const selectionSummary = document.querySelector("[data-selection-summary]");
const inquiryList = document.querySelector("[data-inquiry-list]");
const wishlistList = document.querySelector("[data-wishlist-list]");
const inquiryEmpty = document.querySelector("[data-inquiry-empty]");
const wishlistEmpty = document.querySelector("[data-wishlist-empty]");
const sendRequestButton = document.querySelector("[data-send-request]");
const selectionsSection = document.querySelector('[data-drawer-section="selections"]');
const wishlistSection = document.querySelector('[data-drawer-section="wishlist"]');
const contactForm = document.querySelector("[data-contact-form]");
const contactFeedback = document.querySelector("[data-contact-feedback]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const STORAGE_KEYS = {
  inquiry: "mallowmauve.inquiry",
  wishlist: "mallowmauve.wishlist",
  contactLeads: "mallowmauve.contactLeads",
};

const copy = {
  emptySelections: "No pieces selected yet.",
  selectionSingular: "You have selected 1 piece.",
  selectionPlural: (count) => `You have selected ${count} pieces.`,
  addedToSelections: "Added to Selections",
  savedToWishlist: "Saved to Wishlist",
  wishlistSavedSuffix: "saved",
  whatsappIntro: "Hello, I would like to enquire about the following pieces:",
  whatsappClose: "Kindly assist.",
  moveToWishlist: "Save to Wishlist",
  addToSelections: "Add to Selections",
  savedForLater: "Saved for later",
};

const loadState = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    return [];
  }
};

let productCatalog = window.MALLOW_PRODUCT_CATALOG || {};
let inquiryItems = [];
let wishlistItems = [];
let revealObserver;
let backdropTimer;
let motionLoopBound = false;
let collectionLedInitialized = false;
let storyExperienceInitialized = false;
let catalogHydrated = false;
let zoomModal;
let zoomImage;
let zoomScale = 1;

const rawInquiryState = loadState(STORAGE_KEYS.inquiry);
const rawWishlistState = loadState(STORAGE_KEYS.wishlist);

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

try {
  window.history.scrollRestoration = "manual";
} catch (error) {
  // Ignore unsupported browsers.
}

try {
  const navigationEntry = performance.getEntriesByType("navigation")[0];
  if (navigationEntry?.type === "reload") {
    window.sessionStorage.removeItem("mallowmauve.pendingReturnAnchor");
    window.sessionStorage.removeItem("mallowmauve.returnAnchor");
    if (body.classList.contains("home-page") && window.location.hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    });
  }
} catch (error) {
  // Ignore unsupported performance APIs.
}

window.addEventListener("pageshow", () => {
  if (!body.classList.contains("home-page")) {
    return;
  }

  let pendingAnchor = "";

  try {
    pendingAnchor = window.sessionStorage.getItem("mallowmauve.pendingReturnAnchor") || "";
  } catch (error) {
    pendingAnchor = "";
  }

  if (pendingAnchor) {
    return;
  }

  if (window.location.hash) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
});

const persistCollectionReturnAnchor = (anchor) => {
  if (!anchor) {
    return;
  }

  try {
    window.sessionStorage.setItem("mallowmauve.returnAnchor", anchor);
  } catch (error) {
    // Ignore storage access issues.
  }
};

const storeContactLead = (lead) => {
  try {
    const existing = loadState(STORAGE_KEYS.contactLeads);
    existing.push(lead);
    localStorage.setItem(STORAGE_KEYS.contactLeads, JSON.stringify(existing));
  } catch (error) {
    // Ignore storage access issues.
  }
};

const ensureZoomModal = () => {
  if (zoomModal) {
    return;
  }

  const modal = document.createElement("div");
  modal.className = "image-zoom-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="image-zoom-backdrop" data-zoom-close></div>
    <div class="image-zoom-shell" role="dialog" aria-modal="true" aria-label="Zoomed product image">
      <div class="image-zoom-toolbar">
        <button class="image-zoom-control" type="button" data-zoom-out aria-label="Zoom out">−</button>
        <button class="image-zoom-control" type="button" data-zoom-reset aria-label="Reset zoom">100%</button>
        <button class="image-zoom-control" type="button" data-zoom-in aria-label="Zoom in">+</button>
        <button class="image-zoom-close" type="button" data-zoom-close aria-label="Close image">Close</button>
      </div>
      <div class="image-zoom-stage">
        <img class="image-zoom-image" src="" alt="" />
      </div>
    </div>
  `;

  body.append(modal);
  zoomModal = modal;
  zoomImage = modal.querySelector(".image-zoom-image");
};

const updateZoom = () => {
  if (!zoomImage) {
    return;
  }

  zoomImage.style.transform = `scale(${zoomScale})`;
};

const openZoomModal = (src, alt) => {
  if (!src) {
    return;
  }

  ensureZoomModal();
  if (!zoomModal || !zoomImage) {
    return;
  }

  zoomScale = 1;
  zoomImage.src = src;
  zoomImage.alt = alt || "";
  updateZoom();
  zoomModal.hidden = false;
  zoomModal.setAttribute("aria-hidden", "false");
  window.requestAnimationFrame(() => {
    body.classList.add("zoom-modal-open");
  });
};

const closeZoomModal = () => {
  if (!zoomModal) {
    return;
  }

  body.classList.remove("zoom-modal-open");
  zoomModal.setAttribute("aria-hidden", "true");
  window.setTimeout(() => {
    if (!zoomModal) {
      return;
    }

    zoomModal.hidden = true;
  }, 180);
};

const adjustZoom = (delta) => {
  zoomScale = clamp(zoomScale + delta, 1, 2.6);
  updateZoom();
};

const swapCollectionGallery = (root) => {
  if (!root) {
    return;
  }

  const mainImage = root.querySelector("[data-gallery-main-image]");
  const thumbImage = root.querySelector("[data-gallery-thumb-image]");

  if (!mainImage || !thumbImage) {
    return;
  }

  const mainSrc = mainImage.getAttribute("src");
  const mainAlt = mainImage.getAttribute("alt");
  const thumbSrc = thumbImage.getAttribute("src");
  const thumbAlt = thumbImage.getAttribute("alt");

  mainImage.src = thumbSrc;
  mainImage.alt = thumbAlt;
  thumbImage.src = mainSrc;
  thumbImage.alt = mainAlt;
};

const persistState = () => {
  if (!catalogHydrated) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.inquiry, JSON.stringify(inquiryItems));
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistItems));
};

const sanitizeInquiryItems = (items) =>
  items
    .filter((item) => productCatalog[item.id])
    .map((item) => ({
      ...productCatalog[item.id],
      quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
    }));

const sanitizeWishlistItems = (items) =>
  items
    .filter((item) => productCatalog[item.id])
    .map((item) => ({
      ...productCatalog[item.id],
    }));

const hydrateStoredState = () => {
  inquiryItems = sanitizeInquiryItems(rawInquiryState);
  wishlistItems = sanitizeWishlistItems(rawWishlistState);
  persistState();
};

const showFeedback = (root, message) => {
  if (!root) {
    return;
  }

  const feedback = root.querySelector(".product-feedback");

  if (!feedback) {
    return;
  }

  feedback.textContent = message;
  feedback.classList.add("is-visible");

  window.clearTimeout(root.feedbackTimeout);
  root.feedbackTimeout = window.setTimeout(() => {
    feedback.classList.remove("is-visible");
    feedback.textContent = "";
  }, 2200);
};

const scrollDrawerToSection = (targetSection) => {
  if (!drawer) {
    return;
  }

  if (targetSection === "wishlist" && wishlistSection) {
    wishlistSection.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (selectionsSection) {
    selectionsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const openDrawer = (targetSection = "selections") => {
  if (!drawer || !backdrop) {
    return;
  }

  window.clearTimeout(backdropTimer);
  backdrop.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  document.querySelectorAll("[data-open-drawer]").forEach((button) => {
    button.setAttribute("aria-expanded", "true");
  });
  window.requestAnimationFrame(() => {
    body.classList.add("drawer-open");
  });
  window.setTimeout(() => {
    scrollDrawerToSection(targetSection);
  }, 120);
};

const closeDrawer = () => {
  if (!drawer || !backdrop) {
    return;
  }

  body.classList.remove("drawer-open");
  drawer.setAttribute("aria-hidden", "true");
  window.clearTimeout(backdropTimer);
  backdropTimer = window.setTimeout(() => {
    backdrop.hidden = true;
  }, 420);
  document.querySelectorAll("[data-open-drawer]").forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
};

const buildWhatsAppUrl = () => {
  const phone = window.MALLOW_SITE_CONFIG?.whatsappPhone || "919990709988";
  const lines = inquiryItems.map((item, index) => {
    const quantitySuffix = item.quantity > 1 ? ` x${item.quantity}` : "";
    return `${index + 1}. ${item.whatsappLabel}${quantitySuffix}`;
  });

  const message = [copy.whatsappIntro, "", ...lines, "", copy.whatsappClose].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
};

const setInquiryCount = () => {
  const total = inquiryItems.reduce((count, item) => count + item.quantity, 0);

  if (inquiryCount) {
    inquiryCount.textContent = total ? `(${total})` : "";
  }

  if (!selectionSummary) {
    return;
  }

  if (total === 0) {
    selectionSummary.textContent = copy.emptySelections;
    return;
  }

  selectionSummary.textContent =
    total === 1 ? copy.selectionSingular : copy.selectionPlural(total);
};

const setWishlistCount = () => {
  if (wishlistCount) {
    wishlistCount.textContent = `${wishlistItems.length} ${copy.wishlistSavedSuffix}`;
  }

  if (wishlistNavCount) {
    wishlistNavCount.textContent = wishlistItems.length ? `(${wishlistItems.length})` : "";
  }
};

const renderInquiryItems = () => {
  if (!inquiryList || !inquiryEmpty || !sendRequestButton) {
    return;
  }

  inquiryList.innerHTML = "";

  if (!inquiryItems.length) {
    inquiryEmpty.classList.add("is-visible");
    sendRequestButton.setAttribute("aria-disabled", "true");
    sendRequestButton.classList.add("is-disabled");
    sendRequestButton.href = "#";
    return;
  }

  inquiryEmpty.classList.remove("is-visible");
  sendRequestButton.removeAttribute("aria-disabled");
  sendRequestButton.classList.remove("is-disabled");
  sendRequestButton.href = buildWhatsAppUrl();

  inquiryItems.forEach((item) => {
    const entry = document.createElement("article");
    entry.className = "drawer-item";
    entry.innerHTML = `
      <div class="drawer-item-main">
        <div>
          <h3 class="drawer-item-name">${item.name}</h3>
          <p class="drawer-item-variant">${item.variant}</p>
        </div>
        <button class="drawer-action" type="button" data-remove-inquiry="${item.id}">
          Remove
        </button>
      </div>
      <div class="drawer-item-controls">
        <div class="quantity-control" aria-label="Quantity controls">
          <button class="quantity-button" type="button" data-quantity-change="${item.id}" data-direction="-1">−</button>
          <span class="quantity-value">${item.quantity}</span>
          <button class="quantity-button" type="button" data-quantity-change="${item.id}" data-direction="1">+</button>
        </div>
        <button class="drawer-action" type="button" data-move-wishlist="${item.id}">
          ${copy.moveToWishlist}
        </button>
      </div>
    `;
    inquiryList.append(entry);
  });
};

const renderWishlistItems = () => {
  if (!wishlistList || !wishlistEmpty) {
    return;
  }

  wishlistList.innerHTML = "";

  if (!wishlistItems.length) {
    wishlistEmpty.classList.add("is-visible");
    return;
  }

  wishlistEmpty.classList.remove("is-visible");

  wishlistItems.forEach((item) => {
    const entry = document.createElement("article");
    entry.className = "drawer-item";
    entry.innerHTML = `
      <div class="drawer-item-main">
        <div>
          <h3 class="drawer-item-name">${item.name}</h3>
          <p class="drawer-item-variant">${item.variant}</p>
        </div>
        <button class="drawer-action" type="button" data-remove-wishlist="${item.id}">
          Remove
        </button>
      </div>
      <div class="drawer-item-controls">
        <span class="drawer-subcount">${copy.savedForLater}</span>
        <button class="drawer-action" type="button" data-move-inquiry="${item.id}">
          ${copy.addToSelections}
        </button>
      </div>
    `;
    wishlistList.append(entry);
  });
};

const renderState = () => {
  setInquiryCount();
  setWishlistCount();
  renderInquiryItems();
  renderWishlistItems();
  persistState();
};

const addToInquiry = (productId) => {
  const product = productCatalog[productId];

  if (!product) {
    return;
  }

  const existing = inquiryItems.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    inquiryItems.push({ ...product, quantity: 1 });
  }

  wishlistItems = wishlistItems.filter((item) => item.id !== productId);
  renderState();
};

const addToWishlist = (productId) => {
  const product = productCatalog[productId];

  if (!product || wishlistItems.some((item) => item.id === productId)) {
    return;
  }

  wishlistItems.push({ ...product });
  renderState();
};

const setCatalog = (catalog) => {
  productCatalog = catalog || {};
  catalogHydrated = true;
  hydrateStoredState();
  renderState();
};

const initRevealObserver = () => {
  if (revealObserver || prefersReducedMotion) {
    return;
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    },
  );
};

const observeReveals = (root = document) => {
  if (prefersReducedMotion) {
    root.querySelectorAll(".reveal").forEach((element) => {
      element.classList.add("is-visible");
    });
    return;
  }

  initRevealObserver();

  root.querySelectorAll(".reveal").forEach((element) => {
    if (element.dataset.revealObserved === "true") {
      return;
    }

    element.dataset.revealObserved = "true";
    revealObserver.observe(element);
  });
};

const bindMotionLoop = () => {
  if (prefersReducedMotion || motionLoopBound) {
    return;
  }

  motionLoopBound = true;
  let motionTicking = false;

  const updateMotion = () => {
    const viewportHeight = window.innerHeight || 1;
    const parallaxElements = document.querySelectorAll("[data-parallax]");
    const heroPanel = document.querySelector(".home-page .hero-panel");
    const featureSections = document.querySelectorAll("[data-feature-section]");
    const showcaseSection = document.querySelector("[data-showcase-section]");

    if (heroPanel) {
      const rect = heroPanel.getBoundingClientRect();
      const total = Math.max(rect.height - viewportHeight * 0.24, 1);
      const progress = clamp(-rect.top / total);

      heroPanel.style.setProperty("--hero-progress", progress.toFixed(3));
      body.style.setProperty("--hero-progress", progress.toFixed(3));
    }

    if (showcaseSection) {
      const rect = showcaseSection.getBoundingClientRect();
      const total = Math.max(rect.height - viewportHeight, 1);
      const progress = clamp(-rect.top / total);

      showcaseSection.style.setProperty("--showcase-progress", progress.toFixed(3));
    }

    featureSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const total = Math.max(viewportHeight + rect.height * 0.42, 1);
      const progress = clamp((viewportHeight - rect.top) / total);

      section.style.setProperty("--feature-progress", progress.toFixed(3));
    });

    parallaxElements.forEach((element) => {
      const rect = element.getBoundingClientRect();
      const speed = Number(element.dataset.parallaxSpeed || "0.04");
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const translateY = centerOffset * -speed;

      element.style.setProperty("--parallax-offset", `${translateY.toFixed(1)}px`);
    });

    motionTicking = false;
  };

  const requestMotionUpdate = () => {
    if (motionTicking) {
      return;
    }

    motionTicking = true;
    window.requestAnimationFrame(updateMotion);
  };

  requestMotionUpdate();
  window.addEventListener("scroll", requestMotionUpdate, { passive: true });
  window.addEventListener("resize", requestMotionUpdate);
  window.addEventListener("load", requestMotionUpdate);
};

const initStoryExperience = () => {
  if (!body.classList.contains("home-page") || prefersReducedMotion || storyExperienceInitialized) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  storyExperienceInitialized = true;
  const { gsap } = window;
  const { ScrollTrigger } = window;

  gsap.registerPlugin(ScrollTrigger);

  const sceneConfigs = {
    hero: {
      endDesktop: 1650,
      endMobile: 900,
      setup(scene, timeline) {
        const image = scene.querySelector(".story-layer-base .story-image");
        const copyItems = scene.querySelectorAll(".story-hero-copy > *");
        const caption = scene.querySelector(".story-caption");

        if (!image) {
          return;
        }

        gsap.set(image, { autoAlpha: 1, scale: 1.12, yPercent: 0 });
        gsap.set(copyItems, { autoAlpha: 0, y: 34 });
        gsap.set(caption, { autoAlpha: 0, y: 22 });

        const intro = gsap.timeline({ defaults: { ease: "power2.out" } });
        intro
          .to(image, { scale: 1.06, duration: 2.1, ease: "power3.out" }, 0)
          .to(copyItems, { autoAlpha: 1, y: 0, stagger: 0.16, duration: 1.05 }, 0.2)
          .to(caption, { autoAlpha: 1, y: 0, duration: 1.1 }, 0.82);

        timeline
          .to(image, { scale: 1, yPercent: -4, ease: "none" }, 0)
          .to(copyItems, { y: -78, autoAlpha: 0, stagger: 0.02, ease: "none" }, 0)
          .to(caption, { y: 36, autoAlpha: 0, ease: "none" }, 0.05);
      },
    },
    focus: {
      endDesktop: 1450,
      endMobile: 820,
      setup(scene, timeline) {
        const room = scene.querySelector(".story-layer-room .story-image");
        const detail = scene.querySelector(".story-layer-detail .story-image");
        const caption = scene.querySelector(".story-caption");

        if (!room || !detail) {
          return;
        }

        gsap.set(room, { autoAlpha: 1, scale: 1.1, xPercent: -2, filter: "blur(0px)" });
        gsap.set(detail, { scale: 1.22, xPercent: 5, autoAlpha: 0, filter: "blur(14px)" });
        gsap.set(caption, { autoAlpha: 0, y: 28 });

        timeline
          .to(room, { scale: 1.18, xPercent: -6, autoAlpha: 0.26, filter: "blur(8px)", ease: "none" }, 0)
          .to(detail, { scale: 1.02, xPercent: 0, autoAlpha: 1, filter: "blur(0px)", ease: "none" }, 0.18)
          .to(caption, { autoAlpha: 1, y: 0, ease: "none" }, 0.28);
      },
    },
    craft: {
      endDesktop: 1500,
      endMobile: 860,
      setup(scene, timeline) {
        const crop = scene.querySelector(".story-layer-crop .story-image");
        const full = scene.querySelector(".story-layer-full .story-image");
        const copy = scene.querySelector(".story-copy");

        if (!crop || !full) {
          return;
        }

        gsap.set(crop, { autoAlpha: 1, scale: 1.26, xPercent: -6, filter: "blur(8px)" });
        gsap.set(full, { scale: 1.08, autoAlpha: 0, filter: "blur(16px)" });
        gsap.set(copy, { autoAlpha: 0, y: 30 });

        timeline
          .to(crop, { scale: 1.08, xPercent: 0, filter: "blur(0px)", autoAlpha: 0.2, ease: "none" }, 0)
          .to(full, { scale: 1, autoAlpha: 1, filter: "blur(0px)", ease: "none" }, 0.22)
          .to(copy, { autoAlpha: 1, y: 0, ease: "none" }, 0.36);
      },
    },
    "runner-transition": {
      endDesktop: 1450,
      endMobile: 820,
      setup(scene, timeline) {
        const detail = scene.querySelector(".story-layer-detail-runner .story-image");
        const full = scene.querySelector(".story-layer-full-runner .story-image");
        const copy = scene.querySelector(".story-copy");

        if (!detail || !full) {
          return;
        }

        gsap.set(detail, { autoAlpha: 1, scale: 1.34, yPercent: 6, filter: "blur(2px)" });
        gsap.set(full, { scale: 1.04, autoAlpha: 0, filter: "blur(14px)" });
        gsap.set(copy, { autoAlpha: 0, y: 30 });

        timeline
          .to(detail, { scale: 1.12, yPercent: -8, autoAlpha: 0.22, filter: "blur(10px)", ease: "none" }, 0)
          .to(full, { scale: 1, autoAlpha: 1, filter: "blur(0px)", ease: "none" }, 0.2)
          .to(copy, { autoAlpha: 1, y: 0, ease: "none" }, 0.36);
      },
    },
    scale: {
      endDesktop: 1300,
      endMobile: 760,
      setup(scene, timeline) {
        const image = scene.querySelector(".story-layer-scale .story-image");
        const caption = scene.querySelector(".story-caption");

        if (!image) {
          return;
        }

        gsap.set(image, { autoAlpha: 1, scale: 1.12, yPercent: -3 });
        gsap.set(caption, { autoAlpha: 0, y: 18 });

        timeline
          .to(image, { scale: 1, yPercent: 0, ease: "none" }, 0)
          .to(caption, { autoAlpha: 1, y: 0, ease: "none" }, 0.35);
      },
    },
    finale: {
      endDesktop: 1320,
      endMobile: 760,
      setup(scene, timeline) {
        const image = scene.querySelector(".story-layer-finale .story-image");
        const copy = scene.querySelector(".story-copy");

        if (!image) {
          return;
        }

        gsap.set(image, { autoAlpha: 1, scale: 1.08, yPercent: -2, filter: "blur(2px)" });
        gsap.set(copy, { autoAlpha: 0, y: 36 });

        timeline
          .to(image, { scale: 1, yPercent: 0, filter: "blur(0px)", ease: "none" }, 0)
          .to(copy, { autoAlpha: 1, y: 0, ease: "none" }, 0.35);
      },
    },
  };

  const mm = gsap.matchMedia();

  mm.add(
    {
      desktop: "(min-width: 721px)",
      mobile: "(max-width: 720px)",
    },
    (context) => {
      const { desktop } = context.conditions;
      const scenes = gsap.utils.toArray("[data-story-scene]");

      scenes.forEach((scene) => {
        const sticky = scene.querySelector(".story-scene-sticky");
        const config = sceneConfigs[scene.dataset.storyScene];

        if (!sticky || !config) {
          return;
        }

        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: scene,
            start: "top top",
            end: `+=${desktop ? config.endDesktop : config.endMobile}`,
            scrub: 1.1,
            pin: sticky,
            anticipatePin: 1,
          },
        });

        config.setup(scene, timeline, desktop);
      });

      body.classList.add("story-motion-active");
      ScrollTrigger.refresh();
    },
  );
};

const initCollectionLedExperience = () => {
  if (!body.classList.contains("home-page") || prefersReducedMotion || collectionLedInitialized) {
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    return;
  }

  const masterHero = document.querySelector(".master-hero");
  const collectionWorlds = window.gsap.utils.toArray("[data-collection-world]");

  if (!masterHero && !collectionWorlds.length) {
    return;
  }

  collectionLedInitialized = true;
  const { gsap } = window;
  const { ScrollTrigger } = window;

  gsap.registerPlugin(ScrollTrigger);

  if (masterHero) {
    const image = masterHero.querySelector(".master-hero-image");
    const copyItems = masterHero.querySelectorAll(".master-hero-copy > *");

    if (image) {
      gsap.set(image, { scale: 1.15, yPercent: -2 });
      gsap.set(copyItems, { autoAlpha: 1, y: 0 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: masterHero,
            start: "top top",
            end: "bottom top",
            scrub: 1.05,
          },
        })
        .to(image, { scale: 1.08, yPercent: 4 }, 0)
        .to(copyItems, { y: -42, autoAlpha: 0.18, stagger: 0.02 }, 0.02);
    }
  }

  collectionWorlds.forEach((section) => {
    const media = section.querySelector("[data-collection-media]");
    const image = section.querySelector(".collection-world-hero__image");
    const copyItems = section.querySelectorAll(".collection-world-hero__content > *");
    const xOffset = section.classList.contains("collection-world-hero--right") ? -1.2 : 1.2;

    gsap.set(section, { autoAlpha: 0.84, y: 24 });
    gsap.set(copyItems, { autoAlpha: 0, y: 40 });

    if (media && image) {
      gsap.set(media, { autoAlpha: 0.52, filter: "blur(10px)" });
      gsap.set(image, { scale: 1.045, xPercent: xOffset, yPercent: -0.8 });
    }

    const revealTimeline = gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top 86%",
          end: "top 34%",
          scrub: 1.05,
        },
      })
      .to(section, { autoAlpha: 1, y: 0 }, 0)
      .to(copyItems, { autoAlpha: 1, y: 0, stagger: 0.06 }, 0.14);

    if (media && image) {
      revealTimeline
        .to(media, { autoAlpha: 1, filter: "blur(0px)" }, 0)
        .to(image, { scale: 1.02, xPercent: xOffset * 0.2, yPercent: -1.2 }, 0);
    }

    const driftTimeline = gsap
      .timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.1,
        },
      })
      .to(copyItems, { autoAlpha: 0.72, y: -8, stagger: 0.02 }, 0.52);

    if (media && image) {
      driftTimeline.to(image, { scale: 1, xPercent: xOffset * -0.12, yPercent: -1.6 }, 0);
    }
  });

  ScrollTrigger.refresh();
};

const handleContentReady = () => {
  observeReveals(document);
  bindMotionLoop();
  initCollectionLedExperience();
  initStoryExperience();
};

if (body.classList.contains("home-page")) {
  if (prefersReducedMotion) {
    body.classList.add("is-loaded");
  } else {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        body.classList.add("is-loaded");
      });
    });
  }
}

document.addEventListener("click", (event) => {
  const collectionEntryTrigger = event.target.closest("[data-collection-entry]");
  const backCollectionsTrigger = event.target.closest("[data-back-collections]");
  const openTrigger = event.target.closest("[data-open-drawer]");
  const closeTrigger = event.target.closest("[data-close-drawer]");
  const addInquiryTrigger = event.target.closest("[data-add-inquiry]");
  const addWishlistTrigger = event.target.closest("[data-add-wishlist]");
  const thumbnailTrigger = event.target.closest("[data-thumbnail-src]");
  const gallerySwapTrigger = event.target.closest("[data-gallery-swap]");
  const galleryOpenTrigger = event.target.closest("[data-gallery-open]");
  const zoomCloseTrigger = event.target.closest("[data-zoom-close]");
  const zoomInTrigger = event.target.closest("[data-zoom-in]");
  const zoomOutTrigger = event.target.closest("[data-zoom-out]");
  const zoomResetTrigger = event.target.closest("[data-zoom-reset]");

  if (collectionEntryTrigger) {
    persistCollectionReturnAnchor(`#${collectionEntryTrigger.dataset.collectionEntry}`);
  }

  if (backCollectionsTrigger) {
    event.preventDefault();
    persistCollectionReturnAnchor(backCollectionsTrigger.dataset.returnAnchor || "#collections");
    try {
      window.sessionStorage.setItem(
        "mallowmauve.pendingReturnAnchor",
        backCollectionsTrigger.dataset.returnAnchor || "#collections",
      );
    } catch (error) {
      // Ignore storage access issues.
    }
    window.location.href = backCollectionsTrigger.getAttribute("href") || "/";
    return;
  }

  if (openTrigger) {
    event.preventDefault();
    openDrawer(openTrigger.dataset.openDrawer || "selections");
    return;
  }

  if (closeTrigger) {
    event.preventDefault();
    closeDrawer();
    return;
  }

  if (zoomCloseTrigger) {
    event.preventDefault();
    closeZoomModal();
    return;
  }

  if (zoomInTrigger) {
    event.preventDefault();
    adjustZoom(0.2);
    return;
  }

  if (zoomOutTrigger) {
    event.preventDefault();
    adjustZoom(-0.2);
    return;
  }

  if (zoomResetTrigger) {
    event.preventDefault();
    zoomScale = 1;
    updateZoom();
    return;
  }

  if (gallerySwapTrigger) {
    event.preventDefault();
    swapCollectionGallery(gallerySwapTrigger.closest("[data-gallery-root]"));
    return;
  }

  if (galleryOpenTrigger) {
    event.preventDefault();
    const image =
      galleryOpenTrigger.querySelector("[data-gallery-main-image]") ||
      galleryOpenTrigger.querySelector("[data-detail-main-image]") ||
      galleryOpenTrigger.querySelector("img");

    if (image) {
      openZoomModal(image.currentSrc || image.src, image.alt);
    }
    return;
  }

  const galleryMainTrigger = event.target.closest(".collection-product-media-main");

  if (galleryMainTrigger) {
    event.preventDefault();
    const image = galleryMainTrigger.querySelector("[data-gallery-main-image]") || galleryMainTrigger.querySelector("img");

    if (image) {
      openZoomModal(image.currentSrc || image.src, image.alt);
    }
    return;
  }

  if (thumbnailTrigger) {
    const detailMainImage = document.querySelector("[data-detail-main-image]");

    if (!detailMainImage) {
      return;
    }

    detailMainImage.src = thumbnailTrigger.dataset.thumbnailSrc;
    detailMainImage.alt = thumbnailTrigger.dataset.thumbnailAlt;

    document.querySelectorAll("[data-thumbnail-src]").forEach((button) => {
      button.classList.toggle("is-active", button === thumbnailTrigger);
    });
    return;
  }

  if (addInquiryTrigger) {
    const productRoot = addInquiryTrigger.closest("[data-product-root]");
    const productId = productRoot?.dataset.productId;

    if (!productId) {
      return;
    }

    addToInquiry(productId);
    showFeedback(productRoot, copy.addedToSelections);
    return;
  }

  if (addWishlistTrigger) {
    const productRoot = addWishlistTrigger.closest("[data-product-root]");
    const productId = productRoot?.dataset.productId;

    if (!productId) {
      return;
    }

    addToWishlist(productId);
    showFeedback(productRoot, copy.savedToWishlist);
    return;
  }

  if (!drawer || !drawer.contains(event.target)) {
    return;
  }

  const removeInquiryId = event.target.getAttribute("data-remove-inquiry");
  const removeWishlistId = event.target.getAttribute("data-remove-wishlist");
  const moveWishlistId = event.target.getAttribute("data-move-wishlist");
  const moveInquiryId = event.target.getAttribute("data-move-inquiry");
  const quantityChangeId = event.target.getAttribute("data-quantity-change");

  if (removeInquiryId) {
    inquiryItems = inquiryItems.filter((item) => item.id !== removeInquiryId);
    renderState();
    return;
  }

  if (removeWishlistId) {
    wishlistItems = wishlistItems.filter((item) => item.id !== removeWishlistId);
    renderState();
    return;
  }

  if (moveWishlistId) {
    const item = inquiryItems.find((entry) => entry.id === moveWishlistId);
    inquiryItems = inquiryItems.filter((entry) => entry.id !== moveWishlistId);

    if (item && !wishlistItems.some((entry) => entry.id === moveWishlistId)) {
      wishlistItems.push({ ...item });
    }

    renderState();
    return;
  }

  if (moveInquiryId) {
    addToInquiry(moveInquiryId);
    return;
  }

  if (quantityChangeId) {
    const item = inquiryItems.find((entry) => entry.id === quantityChangeId);
    const direction = Number(event.target.getAttribute("data-direction"));

    if (!item) {
      return;
    }

    item.quantity += direction;

    if (item.quantity <= 0) {
      inquiryItems = inquiryItems.filter((entry) => entry.id !== quantityChangeId);
    }

    renderState();
  }
});

if (sendRequestButton) {
  sendRequestButton.addEventListener("click", (event) => {
    if (!inquiryItems.length) {
      event.preventDefault();
    }
  });
}

if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const lead = {
      createdAt: new Date().toISOString(),
      name: String(formData.get("name") || "").trim(),
      contact: String(formData.get("contact") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      location: String(formData.get("location") || "").trim(),
      note: String(formData.get("note") || "").trim(),
    };

    storeContactLead(lead);
    contactForm.reset();

    if (contactFeedback) {
      contactFeedback.textContent =
        "Thank you. Your inquiry has been received and we will get back to you within 24 hours.";
      contactFeedback.classList.add("is-visible");
      window.clearTimeout(contactFeedback.hideTimer);
      contactFeedback.hideTimer = window.setTimeout(() => {
        contactFeedback.classList.remove("is-visible");
      }, 4200);
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && zoomModal && !zoomModal.hidden) {
    closeZoomModal();
    return;
  }

  if (event.key === "Escape" && body.classList.contains("drawer-open")) {
    closeDrawer();
  }
});

window.addEventListener("mallow:catalog-ready", (event) => {
  setCatalog(event.detail?.catalog || {});
});

if (window.MALLOW_CONTENT_READY) {
  handleContentReady();
} else {
  window.addEventListener("mallow:content-ready", handleContentReady, { once: true });
}

if (Object.keys(productCatalog).length) {
  setCatalog(productCatalog);
} else {
  renderState();
}

if (window.MALLOW_CONTENT_READY) {
  handleContentReady();
}
