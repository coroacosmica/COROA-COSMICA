import type { Product } from "./products";
import type { Locale } from "@/i18n/routing";

const PLACEHOLDERS: Record<string, string> = {
  "vip-sets": "/images/placeholders/vip.svg",
  "cork-eco": "/images/placeholders/cork.svg",
  "notebooks-premium": "/images/placeholders/notebook.svg",
  "notebooks-usb": "/images/placeholders/notebook.svg",
  "tech-gifts": "/images/placeholders/tech.svg",
  default: "/images/placeholders/gift.svg",
};

function nameLocaleKey(locale: Locale): string {
  if (locale === "ar" || locale === "ar-eg" || locale === "ar-sa") return "ar";
  if (locale === "pt-br") return "pt_br";
  if (locale === "pt") return "pt";
  if (locale === "fr") return "fr";
  return "en";
}

export function getProductName(product: Product, locale: Locale): string {
  const names = product.names as Record<string, string>;
  const key = nameLocaleKey(locale);
  if (names?.[key]) return names[key];
  if (names?.en) return names.en;
  if (names?.pt) return names.pt;
  return product.description || product.code;
}

export function getProductImage(product: Product): string {
  if (product.image) return product.image;
  return PLACEHOLDERS[product.category] ?? PLACEHOLDERS.default;
}
