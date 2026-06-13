"use client";

import { useTranslations, useLocale } from "next-intl";
import { useState, useEffect } from "react";
import type { Product } from "@/lib/products";
import { getProductName } from "@/lib/product-display";
import { useCurrency } from "@/context/CurrencyContext";
import type { Locale } from "@/i18n/routing";
import ProductImage from "./ProductImage";
import AddToCartButton from "./AddToCartButton";
import ColorSelector from "./ColorSelector";
import { useCategories } from "@/context/CategoryContext";

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const t = useTranslations("catalogue");
  const locale = useLocale() as Locale;
  const { formatProductPrice, getRawPrice, formatLocalPrice } = useCurrency();
  const categories = useCategories();
  
  const categoryLabel = categories.find(c => c.slug === product.category)?.[`name_${locale}` as keyof typeof categories[0]] || product.category;

  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product.variants?.[0]?.color
  );
  
  const selectedVariant = product.variants?.find((v) => v.color === selectedColor);
  const displayName = getProductName(product, locale);

  const galleryImages = product.images?.length 
    ? product.images 
    : (product.image ? [product.image] : []);
    
  const [selectedGalleryImage, setSelectedGalleryImage] = useState<string | undefined>(
    galleryImages[0]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors"
          aria-label="Close"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid gap-8 lg:grid-cols-2 p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-neutral-50">
              <ProductImage
                product={product}
                overrideImage={selectedVariant?.image || selectedGalleryImage}
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {product.discount_percentage && product.discount_percentage > 0 ? (
                <span className="absolute top-4 end-4 rounded bg-red-600 px-3 py-1.5 text-sm font-bold text-white shadow-sm">
                  -{product.discount_percentage}% OFF
                </span>
              ) : null}
            </div>
            {/* Thumbnails Gallery */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 px-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedGalleryImage(img)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedGalleryImage === img ? "border-olive-600" : "border-transparent hover:border-olive-300"
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-olive-600">
              {categoryLabel}
            </p>
            <h2 className="mt-2 text-2xl font-display md:text-3xl font-medium text-neutral-900">
              {displayName}
            </h2>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-olive-700">{formatProductPrice(product)}</span>
              {product.discount_percentage && product.discount_percentage > 0 ? (
                <span className="text-xl text-neutral-400 line-through">{formatLocalPrice(getRawPrice(product))}</span>
              ) : null}
            </div>
            
            <div className="mt-4 text-sm text-neutral-600 line-clamp-3">
              {product.description}
            </div>

            {product.variants && product.variants.length > 0 && (
              <div className="mt-6 border-t border-neutral-100 pt-6">
                <ColorSelector
                  variants={product.variants}
                  selectedColor={selectedColor}
                  onChange={(v) => setSelectedColor(v.color)}
                />
              </div>
            )}

            <div className="mt-8">
              <AddToCartButton 
                product={product} 
                color={selectedColor} 
                className="w-full h-14 text-lg" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
