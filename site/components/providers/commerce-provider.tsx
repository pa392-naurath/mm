"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import posthog from "posthog-js";

import type { LeadStage, ProductContent, SessionContext } from "@/types/domain";

type CommercePanel = "wishlist" | "selections" | null;

export interface ProductSnapshot {
  productId: string;
  collectionSlug: string;
  name: string;
  variant: string;
  price: number;
  currency: string;
  whatsappLabel: string;
  lifestyleImage: string;
  studioImage: string;
}

interface SelectionSnapshot extends ProductSnapshot {
  quantity: number;
}

interface CommerceContextValue {
  ready: boolean;
  session: SessionContext | null;
  wishlistItems: ProductSnapshot[];
  selectionItems: SelectionSnapshot[];
  wishlistCount: number;
  selectionCount: number;
  activePanel: CommercePanel;
  isWishlisted: (productId: string) => boolean;
  isSelected: (productId: string) => boolean;
  openPanel: (panel: Exclude<CommercePanel, null>) => void;
  closePanel: () => void;
  toggleWishlist: (product: ProductSnapshot) => Promise<boolean>;
  toggleSelection: (product: ProductSnapshot) => Promise<boolean>;
  moveWishlistItemToSelections: (productId: string) => Promise<void>;
  removeWishlistItem: (productId: string, collectionSlug: string) => Promise<void>;
  removeSelectionItem: (productId: string, collectionSlug: string) => Promise<void>;
  sendIntroWhatsapp: (collectionSlug?: string | null) => Promise<void>;
  sendSelectionsWhatsapp: () => Promise<void>;
  trackEvent: (input: {
    eventName: string;
    eventSource: string;
    collectionSlug?: string | null;
    productId?: string | null;
    pagePath?: string | null;
    metadata?: Record<string, unknown>;
  }) => Promise<void>;
}

const CommerceContext = createContext<CommerceContextValue | null>(null);

const storageKeys = {
  anonymousId: "mallowmauve.anonymousId",
  sessionRef: "mallowmauve.sessionRef",
  leadRef: "mallowmauve.leadRef",
  wishlist: "mallowmauve.wishlist",
  selections: "mallowmauve.selections",
};

const readStorage = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota / privacy mode failures.
  }
};

const createAnonymousId = () => crypto.randomUUID();

const getDeviceType = () => {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const width = window.innerWidth;

  if (width <= 720) {
    return "mobile";
  }

  if (width <= 1080) {
    return "tablet";
  }

  return "desktop";
};

const buildProductSnapshot = (product: ProductContent): ProductSnapshot => ({
  productId: product.id,
  collectionSlug: product.collectionSlug,
  name: product.name,
  variant: product.variant,
  price: product.price,
  currency: product.currency,
  whatsappLabel: product.whatsappLabel,
  lifestyleImage: product.lifestyleImage,
  studioImage: product.studioImage,
});

