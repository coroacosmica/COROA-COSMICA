import type { Locale } from "@/i18n/routing";
import { LOCALE_META, type CurrencyCode } from "./locales";

const SYMBOLS: Record<CurrencyCode, { prefix: string; suffix?: string; space?: boolean }> = {
  EUR: { prefix: "€", space: false },
  USD: { prefix: "$", space: false },
  EGP: { prefix: "ج.م", space: true },
  SAR: { prefix: "ر.س", space: true },
  BRL: { prefix: "R$", space: true },
  PLN: { prefix: "zł", space: true },
  RON: { prefix: "lei", space: true },
};

export const BASE_PRICE = 1;

export function getCurrencyForLocale(locale: Locale): CurrencyCode {
  return LOCALE_META[locale]?.currency ?? "EUR";
}

export function formatPrice(amount: number, locale: Locale): string {
  const currency = getCurrencyForLocale(locale);
  const sym = SYMBOLS[currency];
  const formatted = amount.toFixed(2);
  if (sym.space) return `${sym.prefix} ${formatted}`;
  return `${sym.prefix}${formatted}`;
}

/** Get the right price for a product based on the user's locale/currency */
export function getProductPrice(
  product: { price?: number; prices?: Record<string, number> },
  locale: Locale
): number {
  const currency = getCurrencyForLocale(locale);
  // If the product has per-currency prices, use them
  if (product.prices && typeof product.prices[currency] === "number") {
    return product.prices[currency];
  }
  // Fallback to the single price field (treated as USD)
  return product.price ?? 0;
}

/** Format a product's price for a given locale (picks right currency automatically) */
export function formatProductPrice(
  product: { price?: number; prices?: Record<string, number> },
  locale: Locale
): string {
  const amount = getProductPrice(product, locale);
  return formatPrice(amount, locale);
}

