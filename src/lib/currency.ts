import type { Locale } from "@/i18n/routing";
import { LOCALE_META, type CurrencyCode } from "./locales";

const SYMBOLS: Record<CurrencyCode, { prefix: string; suffix?: string; space?: boolean }> = {
  EUR: { prefix: "€", space: false },
  USD: { prefix: "$", space: false },
  EGP: { prefix: "ج.م", space: true },
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
  if (currency === "EUR") return `${sym.prefix}${formatted}`;
  return `${sym.prefix}${formatted}`;
}
