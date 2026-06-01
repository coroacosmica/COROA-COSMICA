import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CATEGORY_IDS } from "@/lib/products";

export default function CategoryGrid() {
  const t = useTranslations("categories");

  const highlight = ["vip-sets", "cork-eco", "notebooks-premium", "tech-gifts"];

  return (
    <section className="bg-cork-50 py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="section-title text-center">{t("title")}</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_IDS.filter((c) => highlight.includes(c) || CATEGORY_IDS.indexOf(c) < 8).slice(0, 8).map((cat) => (
            <Link
              key={cat}
              href={`/catalogue?category=${cat}`}
              className="group card flex items-center gap-4 p-5 hover:border-forest-300"
            >
              <span
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${
                  cat === "vip-sets"
                    ? "bg-forest-700 text-white"
                    : cat === "cork-eco"
                      ? "bg-cork-500 text-white"
                      : "bg-cork-200 text-forest-800"
                }`}
              >
                {cat === "vip-sets" ? "★" : cat === "cork-eco" ? "♻" : "◆"}
              </span>
              <span className="font-semibold text-forest-900 group-hover:text-forest-600">
                {t(cat as "vip-sets")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
