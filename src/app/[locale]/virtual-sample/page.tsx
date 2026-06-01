import { setRequestLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import VirtualSampleForm from "@/components/VirtualSampleForm";

export default async function VirtualSamplePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("virtualSample");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="section-title">{t("title")}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-cork-700">{t("subtitle")}</p>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-cork-100" />}>
        <VirtualSampleForm />
      </Suspense>
    </div>
  );
}
