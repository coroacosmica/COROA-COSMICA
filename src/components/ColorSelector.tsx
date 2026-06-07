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
          const isAvailable = !!variant.image; // Assume unavailable if no image mapped

          return (
            <button
              key={variant.color}
              type="button"
              disabled={!isAvailable}
              onClick={() => onChange(variant)}
              title={isAvailable ? variant.color : `${variant.color} (${t("availableOnRequest")})`}
              className={clsx(
                "relative h-8 w-8 rounded-full border-2 transition-all",
                isSelected
                  ? "border-accent-orange ring-2 ring-accent-orange ring-offset-1"
                  : "border-transparent hover:scale-110",
                !isAvailable && "opacity-50 cursor-not-allowed grayscale"
              )}
              style={{ backgroundColor: variant.hex }}
            >
              <span className="sr-only">{variant.color}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
