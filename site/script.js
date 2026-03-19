const revealElements = document.querySelectorAll(".reveal");
const productRoots = document.querySelectorAll("[data-product-root]");
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
const openDrawerButtons = document.querySelectorAll("[data-open-drawer]");
const closeDrawerButtons = document.querySelectorAll("[data-close-drawer]");
const sendRequestButton = document.querySelector("[data-send-request]");
const selectionsSection = document.querySelector('[data-drawer-section="selections"]');
const wishlistSection = document.querySelector('[data-drawer-section="wishlist"]');

const STORAGE_KEYS = {
  inquiry: "mallowmauve.inquiry",
  wishlist: "mallowmauve.wishlist",
};

const WHATSAPP_PHONE = "919990709988";
const copy = {
  emptySelections: "No pieces selected yet.",
  selectionSingular: "You have selected 1 piece.",
  selectionPlural: (count) => `You have selected ${count} pieces.`,
  addedToSelections: "Added to Selections",
  savedToWishlist: "Saved to Wishlist",
  wishlistSavedSuffix: "saved",
  emptyRequestMessage: "#",
  whatsappIntro: "Hello, I would like to enquire about the following pieces:",
  whatsappClose: "Kindly assist.",
  moveToWishlist: "Save to Wishlist",
  addToSelections: "Add to Selections",
  savedForLater: "Saved for later",
};

const productCatalog = {
  "gulistan-indigo": {
    id: "gulistan-indigo",
    name: "Kashmiri Gulistan Cushion",
    variant: "Indigo Bloom",
    price: "₹4,800",
  },
  "millefiori-blush": {
    id: "millefiori-blush",
    name: "Mughal Millefiori Cushion",
    variant: "Blush",
    price: "₹5,200",
  },
  "sozni-ivory": {
    id: "sozni-ivory",
    name: "Silk Sozni Embroidered Cushion",
    variant: "Ivory",
    price: "₹6,000",
  },
};

const loadState = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch (error) {
    return [];
  }
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

let inquiryItems = sanitizeInquiryItems(loadState(STORAGE_KEYS.inquiry));
let wishlistItems = sanitizeWishlistItems(loadState(STORAGE_KEYS.wishlist));

const persistState = () => {
  localStorage.setItem(STORAGE_KEYS.inquiry, JSON.stringify(inquiryItems));
  localStorage.setItem(STORAGE_KEYS.wishlist, JSON.stringify(wishlistItems));
};

const showFeedback = (card, message) => {
  const feedback = card.querySelector(".product-feedback");
  feedback.textContent = message;
  feedback.classList.add("is-visible");

  window.clearTimeout(card.feedbackTimeout);
  card.feedbackTimeout = window.setTimeout(() => {
    feedback.classList.remove("is-visible");
    feedback.textContent = "";
  }, 2200);
};

let backdropTimer;

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
  window.clearTimeout(backdropTimer);
  backdrop.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  openDrawerButtons.forEach((button) => {
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
  body.classList.remove("drawer-open");
  drawer.setAttribute("aria-hidden", "true");
  window.clearTimeout(backdropTimer);
  backdropTimer = window.setTimeout(() => {
    backdrop.hidden = true;
  }, 420);
  openDrawerButtons.forEach((button) => {
    button.setAttribute("aria-expanded", "false");
  });
};

const setInquiryCount = () => {
  const total = inquiryItems.reduce((count, item) => count + item.quantity, 0);
  inquiryCount.textContent = total ? `(${total})` : "";

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
  wishlistCount.textContent = `${wishlistItems.length} ${copy.wishlistSavedSuffix}`;
  wishlistNavCount.textContent = wishlistItems.length ? `(${wishlistItems.length})` : "";
};

const buildWhatsAppUrl = () => {
  const lines = inquiryItems.map((item, index) => {
    const quantitySuffix = item.quantity > 1 ? ` x${item.quantity}` : "";
    return `${index + 1}. ${item.name} — ${item.variant}${quantitySuffix}`;
  });

  const message = [
    copy.whatsappIntro,
    "",
    ...lines,
    "",
    copy.whatsappClose,
  ].join("\n");

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};

const renderInquiryItems = () => {
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
  const existing = inquiryItems.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    const product = productCatalog[productId];
    inquiryItems.push({ ...product, quantity: 1 });
  }

  wishlistItems = wishlistItems.filter((item) => item.id !== productId);
  renderState();
};

const addToWishlist = (productId) => {
  const alreadySaved = wishlistItems.some((item) => item.id === productId);

  if (alreadySaved) {
    return;
  }

  const product = productCatalog[productId];
  wishlistItems.push({ ...product });
  renderState();
};

productRoots.forEach((root) => {
  const productId = root.dataset.productId;
  const addInquiryButton = root.querySelector("[data-add-inquiry]");
  const addWishlistButton = root.querySelector("[data-add-wishlist]");

  if (!addInquiryButton) {
    return;
  }

  addInquiryButton.addEventListener("click", () => {
    addToInquiry(productId);
    showFeedback(root, copy.addedToSelections);
  });

  if (addWishlistButton) {
    addWishlistButton.addEventListener("click", () => {
      addToWishlist(productId);
      showFeedback(root, copy.savedToWishlist);
    });
  }
});

openDrawerButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openDrawer(button.dataset.openDrawer || "selections");
  });
});

closeDrawerButtons.forEach((button) => {
  button.addEventListener("click", closeDrawer);
});

sendRequestButton.addEventListener("click", (event) => {
  if (!inquiryItems.length) {
    event.preventDefault();
  }
});

drawer.addEventListener("click", (event) => {
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

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && body.classList.contains("drawer-open")) {
    closeDrawer();
  }
});

const revealObserver = new IntersectionObserver(
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

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

const detailMainImage = document.querySelector("[data-detail-main-image]");
const thumbnailButtons = document.querySelectorAll("[data-thumbnail-src]");

thumbnailButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!detailMainImage) {
      return;
    }

    detailMainImage.src = button.dataset.thumbnailSrc;
    detailMainImage.alt = button.dataset.thumbnailAlt;

    thumbnailButtons.forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
  });
});

renderState();
