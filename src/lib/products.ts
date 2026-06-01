import rawProducts from "@/data/products.json";
import { normalizeProductCode } from "@/lib/utils";
export interface ProductNames {
  pt: string;
  en: string;
  ar: string;
}

export interface Product {
  code: string;
  description: string;
  includes: string[];
  type: "product" | "set";
  catalogue: string;
  category: string;
  categoryName: string;
  names?: ProductNames;
  image?: string | null;
  featured?: boolean;
  tags?: string[];
}

const products = rawProducts as Product[];

const CATEGORY_ORDER = [
  "vip-sets",
  "cork-eco",
  "notebooks-premium",
  "notebooks-usb",
  "tech-gifts",
  "business-gifts",
  "corporate-sets",
  "promotional",
  "pens-writing",
  "accessories",
  "seasonal",
  "general",
];

function enrich(p: Product): Product {
  const code = normalizeProductCode(p.code).toLowerCase();
  const normalized: Product = { ...p, code: normalizeProductCode(p.code) };
  const tags: string[] = [];
  if (p.type === "set") tags.push("set");
  if (code.includes("vip") || code.includes("premium") || p.category === "vip-sets")
    tags.push("vip", "featured");
  if (code.includes("cork") || p.category === "cork-eco") tags.push("cork", "eco", "featured");
  if (normalized.includes.length > 0) tags.push("bundle");
  return { ...normalized, tags };
}

const enriched = products.map(enrich);

export function getAllProducts(): Product[] {
  return enriched;
}

export function getProductByCode(code: string): Product | undefined {
  let raw = code;
  try {
    raw = decodeURIComponent(code);
  } catch {
    raw = code;
  }
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* once decoded */
  }
  const norm = normalizeProductCode(raw).toLowerCase();
  return enriched.find((p) => p.code.toLowerCase() === norm);
}

export function getFeaturedProducts(limit = 12): Product[] {
  return enriched
    .filter((p) => p.tags?.includes("featured") || p.type === "set")
    .slice(0, limit);
}

export function getVipSets(): Product[] {
  return enriched.filter(
    (p) => p.category === "vip-sets" || p.tags?.includes("vip")
  );
}

export function getCorkProducts(): Product[] {
  return enriched.filter(
    (p) =>
      p.category === "cork-eco" ||
      p.code.toLowerCase().includes("cork") ||
      p.tags?.includes("cork")
  );
}

export function getCategories(): string[] {
  const cats = new Set(enriched.map((p) => p.category));
  return CATEGORY_ORDER.filter((c) => cats.has(c)).concat(
    [...cats].filter((c) => !CATEGORY_ORDER.includes(c))
  );
}

export function searchProducts(opts: {
  query?: string;
  category?: string;
  setsOnly?: boolean;
  page?: number;
  pageSize?: number;
}): { items: Product[]; total: number } {
  const { query = "", category, setsOnly, page = 1, pageSize = 24 } = opts;
  const q = query.toLowerCase().trim();

  let filtered = enriched;
  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (setsOnly) {
    filtered = filtered.filter((p) => p.type === "set" || p.includes.length > 0);
  }
  if (q) {
    filtered = filtered.filter((p) => {
      const names = [p.names?.pt, p.names?.en, p.names?.ar].filter(Boolean).join(" ");
      return (
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        names.toLowerCase().includes(q) ||
        p.includes.some((i) => i.toLowerCase().includes(q))
      );
    });
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  return {
    items: filtered.slice(start, start + pageSize),
    total,
  };
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return enriched
    .filter(
      (p) =>
        p.code !== product.code &&
        (p.category === product.category || p.type === product.type)
    )
    .slice(0, limit);
}

export const CATEGORY_IDS = CATEGORY_ORDER;
