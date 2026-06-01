"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import type { Locale } from "@/i18n/routing";

export default function MobileCartBar() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const { count, total, openCart } = useCart();

  if (count === 0) return null;

  return (
    <div className="fixed bottom-0 start-0 end-0 z-40 flex items-center justify-between gap-4 border-t border-olive-200 bg-white px-4 py-3 shadow-lg lg:hidden">
      <button
        type="button"
        onClick={openCart}
        className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded bg-olive-600 px-4 text-sm font-semibold text-white"
      >
        {t("title")} ({count}) — {formatPrice(total, locale)}
      </button>
    </div>
  );
}
