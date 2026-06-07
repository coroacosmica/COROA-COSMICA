import { getProductByCode, getAllProducts } from "@/lib/products";
import { redirect } from "next/navigation";
import DesignStudio from "@/components/design-studio/DesignStudio";

export default async function DesignStudioPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const code = (await searchParams).product;
  if (!code) {
    redirect("/catalogue");
  }

  const product = await getProductByCode(code);
  if (!product) {
    redirect("/catalogue");
  }

  return (
    <div className="h-screen w-screen bg-neutral-100 overflow-hidden flex flex-col">
      <DesignStudio product={product} />
    </div>
  );
}
