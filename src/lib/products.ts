import { supabase } from "@/lib/supabase";
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
  price?: number;
  prices?: Record<string, number>;
  variants?: { color: string; hex: string; image: string }[];
}

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

function enrich(p: any): Product {
  const code = normalizeProductCode(p.code).toLowerCase();
  
  const normalized: Product = { 
    ...p, 
    code: normalizeProductCode(p.code),
    categoryName: p.category_name || p.categoryName || "",
  };
  const tags: string[] = [...(p.tags || [])];
  if (p.type === "set" && !tags.includes("set")) tags.push("set");
  if ((code.includes("vip") || code.includes("premium") || p.category === "vip-sets") && !tags.includes("vip"))
    tags.push("vip", "featured");
  if ((code.includes("cork") || p.category === "cork-eco") && !tags.includes("cork")) 
    tags.push("cork", "eco", "featured");
  if (normalized.includes?.length > 0 && !tags.includes("bundle")) 
    tags.push("bundle");
  
  return { ...normalized, tags };
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(enrich);
    }
  } catch (err) {
    console.error("Supabase products fetch error, falling back to local JSON", err);
  }
  
  // Fallback to local JSON if Supabase fails
  return (rawProducts as any[]).map(enrich);
}

export async function getProductByCode(code: string): Promise<Product | undefined> {
  const all = await getAllProducts();
  let raw = code;
  try {
    raw = decodeURIComponent(code);
  } catch {
    raw = code;
  }
  try {
    raw = decodeURIComponent(raw);
  } catch {
    //
  }
  const norm = normalizeProductCode(raw).toLowerCase();
  return all.find((p) => p.code.toLowerCase() === norm);
}

export async function getFeaturedProducts(limit = 12): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter((p) => p.tags?.includes("featured") || p.type === "set")
    .slice(0, limit);
}

export async function getVipSets(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(
    (p) => p.category === "vip-sets" || p.tags?.includes("vip")
  );
}

export async function getCorkProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(
    (p) =>
      p.category === "cork-eco" ||
      p.code.toLowerCase().includes("cork") ||
      p.tags?.includes("cork")
  );
}

export async function getCategories(): Promise<string[]> {
  const all = await getAllProducts();
  const cats = new Set(all.map((p) => p.category));
  return CATEGORY_ORDER.filter((c) => cats.has(c)).concat(
    [...cats].filter((c) => !CATEGORY_ORDER.includes(c))
  );
}

export async function searchProducts(opts: {
  query?: string;
  category?: string;
  setsOnly?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number }> {
  const all = await getAllProducts();
  const { query = "", category, setsOnly, page = 1, pageSize = 24 } = opts;
  const q = query.toLowerCase().trim();

  let filtered = all;
  if (category && category !== "all") {
    filtered = filtered.filter((p) => p.category === category);
  }
  if (setsOnly) {
    filtered = filtered.filter((p) => p.type === "set" || p.includes?.length > 0);
  }
  if (q) {
    filtered = filtered.filter((p) => {
      const names = [p.names?.pt, p.names?.en, p.names?.ar].filter(Boolean).join(" ");
      return (
        p.code.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        names.toLowerCase().includes(q) ||
        p.includes?.some((i) => i.toLowerCase().includes(q))
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

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const all = await getAllProducts();
  return all
    .filter(
      (p) =>
        p.code !== product.code &&
        (p.category === product.category || p.type === product.type)
    )
    .slice(0, limit);
}

export const CATEGORY_IDS = CATEGORY_ORDER;

