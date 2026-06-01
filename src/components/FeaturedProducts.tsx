import { useTranslations } from "next-intl";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";

export default function FeaturedProducts({ products }: { products: Product[] }) {
  const t = useTranslations("home");

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-shop px-4 md:px-6">
        <h2 className="section-title text-center">{t("recommended")}</h2>
        <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
