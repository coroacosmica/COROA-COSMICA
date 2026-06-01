import Image from "next/image";
import { BRAND_NAME, LOGO_PATH } from "@/lib/brand";
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
  const width = Math.round(height * 1.97);

  return (
    <Image
      src={LOGO_PATH}
      alt={BRAND_NAME}
      width={width}
      height={height}
      className={clsx("h-auto w-auto object-contain", className)}
      style={{ height, width: "auto", maxWidth: width }}
      priority={priority}
    />
  );
}
