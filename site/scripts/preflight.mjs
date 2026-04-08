import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const cwd = process.cwd();

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return {};
  }

  const raw = readFileSync(filePath, "utf8");
  const entries = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      if (index === -1) {
        return null;
      }

      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      return [key, value];
    })
    .filter(Boolean);

  return Object.fromEntries(entries);
};

const envFromFile = {
  ...parseEnvFile(path.join(cwd, ".env.local")),
  ...parseEnvFile(path.join(cwd, ".env")),
};

const getEnv = (key) => process.env[key] || envFromFile[key] || "";

const requiredEnv = [
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "ADMIN_ALLOWED_EMAILS",
  "MALLOWMAUVE_WHATSAPP_NUMBER",
  "WHATSAPP_PREFILL_DEFAULT_MESSAGE",
  "NEXT_PUBLIC_APP_ENV",
];

const optionalEnv = ["NEXT_PUBLIC_POSTHOG_KEY", "NEXT_PUBLIC_POSTHOG_HOST"];

const missingEnv = requiredEnv.filter((key) => !getEnv(key));
const missingOptionalEnv = optionalEnv.filter((key) => !getEnv(key));

const collectionsPath = path.join(cwd, "src", "content", "collections.json");
const collections = JSON.parse(readFileSync(collectionsPath, "utf8"));
const missingAssets = [];

const normalizeAssetPath = (assetPath) =>
  assetPath.startsWith("/public/")
    ? assetPath.replace(/^\/public/, "")
    : assetPath;

for (const collection of collections) {
  for (const key of ["heroImageDesktop", "heroImageMobile"]) {
    const normalized = normalizeAssetPath(collection[key]);
    const absolute = path.join(cwd, "public", normalized.replace(/^\//, ""));
    if (!existsSync(absolute)) {
      missingAssets.push(`${collection.slug}.${key} -> ${absolute}`);
    }
  }

  const productFile = path.join(cwd, "src", "content", "products", `${collection.slug}.json`);
  if (!existsSync(productFile)) {
    missingAssets.push(`products.${collection.slug} -> ${productFile}`);
    continue;
  }

  const products = JSON.parse(readFileSync(productFile, "utf8"));
  for (const product of products) {
    for (const key of ["lifestyleImage", "studioImage"]) {
      const normalized = normalizeAssetPath(product[key]);
      const absolute = path.join(cwd, "public", normalized.replace(/^\//, ""));
      if (!existsSync(absolute)) {
        missingAssets.push(`${collection.slug}.${product.id}.${key} -> ${absolute}`);
      }
    }
  }
}

const craftVideo = path.join(cwd, "public", "media", "videos", "mallowmauve-craft.mp4");
if (!existsSync(craftVideo)) {
  missingAssets.push(`craftVideo -> ${craftVideo}`);
}

console.log("\nMallowMauve launch preflight\n");

if (missingEnv.length === 0) {
  console.log("Env check: OK");
} else {
  console.log("Env check: missing required values");
  for (const key of missingEnv) {
    console.log(`- ${key}`);
  }
}

if (missingOptionalEnv.length === 0) {
  console.log("Optional integrations: OK");
} else {
  console.log("Optional integrations: not configured");
  for (const key of missingOptionalEnv) {
    console.log(`- ${key}`);
  }
}

if (missingAssets.length === 0) {
  console.log("Asset mapping check: OK");
} else {
  console.log("Asset mapping check: missing mapped files");
  for (const item of missingAssets) {
    console.log(`- ${item}`);
  }
}

if (missingEnv.length || missingAssets.length) {
  process.exitCode = 1;
} else {
  console.log("\nPreflight passed.");
}
