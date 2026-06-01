"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { formatPrice, BASE_PRICE } from "@/lib/currency";
import type { Locale } from "@/i18n/routing";
import { buildCartMessage, whatsappLink, mailtoLink } from "@/lib/checkout";
import { WHATSAPP_NUMBERS } from "@/lib/brand";
import { useState } from "react";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const tc = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, count } = useCart();
  const [showWhatsAppPicker, setShowWhatsAppPicker] = useState(false);

  if (!isOpen) return null;

  const message = buildCartMessage(items, locale, (key, values) =>
    tc(key as "greeting", values as Record<string, string>)
  );

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={closeCart}
        aria-label="Close cart"
      />
      <aside
        className="fixed end-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between border-b border-olive-200 bg-olive-600 px-4 py-4 text-white">
          <h2 className="text-lg font-semibold">
            {t("title")} ({count})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded hover:bg-white/10"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-neutral-500">{t("empty")}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.code}
                  className="flex gap-3 border border-olive-100 bg-white p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 bg-neutral-50">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                      quality={95}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.code}</p>
                    <p className="mt-1 text-sm font-semibold text-olive-700">
                      {formatPrice(item.quantity * BASE_PRICE, locale)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center border border-olive-200 text-lg"
                        onClick={() => updateQuantity(item.code, item.quantity - 1)}
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center border border-olive-200 text-lg"
                        onClick={() => updateQuantity(item.code, item.quantity + 1)}
                        aria-label="+"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ms-auto text-xs text-red-600 hover:underline"
                        onClick={() => removeItem(item.code)}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-olive-200 bg-neutral-50 p-4">
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span>{t("total")}</span>
              <span className="text-olive-700">{formatPrice(total, locale)}</span>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {t("checkout")}
            </p>

            {showWhatsAppPicker ? (
              <div className="mb-3 space-y-2">
                <p className="text-xs text-neutral-600">{t("selectWhatsApp")}</p>
                {WHATSAPP_NUMBERS.map((w) => (
                  <a
                    key={w.number}
                    href={whatsappLink(w.number, message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center gap-2 rounded bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    📱 {w.label}: {w.number}
                  </a>
                ))}
                <button
                  type="button"
                  className="text-xs text-neutral-500 underline"
                  onClick={() => setShowWhatsAppPicker(false)}
                >
                  ←
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowWhatsAppPicker(true)}
                className="btn-primary mb-2 w-full min-h-[44px] bg-[#25D366] hover:bg-[#20bd5a]"
              >
                📱 {t("whatsapp")}
              </button>
            )}

            <a
              href={mailtoLink(tc("emailSubject"), message)}
              className="btn-secondary flex min-h-[44px] w-full items-center justify-center border-olive-600 text-olive-800"
            >
              📧 {t("email")}
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
