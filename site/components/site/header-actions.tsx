"use client";

import Link from "next/link";

import { useCommerce } from "@/components/providers/commerce-provider";

export const HeaderActions = () => {
  const {
    activePanel,
    closePanel,
    moveWishlistItemToSelections,
    openPanel,
    removeSelectionItem,
    removeWishlistItem,
    selectionCount,
    selectionItems,
    sendSelectionsWhatsapp,
    wishlistCount,
    wishlistItems,
  } = useCommerce();

  return (
    <>
      <div className="header-actions">
        <button className="wishlist-nav" type="button" onClick={() => openPanel("wishlist")}>
          <span>Wishlist</span>
          <span className="wishlist-count">({wishlistCount})</span>
        </button>
        <button className="selections-nav" type="button" onClick={() => openPanel("selections")}>
          <span>Selections</span>
          <span className="selections-count">({selectionCount})</span>
        </button>
      </div>

      <div className={`commerce-drawer${activePanel ? " is-open" : ""}`} aria-hidden={activePanel ? "false" : "true"}>
        <button
          className={`commerce-drawer__backdrop${activePanel ? " is-open" : ""}`}
          type="button"
          onClick={closePanel}
          aria-label="Close panel"
        />
        <aside className={`commerce-drawer__panel${activePanel ? " is-open" : ""}`}>
          <div className="commerce-drawer__header">
            <div className="commerce-drawer__tabs" role="tablist" aria-label="Private lists">
              <button
                className={`commerce-drawer__tab${activePanel === "wishlist" ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activePanel === "wishlist"}
                onClick={() => openPanel("wishlist")}
              >
                Wishlist
              </button>
              <button
                className={`commerce-drawer__tab${activePanel === "selections" ? " is-active" : ""}`}
                type="button"
                role="tab"
                aria-selected={activePanel === "selections"}
                onClick={() => openPanel("selections")}
              >
                Selections
              </button>
            </div>
            <button className="commerce-drawer__close" type="button" onClick={closePanel}>
              Close
            </button>
          </div>

          <div className="commerce-drawer__body">
            {activePanel === "wishlist" ? (
              <>
                <p className="eyebrow">Saved for later</p>
                <h2>A quieter shortlist to return to.</h2>
                {wishlistItems.length === 0 ? (
                  <p className="commerce-drawer__empty">No pieces have been saved to Wishlist yet.</p>
                ) : (
                  <div className="commerce-drawer__list">
                    {wishlistItems.map((item) => (
                      <article key={item.productId} className="commerce-drawer__item">
                        <Link
                          className="commerce-drawer__item-media"
                          href={`/products/${item.collectionSlug}/${item.productId}`}
                          onClick={closePanel}
                        >
                          <img src={item.lifestyleImage} alt={`${item.name} ${item.variant}`} />
                        </Link>
                        <div className="commerce-drawer__item-copy">
                          <p className="commerce-drawer__item-name">{item.name}</p>
                          <p className="commerce-drawer__item-variant">{item.variant}</p>
                          <div className="commerce-drawer__item-actions">
                            <button type="button" className="text-action" onClick={() => moveWishlistItemToSelections(item.productId)}>
                              Move to Selections
                            </button>
                            <button
                              type="button"
                              className="text-action text-action-muted"
                              onClick={() => removeWishlistItem(item.productId, item.collectionSlug)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="eyebrow">Private selection</p>
                <h2>Selections gather quietly. Requests begin personally.</h2>
                {selectionItems.length === 0 ? (
                  <p className="commerce-drawer__empty">
                    No pieces have been added to Selections yet.
                  </p>
                ) : (
                  <div className="commerce-drawer__list">
                    {selectionItems.map((item) => (
                      <article key={item.productId} className="commerce-drawer__item">
                        <Link
                          className="commerce-drawer__item-media"
                          href={`/products/${item.collectionSlug}/${item.productId}`}
                          onClick={closePanel}
                        >
                          <img src={item.lifestyleImage} alt={`${item.name} ${item.variant}`} />
                        </Link>
                        <div className="commerce-drawer__item-copy">
                          <p className="commerce-drawer__item-name">{item.name}</p>
                          <p className="commerce-drawer__item-variant">{item.variant}</p>
                          <p className="commerce-drawer__item-quantity">
                            {item.quantity} piece{item.quantity > 1 ? "s" : ""}
                          </p>
                          <div className="commerce-drawer__item-actions">
                            <button
                              type="button"
                              className="text-action text-action-muted"
                              onClick={() => removeSelectionItem(item.productId, item.collectionSlug)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="commerce-drawer__footer">
            <button className="button button-filled" type="button" onClick={() => void sendSelectionsWhatsapp()}>
              Send Request via WhatsApp
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};
