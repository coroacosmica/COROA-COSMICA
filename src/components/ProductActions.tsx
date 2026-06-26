"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Product } from "@/lib/products";
import { getProductName, getProductImage } from "@/lib/product-display";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { Locale } from "@/i18n/routing";
import AddToCartButton from "./AddToCartButton";

export default function ProductActions({ product, color }: { product: Product; color?: string }) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const { addItem, openCart } = useCart();

  const { calculateDiscountedPrice } = useCurrency();

  function buyNow() {
    addItem({
      code: product.code,
      name: getProductName(product, locale),
      image: getProductImage(product),
      basePrice: product.price ?? 0,
      prices: product.prices,
      price: calculateDiscountedPrice(product), // keep for legacy support
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
