import { readFile } from "node:fs/promises";
import path from "node:path";

import type { CollectionContent, ProductContent } from "@/types/domain";

const contentRoot = path.join(process.cwd(), "src", "content");
const normalizeAssetPath = (value: string) =>
  value.startsWith("/public/") ? value.replace(/^\/public/, "") : value;

const readJson = async <T>(filePath: string) => {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
};

export const getCollections = async () => {
  const collections = await readJson<CollectionContent[]>(
    path.join(contentRoot, "collections.json"),
  );

  return [...collections]
    .map((collection) => ({
      ...collection,
      heroImageDesktop: normalizeAssetPath(collection.heroImageDesktop),
      heroImageMobile: normalizeAssetPath(collection.heroImageMobile),
    }))
    .sort((a, b) => a.order - b.order);
};

export const getCollectionBySlug = async (slug: string) => {
  const collections = await getCollections();
  return collections.find((collection) => collection.slug === slug) ?? null;
};

export const getProductsByCollection = async (slug: string) => {
  const products = await readJson<ProductContent[]>(
    path.join(contentRoot, "products", `${slug}.json`),
  );

  return products
    .filter((product) => product.collectionSlug === slug && product.status !== "archived")
    .map((product) => ({
      ...product,
      lifestyleImage: normalizeAssetPath(product.lifestyleImage),
      studioImage: normalizeAssetPath(product.studioImage),
    }))
    .sort((a, b) => a.order - b.order);
};

export const getProductById = async (collectionSlug: string, productId: string) => {
  const products = await getProductsByCollection(collectionSlug);
  return products.find((product) => product.id === productId) ?? null;
};

export const getAllProducts = async () => {
  const collections = await getCollections();
  const allProducts = await Promise.all(
    collections.map(async (collection) => getProductsByCollection(collection.slug)),
  );

  return allProducts.flat();
};
