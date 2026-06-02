import { setRequestLocale } from "next-intl/server";
import HeroSlider from "@/components/HeroSlider";
import FeaturedProducts from "@/components/FeaturedProducts";
import {
  CategoryQuickLinks,
  ProductStrip,
  TrustFeatures,
  ContactCta,
} from "@/components/HomeSections";
import {
  getFeaturedProducts,
  getVipSets,
  getCorkProducts,
} from "@/lib/products";
import { buildHeroSlides } from "@/lib/hero-slides";
import type { Locale } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const [featured, vip, cork] = await Promise.all([
    getFeaturedProducts(12),
    getVipSets(),
    getCorkProducts(),
  ]);
  const slides = buildHeroSlides(featured, locale as Locale);

  return (
    <>
      <HeroSlider slides={slides} />
      <CategoryQuickLinks />
      <FeaturedProducts products={featured} />
      <ProductStrip
        title={t("vipTitle")}
        subtitle={t("vipSubtitle")}
        products={vip}
        href="/catalogue?category=vip-sets"
      />
      <ProductStrip
        title={t("corkTitle")}
        subtitle={t("corkSubtitle")}
        products={cork}
        href="/catalogue?category=cork-eco"
      />
      <TrustFeatures />
      <ContactCta />
    </>
  );
}
