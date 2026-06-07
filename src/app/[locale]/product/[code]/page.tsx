import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ProductBackLink from "@/components/ProductBackLink";
import ProductLogoViewer from "@/components/ProductLogoViewer";
import ProductInteractive from "@/components/ProductInteractive";
import { getProductByCode, getRelatedProducts, getAllProducts } from "@/lib/products";
import { getProductName } from "@/lib/product-display";
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
  const tCat = await getTranslations("categories");

  const product = await getProductByCode(decodeURIComponent(code));
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const allProducts = await getAllProducts();
  const individualProducts = allProducts.filter(p => p.type !== 'set' && (!p.includes || p.includes.length === 0));

  const displayName = getProductName(product, locale as Locale);
  const loc = locale as Locale;

  return (
    <div className="mx-auto max-w-shop bg-white px-4 py-8 md:px-6 md:py-12">
      <Suspense fallback={<span className="text-sm text-neutral-400">…</span>}>
        <ProductBackLink />
      </Suspense>

      <ProductInteractive 
        product={product} 
        individualProducts={individualProducts} 
      />

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
