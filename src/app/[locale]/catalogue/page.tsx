import { setRequestLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import CatalogueClient from "@/components/CatalogueClient";
import { getAllProducts, getAllCategories } from "@/lib/products";

export const dynamic = 'force-dynamic';

export default async function CataloguePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("catalogue");
  const products = await getAllProducts();
  const categories = await getAllCategories();

  return (
    <div className="mx-auto max-w-shop bg-white px-4 py-12 md:px-6">
      <h1 className="section-title text-center">{t("title")}</h1>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse bg-neutral-100" />}>
        <div className="mt-8">
          <CatalogueClient allProducts={products} categories={categories} />
        </div>
      </Suspense>
    </div>
  );
}