export const CommerceProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<SessionContext | null>(null);
  const [wishlistItems, setWishlistItems] = useState<ProductSnapshot[]>([]);
  const [selectionItems, setSelectionItems] = useState<SelectionSnapshot[]>([]);
  const [activePanel, setActivePanel] = useState<CommercePanel>(null);
  const initRef = useRef(false);
  const lastTrackedPathRef = useRef<string>("");

  const syncSession = useCallback(
    async (landingPath: string) => {
      const anonymousId =
        readStorage<string | null>(storageKeys.anonymousId, null) ?? createAnonymousId();

      writeStorage(storageKeys.anonymousId, anonymousId);

      const params = new URLSearchParams(window.location.search);
      const response = await fetch("/api/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonymousId,
          landingPage: landingPath,
          deviceType: getDeviceType(),
          browser: navigator.userAgent,
          referrer: document.referrer || null,
          utmSource: params.get("utm_source"),
          utmMedium: params.get("utm_medium"),
          utmCampaign: params.get("utm_campaign"),
          country: null,
          city: null,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const payload = (await response.json()) as {
        anonymousId: string;
        sessionRef: string;
        leadRef: string | null;
        stage: LeadStage;
      };

      writeStorage(storageKeys.anonymousId, payload.anonymousId);
      writeStorage(storageKeys.sessionRef, payload.sessionRef);

      if (payload.leadRef) {
        writeStorage(storageKeys.leadRef, payload.leadRef);
      }

      const nextSession: SessionContext = {
        id: payload.sessionRef,
        anonymousId: payload.anonymousId,
        sessionRef: payload.sessionRef,
        leadRef: payload.leadRef,
        stage: payload.stage,
      };

      setSession(nextSession);
      return nextSession;
    },
    [],
  );

  const trackEvent = useCallback<CommerceContextValue["trackEvent"]>(
    async ({ eventName, eventSource, collectionSlug, productId, pagePath, metadata = {} }) => {
      const anonymousId =
        readStorage<string | null>(storageKeys.anonymousId, null) ?? createAnonymousId();
      const sessionRef = readStorage<string | null>(storageKeys.sessionRef, null);
      const leadRef = readStorage<string | null>(storageKeys.leadRef, null);

      posthog.capture(eventName, {
        anonymous_id: anonymousId,
        session_ref: sessionRef,
        lead_ref: leadRef,
        collection_slug: collectionSlug ?? null,
        product_id: productId ?? null,
        page_path: pagePath ?? pathname ?? null,
        current_stage: session?.stage ?? null,
        ...metadata,
      });

      await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonymousId,
          sessionRef,
          leadRef,
          eventName,
          eventSource,
          collectionSlug,
          productId,
          pagePath: pagePath ?? pathname ?? null,
          metadata,
        }),
      }).catch(() => null);
    },
    [pathname, session?.stage],
  );

  const applyMutationResponse = useCallback((payload: { sessionRef?: string; leadRef?: string | null; stage?: LeadStage }) => {
    if (payload.sessionRef) {
      writeStorage(storageKeys.sessionRef, payload.sessionRef);
    }

    if (payload.leadRef) {
      writeStorage(storageKeys.leadRef, payload.leadRef);
    }

    setSession((current) =>
      current
        ? {
            ...current,
            sessionRef: payload.sessionRef ?? current.sessionRef,
            leadRef: payload.leadRef ?? current.leadRef,
            stage: payload.stage ?? current.stage,
          }
        : current,
    );
  }, []);

  useEffect(() => {
    if (initRef.current) {
      return;
    }

    initRef.current = true;
    setWishlistItems(readStorage<ProductSnapshot[]>(storageKeys.wishlist, []));
    setSelectionItems(readStorage<SelectionSnapshot[]>(storageKeys.selections, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    writeStorage(storageKeys.wishlist, wishlistItems);
  }, [ready, wishlistItems]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    writeStorage(storageKeys.selections, selectionItems);
  }, [ready, selectionItems]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const search = typeof window !== "undefined" ? window.location.search : "";
    const path = `${pathname ?? "/"}${search}`;

    void syncSession(path).then((nextSession) => {
      if (!nextSession || lastTrackedPathRef.current === path) {
        return;
      }

      lastTrackedPathRef.current = path;

      void trackEvent({
        eventName: "page_view",
        eventSource: "site",
        pagePath: path,
        metadata: {
          device_type: getDeviceType(),
          session_ref: nextSession.sessionRef,
          lead_ref: nextSession.leadRef,
        },
      });
    });
  }, [pathname, ready, syncSession, trackEvent]);

  useEffect(() => {
    if (!ready || pathname !== "/") {
      return;
    }

    const anchor = window.sessionStorage.getItem("mallowmauve.returnAnchor");

    if (!anchor) {
      return;
    }

    window.sessionStorage.removeItem("mallowmauve.returnAnchor");

    window.requestAnimationFrame(() => {
      const target = document.getElementById(anchor);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [pathname, ready]);

  const isWishlisted = useCallback(
    (productId: string) => wishlistItems.some((item) => item.productId === productId),
    [wishlistItems],
  );

  const isSelected = useCallback(
    (productId: string) => selectionItems.some((item) => item.productId === productId),
    [selectionItems],
  );

  const toggleWishlist = useCallback<CommerceContextValue["toggleWishlist"]>(
    async (product) => {
      const anonymousId =
        readStorage<string | null>(storageKeys.anonymousId, null) ?? createAnonymousId();
      const exists = wishlistItems.some((item) => item.productId === product.productId);
      const nextItems = exists
        ? wishlistItems.filter((item) => item.productId !== product.productId)
        : [...wishlistItems, product];

      setWishlistItems(nextItems);

      const response = await fetch("/api/wishlist", {
        method: exists ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.productId,
          collectionSlug: product.collectionSlug,
          anonymousId,
        }),
      }).catch(() => null);

      if (!response?.ok) {
        setWishlistItems(wishlistItems);
        return !exists;
      }

      const payload = (await response.json()) as {
        sessionRef: string;
        leadRef: string | null;
        stage?: LeadStage;
      };
      applyMutationResponse(payload);

      await trackEvent({
        eventName: exists ? "remove_from_wishlist" : "add_to_wishlist",
        eventSource: "site",
        collectionSlug: product.collectionSlug,
        productId: product.productId,
        metadata: {
          product_name: product.name,
          price: product.price,
        },
      });

      return !exists;
    },
    [applyMutationResponse, trackEvent, wishlistItems],
  );

  const toggleSelection = useCallback<CommerceContextValue["toggleSelection"]>(
    async (product) => {
      const anonymousId =
        readStorage<string | null>(storageKeys.anonymousId, null) ?? createAnonymousId();
      const exists = selectionItems.some((item) => item.productId === product.productId);
      const nextItems = exists
        ? selectionItems.filter((item) => item.productId !== product.productId)
        : [...selectionItems, { ...product, quantity: 1 }];

      setSelectionItems(nextItems);

      const response = await fetch("/api/selections", {
        method: exists ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.productId,
          collectionSlug: product.collectionSlug,
          anonymousId,
          quantity: 1,
        }),
      }).catch(() => null);

      if (!response?.ok) {
        setSelectionItems(selectionItems);
        return !exists;
      }

      const payload = (await response.json()) as {
        sessionRef: string;
        leadRef: string | null;
        stage?: LeadStage;
      };
      applyMutationResponse(payload);

      await trackEvent({
        eventName: exists ? "remove_from_selections" : "add_to_selections",
        eventSource: "site",
        collectionSlug: product.collectionSlug,
        productId: product.productId,
        metadata: {
          product_name: product.name,
          price: product.price,
        },
      });

      return !exists;
    },
    [applyMutationResponse, selectionItems, trackEvent],
  );

  const removeWishlistItem = useCallback<CommerceContextValue["removeWishlistItem"]>(
    async (productId) => {
      const existing = wishlistItems.find((item) => item.productId === productId);

      if (!existing) {
        return;
      }

      await toggleWishlist(existing);
    },
    [toggleWishlist, wishlistItems],
  );

  const removeSelectionItem = useCallback<CommerceContextValue["removeSelectionItem"]>(
    async (productId) => {
      const existing = selectionItems.find((item) => item.productId === productId);

      if (!existing) {
        return;
      }

      await toggleSelection(existing);
    },
    [selectionItems, toggleSelection],
  );

  const moveWishlistItemToSelections = useCallback<CommerceContextValue["moveWishlistItemToSelections"]>(
    async (productId) => {
      const item = wishlistItems.find((entry) => entry.productId === productId);

      if (!item) {
        return;
      }

      if (!selectionItems.some((entry) => entry.productId === item.productId)) {
        await toggleSelection(item);
      }

      if (wishlistItems.some((entry) => entry.productId === item.productId)) {
        await toggleWishlist(item);
      }
    },
    [selectionItems, toggleSelection, toggleWishlist, wishlistItems],
  );

  const sendWhatsapp = useCallback(
    async (context: "intro" | "collection" | "selection" | "product", items: { productId: string }[], collectionSlug?: string | null) => {
      const anonymousId =
        readStorage<string | null>(storageKeys.anonymousId, null) ?? createAnonymousId();

      const response = await fetch("/api/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          anonymousId,
          items,
          context,
          collectionSlug: collectionSlug ?? null,
        }),
      }).catch(() => null);

      if (!response?.ok) {
        return;
      }

      const payload = (await response.json()) as {
        href: string;
        leadRef: string;
        sessionRef: string;
      };

      applyMutationResponse(payload);
      window.location.assign(payload.href);
    },
    [applyMutationResponse],
  );

  const sendIntroWhatsapp = useCallback<CommerceContextValue["sendIntroWhatsapp"]>(
    async (collectionSlug) => {
      await sendWhatsapp("intro", [], collectionSlug ?? null);
    },
    [sendWhatsapp],
  );

  const sendSelectionsWhatsapp = useCallback<CommerceContextValue["sendSelectionsWhatsapp"]>(
    async () => {
      if (selectionItems.length === 0) {
        await sendWhatsapp("intro", [], null);
        return;
      }

      await sendWhatsapp(
        "selection",
        selectionItems.map((item) => ({ productId: item.productId })),
        null,
      );
    },
    [selectionItems, sendWhatsapp],
  );

  const value = useMemo<CommerceContextValue>(
    () => ({
      ready,
      session,
      wishlistItems,
      selectionItems,
      wishlistCount: wishlistItems.length,
      selectionCount: selectionItems.length,
      activePanel,
      isWishlisted,
      isSelected,
      openPanel: (panel) => {
        setActivePanel(panel);
        void trackEvent({
          eventName: panel === "selections" ? "selections_view" : "wishlist_view",
          eventSource: "site",
          pagePath: pathname ?? "/",
        });
      },
      closePanel: () => setActivePanel(null),
      toggleWishlist,
      toggleSelection,
      moveWishlistItemToSelections,
      removeWishlistItem,
      removeSelectionItem,
      sendIntroWhatsapp,
      sendSelectionsWhatsapp,
      trackEvent,
    }),
    [
      activePanel,
      isSelected,
      isWishlisted,
      moveWishlistItemToSelections,
      pathname,
      ready,
      removeSelectionItem,
      removeWishlistItem,
      selectionItems,
      sendIntroWhatsapp,
      sendSelectionsWhatsapp,
      session,
      toggleSelection,
      toggleWishlist,
      trackEvent,
      wishlistItems,
    ],
  );

  return <CommerceContext.Provider value={value}>{children}</CommerceContext.Provider>;
};

export const useCommerce = () => {
  const context = useContext(CommerceContext);

  if (!context) {
    throw new Error("useCommerce must be used within CommerceProvider.");
  }

  return context;
};

export const toProductSnapshot = buildProductSnapshot;
