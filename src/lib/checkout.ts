import type { Locale } from "@/i18n/routing";
import type { CartItem } from "./cart";
import { formatPrice, BASE_PRICE } from "./currency";
import { CONTACT_EMAIL } from "./brand";

function linePrice(locale: Locale, qty: number): string {
  return formatPrice(BASE_PRICE * qty, locale);
}

export function buildCartMessage(
  items: CartItem[],
  locale: Locale,
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const lines = items.map(
    (item) =>
      `- ${item.name} x${item.quantity} — ${linePrice(locale, item.quantity)}`
  );
  const total = formatPrice(
    BASE_PRICE * items.reduce((s, i) => s + i.quantity, 0),
    locale
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
