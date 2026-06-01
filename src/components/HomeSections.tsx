import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";
export function CategoryQuickLinks() {
  const t = useTranslations("categories");
  const quick = ["vip-sets", "cork-eco", "tech-gifts", "business-gifts", "notebooks-premium", "promotional"] as const;

  return (
    <section className="border-b border-olive-100 bg-white py-6">
      <div className="mx-auto max-w-shop px-4 md:px-6">
        <h2 className="sr-only">{t("title")}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {quick.map((cat) => (
            <Link
              key={cat}
              href={`/catalogue?category=${cat}`}
              className="shrink-0 min-h-[44px] rounded-full border border-olive-300 bg-olive-50 px-5 py-2.5 text-sm font-semibold text-olive-800 transition hover:border-olive-600 hover:bg-olive-600 hover:text-white"
            >
              {t(cat)}
            </Link>
          ))}
          <Link
            href="/catalogue"
            className="shrink-0 min-h-[44px] rounded-full border border-accent-orange bg-accent-orange/10 px-5 py-2.5 text-sm font-semibold text-olive-900"
          >
            {t("general")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function ProductStrip({
  title,
  subtitle,
  products,
  href,
}: {
  title: string;
  subtitle?: string;
  products: Product[];
  href: string;
}) {
  const th = useTranslations("home");

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-shop px-4 md:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">{title}</h2>
            {subtitle && <p className="mt-2 text-neutral-600">{subtitle}</p>}
          </div>
          <Link href={href} className="shrink-0 text-sm font-semibold uppercase text-olive-600 hover:text-accent-orange">
            {th("viewAll")} →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.slice(0, 4).map((p) => (
            <ProductCard key={p.code} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function TrustFeatures() {
  const t = useTranslations("features");
  const items = ["cork", "vip", "sample", "eco"] as const;

  return (
    <section className="bg-olive-50 py-14">
      <div className="mx-auto max-w-shop px-4 md:px-6">
        <h2 className="section-title text-center">{t("title")}</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((key) => (
            <div key={key} className="card border-olive-200 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-olive-600 text-xl text-white">
                {key === "cork" && "🌿"}
                {key === "vip" && "⭐"}
                {key === "sample" && "🎨"}
                {key === "eco" && "♻️"}
              </div>
              <h3 className="font-semibold text-olive-900">{t(`${key}.title`)}</h3>
              <p className="mt-2 text-sm text-neutral-600">{t(`${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ContactCta() {
  const t = useTranslations("home");
  const nav = useTranslations("nav");

  return (
    <section className="bg-olive-600 py-14 text-white">
      <div className="mx-auto max-w-shop px-4 text-center md:px-6">
        <h2 className="font-display text-2xl uppercase tracking-[0.15em] md:text-3xl">{t("ctaTitle")}</h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">{t("ctaSubtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/contact" className="btn-primary min-h-[44px] bg-accent-orange hover:bg-white hover:text-olive-800">
            {t("ctaButton")}
          </Link>
          <Link href="/virtual-sample" className="btn-secondary min-h-[44px] border-white text-white hover:bg-white/10">
            {nav("virtualSample")}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HeroContent() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-olive-50 to-white py-16 md:py-24">
      <div className="mx-auto max-w-shop px-4 md:px-6">
        <span className="inline-block rounded-full bg-olive-600 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
          {t("badge")}
        </span>
        <h1 className="mt-6 max-w-3xl font-display text-3xl font-light leading-tight text-olive-950 md:text-5xl">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-neutral-600">{t("subtitle")}</p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/catalogue" className="btn-primary min-h-[44px]">
            {t("ctaCatalogue")}
          </Link>
          <Link href="/virtual-sample" className="btn-secondary min-h-[44px]">
            {t("ctaSample")}
          </Link>
        </div>
        <ul className="mt-10 flex flex-wrap gap-6 text-sm font-medium text-olive-700">
          <li>{t("stats.products")}</li>
          <li>{t("stats.sets")}</li>
          <li>{t("stats.delivery")}</li>
          <li>{t("stats.sample")}</li>
        </ul>
      </div>
    </section>
  );
}
