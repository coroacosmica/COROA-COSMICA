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
  const withImage = products.filter((p) => p.image && !p.image.endsWith(".svg"));
  const source = withImage.length >= 2 ? withImage : products;

  const slides = source.slice(0, 4).map((p) => ({
    title: getProductName(p, locale).toUpperCase().slice(0, 40),
    subtitle: BRAND_SHORT,
    image: getProductImage(p),
    href: `/product/${slugifyCode(p.code)}`,
  }));

  return slides.length >= 2 ? slides : FALLBACK_SLIDES;
}
