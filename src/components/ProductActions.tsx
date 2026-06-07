"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Product } from "@/lib/products";
import { getProductName, getProductImage } from "@/lib/product-display";
import { useCart } from "@/context/CartContext";
import type { Locale } from "@/i18n/routing";
import AddToCartButton from "./AddToCartButton";

export default function ProductActions({ product, color }: { product: Product; color?: string }) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const { addItem, openCart } = useCart();

  function buyNow() {
    addItem({
      code: product.code,
      name: getProductName(product, locale),
      image: getProductImage(product),
      price: product.price ?? 0,
      color,
    });
    openCart();
  }

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <AddToCartButton product={product} color={color} />
      <button type="button" onClick={buyNow} className="btn-secondary min-h-[44px]">
        {t("buyNow")}
      </button>
    </div>
  );
}
