"use client";

import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import type { Product } from "@/lib/products";
import type { Locale } from "@/i18n/routing";
import { clsx } from "clsx";

export default function AddToCartButton({
  product,
  className,
  variant = "primary",
  color,
}: {
  product: Product;
  className?: string;
  variant?: "primary" | "secondary" | "compact";
  color?: string;
}) {
  const t = useTranslations("catalogue");
  const locale = useLocale() as Locale;
  const { addItem } = useCart();
  const { calculateDiscountedPrice } = useCurrency();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      code: product.code,
      name: product.names?.[locale as keyof typeof product.names] || product.description,
      image: product.image || "/images/placeholder.jpg",
      basePrice: product.price ?? 0,
      prices: product.prices,
      price: calculateDiscountedPrice(product), // keep for legacy support
      category: product.category,
      color,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "compact" &&
          "min-h-[44px] w-full bg-olive-600 px-3 py-2 text-xs font-semibold uppercase text-white hover:bg-accent-orange",
        className
      )}
    >
      {t("addToCart")}
    </button>
  );
}
