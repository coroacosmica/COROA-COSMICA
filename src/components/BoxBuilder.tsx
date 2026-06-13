"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Product } from "@/lib/products";
import { getProductName } from "@/lib/product-display";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import type { Locale } from "@/i18n/routing";
import Image from "next/image";
import { clsx } from "clsx";

export default function BoxBuilder({ 
  product, 
  individualProducts 
}: { 
  product: Product;
  individualProducts: Product[];
}) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const { addItem, openCart } = useCart();
  const currencyState = useCurrency();
  
  // State: selected quantities per product code
  const [selections, setSelections] = useState<Record<string, number>>({});
  
  const basePrice = currencyState.calculateDiscountedPrice(product);
  
  const additionalPrice = Object.entries(selections).reduce((sum, [code, qty]) => {
    const p = individualProducts.find(ip => ip.code === code);
    return sum + ((p?.price ?? 0) * qty);
  }, 0);
  
  const totalPrice = basePrice + additionalPrice;

  const updateQuantity = (code: string, delta: number) => {
    setSelections(prev => {
      const current = prev[code] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[code];
        return copy;
      }
      return { ...prev, [code]: next };
    });
  };

  const toggleSelection = (code: string) => {
    setSelections(prev => {
      if (prev[code]) {
        const copy = { ...prev };
        delete copy[code];
        return copy;
      }
      return { ...prev, [code]: 1 };
    });
  };

  const handleAddToCart = () => {
    const bundleItems = Object.entries(selections).map(([code, qty]) => {
      const p = individualProducts.find(ip => ip.code === code);
      return {
        code,
        name: p ? getProductName(p, locale) : code,
        quantity: qty
      };
    });

    const bundleDesc = bundleItems.map(i => `${i.name} ×${i.quantity}`).join(", ");
    const finalName = bundleDesc ? `${getProductName(product, locale)} — ${bundleDesc}` : getProductName(product, locale);

    addItem({
      code: `CUSTOM_BOX_${product.code}_${Date.now()}`,
      name: finalName,
      image: product.image || "/images/placeholder.jpg",
      price: totalPrice,
      bundleItems
    });
    openCart();
  };

  return (
    <div className="mt-8 rounded-xl border border-olive-200 bg-neutral-50 p-6 shadow-sm">
      <h3 className="text-xl font-display font-medium text-olive-950 mb-2">
        Build Your Box
      </h3>
      <p className="text-sm text-neutral-600 mb-6">
        Select items to add to your custom {getProductName(product, locale)}.
      </p>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {individualProducts.slice(0, 50).map((ip) => {
          const isSelected = !!selections[ip.code];
          const qty = selections[ip.code] || 0;
          const ipName = getProductName(ip, locale);
          
          return (
            <div 
              key={ip.code}
              className={clsx(
                "flex items-center justify-between rounded-lg border bg-white p-3 transition-colors",
                isSelected ? "border-accent-orange ring-1 ring-accent-orange" : "border-neutral-200 hover:border-olive-300"
              )}
            >
              <div className="flex items-center gap-4 flex-1">
                <input 
                  type="checkbox" 
                  checked={isSelected}
                  onChange={() => toggleSelection(ip.code)}
                  className="h-5 w-5 rounded border-neutral-300 text-accent-orange focus:ring-accent-orange cursor-pointer"
                />
                
                <div className="relative h-12 w-12 shrink-0 bg-neutral-50 rounded overflow-hidden">
                  <Image 
                    src={ip.image || "/images/placeholder.jpg"} 
                    alt={ipName} 
                    fill 
                    className="object-contain p-1"
                    sizes="48px"
                  />
                </div>
                
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-sm font-medium text-neutral-900 truncate" title={ipName}>
                    {ipName}
                  </span>
                  <span className="text-xs font-semibold text-olive-700">
                    +{currencyState.formatLocalPrice(currencyState.calculateDiscountedPrice(ip))}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div className="flex items-center gap-3 ml-4">
                  <button 
                    type="button"
                    onClick={() => updateQuantity(ip.code, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                  >
                    -
                  </button>
                  <span className="w-4 text-center text-sm font-medium">{qty}</span>
                  <button 
                    type="button"
                    onClick={() => updateQuantity(ip.code, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded border border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-olive-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">Total Price</p>
          <p className="text-2xl font-bold text-olive-800">{currencyState.formatLocalPrice(totalPrice)}</p>
        </div>
        <button 
          onClick={handleAddToCart}
          className="btn-primary w-full sm:w-auto px-8"
        >
          Add Custom Box to Cart
        </button>
      </div>
    </div>
  );
}
