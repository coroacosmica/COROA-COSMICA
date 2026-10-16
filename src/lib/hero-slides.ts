import type { HeroSlide } from "@/components/HeroSlider";
import { BRAND_SHORT } from "./brand";
import type { Product } from "./products";
import { getProductImage, getProductName } from "./product-display";
import { slugifyCode } from "./utils";
import type { Locale } from "@/i18n/routing";

const FALLBACK_SLIDES: HeroSlide[] = [
  {
    title: BRAND_SHORT.toUpperCase(),
    subtitle: "VIP Sets · Cork · Eco",
    image: "/images/placeholders/vip.svg",
    href: "/catalogue?category=vip-sets",
  },
  {
    title: "CORTIÇA PORTUGUESA",
    subtitle: "Brindes sustentáveis",
    image: "/images/placeholders/cork.svg",
    href: "/catalogue?category=cork-eco",
  },
  {
    title: "TECNOLOGIA & NEGÓCIOS",
    subtitle: "1000+ produtos",
    image: "/images/placeholders/tech.svg",
    href: "/catalogue",
  },
];

export function buildHeroSlides(products: Product[], locale: Locale): HeroSlide[] {
  const isArabic = locale === "ar" || locale.startsWith("ar");
  const isPortuguese = locale === "pt" || locale.startsWith("pt");

  // Promotional poster banners
  const enPosterSlide: HeroSlide = {
    title: "Big Sale - Corporate Gifts & Promotional Products",
    subtitle: "Order More. Save More.",
    image: "/images/banners/poster-en.jpg",
    href: "/catalogue",
    isBanner: true,
  };

  const arPosterSlide: HeroSlide = {
    title: "عروض كبرى - هدايا الشركات والمنتجات الدعائية",
    subtitle: "كلما طلبت أكثر توفر أكثر",
    image: "/images/banners/poster-ar.jpg",
    href: "/catalogue",
    isBanner: true,
  };

  // Locale-prioritized order: relevant language first
  const posterSlides = isArabic
    ? [arPosterSlide, enPosterSlide]
    : isPortuguese
    ? [arPosterSlide, enPosterSlide]
    : [enPosterSlide, arPosterSlide];

  const withImage = products.filter((p) => p.image && !p.image.endsWith(".svg"));
  const source = withImage.length >= 2 ? withImage : products;

  const productSlides: HeroSlide[] = source.slice(0, 3).map((p) => ({
    title: getProductName(p, locale).toUpperCase().slice(0, 40),
    subtitle: BRAND_SHORT,
    image: getProductImage(p),
    href: `/product/${slugifyCode(p.code)}`,
    isBanner: false,
  }));

  return [...posterSlides, ...productSlides];
}
