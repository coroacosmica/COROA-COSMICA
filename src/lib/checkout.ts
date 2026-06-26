import type { Locale } from "@/i18n/routing";
import type { CartItem } from "./cart";
import { formatPrice, BASE_PRICE } from "./currency";
import { CONTACT_EMAIL } from "./brand";

function linePrice(locale: Locale, qty: number): string {
  return formatPrice(BASE_PRICE * qty, locale);
}

export function buildCartMessage(
  items: CartItem[],
  currencyState: { getRawPrice: (p: any) => number, formatLocalPrice: (v: number) => string },
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const lines = items.map(
    (item) => {
      const p = item.basePrice !== undefined ? currencyState.getRawPrice({ price: item.basePrice, prices: item.prices }) : (item.price ?? 0);
      return `- ${item.name} x${item.quantity} — ${currencyState.formatLocalPrice(item.quantity * p)}`;
    }
  );
  const total = currencyState.formatLocalPrice(
    items.reduce((s, i) => {
      const p = i.basePrice !== undefined ? currencyState.getRawPrice({ price: i.basePrice, prices: i.prices }) : (i.price ?? 0);
      return s + (p * i.quantity);
    }, 0)
  );
  return `${t("greeting")}

${t("orderIntro")}
${lines.join("\n")}

${t("total", { total })}
${t("confirm")}`;
}

export function buildSampleRequestMessage(
  productName: string,
  productCode: string,
  locale: Locale,
  t: (key: string) => string
): string {
  return `${t("greeting")}

${t("sampleIntro")}
${t("product")}: ${productName} (${productCode})
${t("sampleNote")}`;
}

export function whatsappLink(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function mailtoLink(subject: string, body: string): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
