import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Category } from "@/lib/products";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  const t = useTranslations("categories");
  const locale = useLocale();

  const highlight = ["vip-sets", "cork-eco", "notebooks-premium", "tech-gifts"];

  return (
    <section className="bg-cork-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="section-title text-center">{t("title")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.filter((c) => highlight.includes(c.slug) || categories.indexOf(c) < 8).slice(0, 8).map((cat) => (
            <Link
              key={cat.slug}
              href={`/catalogue?category=${cat.slug}`}
              className="group card flex items-center gap-4 p-5 hover:border-forest-300"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                  cat.slug === "vip-sets"
                    ? "bg-forest-700 text-white"
                    : cat.slug === "cork-eco"
                      ? "bg-cork-500 text-white"
                      : "bg-cork-200 text-forest-800"
                }`}
              >
                {cat.slug === "vip-sets" ? "★" : cat.slug === "cork-eco" ? "♻" : "◆"}
              </span>
              <span className="font-semibold text-forest-900 group-hover:text-forest-600">
                {locale === "pt" ? cat.name_pt : locale === "ar" ? cat.name_ar : cat.name_en}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
