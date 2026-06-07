import Image from "next/image";
import type { Product } from "@/lib/products";
import { getProductImage } from "@/lib/product-display";

type Props = {
  product: Product;
  className?: string;
  priority?: boolean;
  sizes?: string;
  loading?: "lazy" | "eager";
  overrideImage?: string;
};

export default function ProductImage({
  product,
  className = "object-contain p-3",
  priority = false,
  sizes = "(max-width: 768px) 50vw, 25vw",
  loading,
  overrideImage,
}: Props) {
  const src = overrideImage || getProductImage(product);
  const isPlaceholder = !overrideImage && !product.image;

  return (
    <Image
      src={src}
      alt={product.names?.en || product.names?.pt || product.code}
      fill
      quality={95}
      className={isPlaceholder ? `${className} opacity-90` : className}
      sizes={sizes}
      priority={priority}
      loading={loading ?? (priority ? "eager" : "lazy")}
      unoptimized={src.endsWith(".jpeg") || src.endsWith(".jpg") || src.endsWith(".png")}
    />
  );
}
