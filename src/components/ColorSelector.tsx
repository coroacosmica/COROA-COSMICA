"use client";

import { clsx } from "clsx";
import { useTranslations } from "next-intl";

interface Variant {
  color: string;
  hex: string;
  image: string;
}

export default function ColorSelector({
  variants,
  selectedColor,
  onChange,
}: {
  variants: Variant[];
  selectedColor: string | undefined;
  onChange: (variant: Variant) => void;
}) {
  const t = useTranslations("product");

  if (!variants || variants.length === 0) return null;

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-neutral-900">{t("color")}:</span>
        <span className="text-sm text-neutral-500">
          {selectedColor || t("selectColor")}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedColor === variant.color;
          const isAvailable = true; // All excel variants are available

          return (
            <button
              key={variant.color}
              type="button"
              disabled={!isAvailable}
              onClick={() => onChange(variant)}
              title={variant.color}
              className={clsx(
                "relative flex items-center justify-center min-w-[2rem] h-8 rounded-full border-2 transition-all px-3 text-sm font-medium",
                isSelected
                  ? "border-accent-orange bg-accent-orange/10 text-accent-orange ring-1 ring-accent-orange"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300",
                !isAvailable && "opacity-50 cursor-not-allowed grayscale"
              )}
              style={variant.hex ? { backgroundColor: variant.hex } : undefined}
            >
              {variant.hex ? <span className="sr-only">{variant.color}</span> : <span>{variant.color}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
