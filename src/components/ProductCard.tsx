"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/lib/products";
import { getProductName } from "@/lib/product-display";
import { formatPrice, BASE_PRICE } from "@/lib/currency";
import { slugifyCode } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";
import { clsx } from "clsx";

export default function ProductCard({
  product,
  catalogueReturnTo,
  listView = false,
}: {
  product: Product;
  catalogueReturnTo?: string;
  listView?: boolean;
}) {
  const tc = useTranslations("categories");
  const tcat = useTranslations("catalogue");
  const locale = useLocale() as Locale;
  const categoryLabel = tc(product.category as "vip-sets");
  const displayName = getProductName(product, locale);
  const returnParam = catalogueReturnTo
    ? `?returnTo=${encodeURIComponent(catalogueReturnTo)}`
    : "";

  if (listView) {
    return (
      <article className="product-card flex flex-col gap-4 p-4 sm:flex-row">
        <Link
          href={`/product/${slugifyCode(product.code)}${returnParam}`}
          className="relative aspect-square w-full shrink-0 overflow-hidden bg-neutral-50 sm:h-40 sm:w-40"
        >
          <ProductImage
            product={product}
            className="image-zoom object-contain p-4"
            sizes="160px"
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <Link href={`/product/${slugifyCode(product.code)}${returnParam}`}>
              <h3 className="font-medium text-neutral-900">{displayName}</h3>
            </Link>
            <p className="mt-1 text-xs uppercase tracking-wider text-olive-600">{categoryLabel}</p>
            <p className="mt-2 text-lg font-semibold text-olive-700">
              {formatPrice(product.price ?? 0, locale)}
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <AddToCartButton product={product} variant="compact" className="flex-1 sm:flex-none sm:min-w-[140px]" />
            <Link
              href={`/product/${slugifyCode(product.code)}${returnParam}`}
              className="btn-secondary min-h-[44px] flex-1 text-center sm:flex-none sm:min-w-[120px]"
            >
              {tcat("viewDetails")}
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="product-card group flex flex-col overflow-hidden">
      <Link href={`/product/${slugifyCode(product.code)}${returnParam}`} className="block">
        <div className="relative aspect-square min-h-[200px] overflow-hidden bg-neutral-50 md:min-h-[280px]">
          <ProductImage
            product={product}
            className="image-zoom object-cover object-center p-2"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          <span className="absolute bottom-2 start-2 rounded bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-olive-700">
            {categoryLabel}
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3 md:p-4">
        <Link href={`/product/${slugifyCode(product.code)}${returnParam}`}>
          <h3 className="line-clamp-2 text-sm font-medium text-neutral-900">{displayName}</h3>
        </Link>
        <p className="mt-1 text-lg font-semibold text-olive-700">{formatPrice(product.price ?? 0, locale)}</p>
        <div className={clsx("mt-3 flex flex-col gap-2")}>
          <AddToCartButton product={product} variant="compact" />
          <Link
            href={`/product/${slugifyCode(product.code)}${returnParam}`}
            className="block min-h-[44px] border border-olive-300 py-2 text-center text-xs font-semibold uppercase text-olive-700 hover:border-accent-orange hover:text-accent-orange"
          >
            {tcat("quickView")}
          </Link>
        </div>
      </div>
    </article>
  );
}
