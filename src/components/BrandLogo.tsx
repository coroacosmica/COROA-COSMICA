import Image from "next/image";
import { BRAND_NAME } from "@/lib/brand";
import { clsx } from "clsx";

type BrandLogoProps = {
  className?: string;
  height?: number;
  priority?: boolean;
};

export default function BrandLogo({
  className,
  height = 44,
  priority = false,
}: BrandLogoProps) {
  // Keep layout dimensions normal so header doesn't grow
  const layoutHeight = height; 
  const layoutWidth = Math.round(layoutHeight * 2.8);

  return (
    <div 
      className={clsx("flex items-center", className)}
      style={{ width: layoutWidth * 1.5, height: layoutHeight }}
    >
      <Image
        src="/images/combined-logo-transparent.png"
        alt={BRAND_NAME}
        width={layoutWidth}
        height={layoutHeight}
        className="h-auto w-auto object-contain origin-left"
        style={{ 
          height: layoutHeight, 
          width: "auto",
          transform: "scale(2.5)" // Scale visually without pushing layout
        }}
        priority={priority}
      />
    </div>
  );
}
