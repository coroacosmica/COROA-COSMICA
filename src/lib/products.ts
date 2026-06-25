import { supabase } from "@/lib/supabase";
import rawProducts from "@/data/products.json";
import { normalizeProductCode } from "@/lib/utils";

export interface ProductNames {
  pt: string;
  en: string;
  ar: string;
  fr?: string;
  pt_br?: string;
}

export interface Product {
  id?: number;
  code: string;
  description: string;
  includes?: string[];
  type?: "product" | "set";
  catalogue?: string;
  category: string;
  category_name?: string;
  categoryName?: string;
  names?: ProductNames;
  image?: string | null;
  images?: string[];
  featured?: boolean;
  tags?: string[];
  is_active?: boolean;
  price?: number;
  prices?: Record<string, number>;
  discount_percentage?: number;
  variants?: { color: string; hex?: string; image?: string; price?: number }[];
}

export interface Category {
  id: number;
  slug: string;
  name_en: string;
  name_ar: string;
  name_pt: string;
  order_index: number;
}

const CATEGORY_ORDER = [
  "flash-drives",
  "power-banks",
  "lamps-mobile-holders",
  "cables-car-chargers",
  "speakers-audio",
  "mice-mouse-pads",
  "notebooks-sets",
  "smart-folders",
  "memo-pads-calendars",
  "card-holders-wallets",
  "keychains",
  "elegant-pens",
  "pen-sets",
  "pen-boxes",
  "plastic-pens",
  "clocks",
  "tool-kits",
  "mugs-flasks",
  "cork-products",
  "bags",
  "general-summer",
  // GFM - Indoor Printing
  "gfm-indoor-printing",
  "gfm-business-cards",
  "gfm-flyers",
  "gfm-brochures",
  "gfm-books",
  "gfm-boxes-bags",
  "gfm-invitation-cards",
  "gfm-certificates",
  // GFM - Events & Conferences
  "gfm-events-conferences",
  "gfm-rollup-banners",
  "gfm-popup-stands",
  "gfm-conference-stands",
  "gfm-feather-flags",
  "gfm-event-flags",
  "gfm-id-cards",
  // GFM - Outdoor Printing
  "gfm-outdoor-printing",
  "gfm-outdoor-signage",
  "gfm-building-facades",
  "gfm-shop-fronts",
  "gfm-billboards",
  "gfm-outdoor-banners",
  "gfm-vehicle-branding",
  "gfm-wayfinding",
  // GFM - Geographic & Office Solutions
  "gfm-geographic-office",
  "gfm-office-signs",
  "gfm-directional-signs",
  "gfm-name-plates",
  "gfm-rubber-stamps",
  "gfm-company-stamps",
  "gfm-custom-seals",
];

// Parent category → child categories mapping for GFM sections
export const GFM_PARENT_CATEGORIES: Record<string, string[]> = {
  "gfm-indoor-printing": [
    "gfm-business-cards", "gfm-flyers", "gfm-brochures", "gfm-books",
    "gfm-boxes-bags", "gfm-invitation-cards", "gfm-certificates",
  ],
  "gfm-events-conferences": [
    "gfm-rollup-banners", "gfm-popup-stands", "gfm-conference-stands",
    "gfm-feather-flags", "gfm-event-flags", "gfm-id-cards",
  ],
  "gfm-outdoor-printing": [
    "gfm-outdoor-signage", "gfm-building-facades", "gfm-shop-fronts",
    "gfm-billboards", "gfm-outdoor-banners", "gfm-vehicle-branding", "gfm-wayfinding",
  ],
  "gfm-geographic-office": [
    "gfm-office-signs", "gfm-directional-signs", "gfm-name-plates",
    "gfm-rubber-stamps", "gfm-company-stamps", "gfm-custom-seals",
  ],
};


function enrich(p: any): Product {
  const code = normalizeProductCode(p.code).toLowerCase();

  const normalized: Product = {
    ...p,
    code: normalizeProductCode(p.code),
    categoryName: p.category_name || p.categoryName || "",
    images: p.images || (p.image ? [p.image] : []),
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
    console.log("[getAllProducts] Supabase response:", { count: data?.length, error: error?.message });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map(enrich);
    }
  } catch (err) {
    console.error("Supabase products fetch error, falling back to local JSON", err);
  }

  // Fallback to local JSON if Supabase fails or is empty
  console.log("[getAllProducts] Using local JSON fallback, count:", (rawProducts as any[]).length);
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

export async function getAllCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("order_index", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return data as Category[];
    }
  } catch (err) {
    console.error("Supabase categories fetch error", err);
  }

  // Return fallback based on hardcoded CATEGORY_ORDER if db is empty/error
  return CATEGORY_ORDER.map((slug, i) => ({
    id: i,
    slug,
    name_en: slug,
    name_ar: slug,
    name_pt: slug,
    order_index: i
  }));
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

