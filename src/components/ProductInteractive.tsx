"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { getProductName } from "@/lib/product-display";
import { useCurrency } from "@/context/CurrencyContext";
import type { Locale } from "@/i18n/routing";
import ProductImage from "./ProductImage";
import ProductActions from "./ProductActions";
import ColorSelector from "./ColorSelector";
import BoxBuilder from "./BoxBuilder";
import { useCategories } from "@/context/CategoryContext";

export default function ProductInteractive({ 
  product, 
  individualProducts 
}: { 
  product: Product;
  individualProducts: Product[];
}) {
  const t = useTranslations("product");
  const tc = useTranslations("catalogue");
  const locale = useLocale() as Locale;
  const displayName = getProductName(product, locale);
  const { formatProductPrice, getRawPrice, formatLocalPrice } = useCurrency();
  const categories = useCategories();
  
  const categoryLabel = categories.find(c => c.slug === product.category)?.[`name_${locale}` as keyof typeof categories[0]] || product.category;

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.variants?.[0]?.color
  );
  const selectedVariant = product.variants?.find((v) => v.color === selectedColor);
  
  // Combine all possible images for the gallery
  const galleryImages = product.images?.length 
    ? product.images 
    : (product.image ? [product.image] : []);
    
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | undefined>(
    galleryImages[0]
  );

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="group relative aspect-square min-h-[320px] overflow-hidden border border-olive-200 bg-neutral-50 lg:min-h-[480px]">
          <ProductImage
            product={product}
            overrideImage={selectedVariant?.image || selectedGalleryImage}
            priority
            className="image-zoom object-contain p-4 md:p-8"
            sizes="(max-width: 1024px) 100vw, 800px"
          />
          {product.discount_percentage && product.discount_percentage > 0 ? (
            <span className="absolute top-4 start-4 rounded bg-red-600 px-3 py-1.5 text-sm font-bold tracking-wide text-white shadow-sm md:px-4 md:py-2 md:text-base">
              -{product.discount_percentage}% OFF
            </span>
          ) : null}
        </div>
        
        {/* Thumbnails Gallery */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedGalleryImage(img)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  selectedGalleryImage === img ? "border-olive-600" : "border-transparent hover:border-olive-300"
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-olive-600">
          {categoryLabel}
        </p>
        <h1 className="mt-2 font-display text-3xl font-light text-olive-950 md:text-4xl">
          {displayName}
        </h1>
        <p className="mt-2 text-sm text-neutral-500">
          {tc("code")}: {product.code}
        </p>
        <div className="mt-4 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-olive-700">{formatProductPrice(product)}</span>
          {product.discount_percentage && product.discount_percentage > 0 ? (
            <div className="flex flex-col">
              <span className="text-xl text-neutral-400 line-through decoration-1">{formatLocalPrice(getRawPrice(product))}</span>
              <span className="text-sm font-semibold text-red-600">You save {product.discount_percentage}%</span>
            </div>
          ) : null}
        </div>
        {product.description && product.description !== displayName && (
          <p className="mt-4 text-neutral-700">{product.description}</p>
        )}
        <p className="mt-2 text-sm text-neutral-500">{t("minOrder")}</p>

        {product.includes && product.includes.length > 0 && (
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

        {product.variants && product.variants.length > 0 && (
          <div className="mt-6 border-t border-neutral-100 pt-6">
            <ColorSelector
              variants={product.variants}
              selectedColor={selectedColor}
              onChange={(v) => setSelectedColor(v.color)}
            />
          </div>
        )}

        {/* Render either BoxBuilder OR ProductActions depending on product type */}
        {(product.type === "set" || product.tags?.includes("bundle") || product.category === "vip-sets") ? (
          <div className="mt-8">
            <BoxBuilder product={product} individualProducts={individualProducts} />
          </div>
        ) : (
          <ProductActions product={product} color={selectedColor} />
        )}

        <div className="mt-8 border-t border-neutral-100 pt-6">
          <a
            href={`/design-studio?product=${encodeURIComponent(product.code)}`}
            className="btn-outline w-full min-h-[44px] flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Customize this product 🖌️
          </a>
        </div>
      </div>
    </div>
  );
}
