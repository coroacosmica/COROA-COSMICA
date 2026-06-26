export interface CartItem {
  code: string;
  name: string;
  image: string;
  quantity: number;
  basePrice: number;
  prices?: Record<string, number>;
  price?: number; // legacy
  color?: string;
  category?: string;
  bundleItems?: { code: string; name: string; quantity: number }[];
  customDesign?: {
    pngDataUrl: string;
    stateJson: string;
  };
}

export const CART_STORAGE_KEY = "coroacosmica-cart";

export function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCartToStorage(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export const LOCALE_STORAGE_KEY = "coroacosmica-locale-picked";
