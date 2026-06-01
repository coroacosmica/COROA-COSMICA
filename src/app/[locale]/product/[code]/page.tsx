import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductBackLink from "@/components/ProductBackLink";
import ProductImage from "@/components/ProductImage";
import ProductLogoViewer from "@/components/ProductLogoViewer";
import ProductActions from "@/components/ProductActions";
import { getProductByCode, getRelatedProducts } from "@/lib/products";
import { getProductName } from "@/lib/product-display";
import { formatPrice, BASE_PRICE } from "@/lib/currency";
import type { Locale } from "@/i18n/routing";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("product");
  const tc = await getTranslations("catalogue");

  const product = getProductByCode(decodeURIComponent(code));
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const displayName = getProductName(product, locale as Locale);
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-shop bg-white px-4 py-8 md:px-6 md:py-12">
      <Suspense fallback={<span className="text-sm text-neutral-400">…</span>}>
        <ProductBackLink />
      </Suspense>

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="group relative aspect-square min-h-[320px] overflow-hidden border border-olive-200 bg-neutral-50 lg:min-h-[480px]">
            <ProductImage
              product={product}
              priority
              className="image-zoom object-contain p-4 md:p-8"
              sizes="(max-width: 1024px) 100vw, 800px"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-olive-600">
            {tc(product.category as "vip-sets")}
          </p>
          <h1 className="mt-2 font-display text-3xl font-light text-olive-950 md:text-4xl">
            {displayName}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {tc("code")}: {product.code}
          </p>
          <p className="mt-4 text-2xl font-semibold text-olive-700">
            {formatPrice(BASE_PRICE, loc)}
          </p>
          {product.description && product.description !== displayName && (
            <p className="mt-4 text-neutral-700">{product.description}</p>
          )}
          <p className="mt-2 text-sm text-neutral-500">{t("minOrder")}</p>

          {product.includes.length > 0 && (
            <div className="mt-6 card border-olive-200 p-5">
              <h2 className="font-semibold text-olive-900">{tc("includes")}:</h2>
              <ul className="mt-3 space-y-1.5">
                {product.includes.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-neutral-700">
                    <span className="text-accent-green">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <ProductActions product={product} />
        </div>
      </div>

      <ProductLogoViewer product={product} productName={displayName} />

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title text-xl">{t("related")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {related.map((p) => (
              <ProductCard key={p.code} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
