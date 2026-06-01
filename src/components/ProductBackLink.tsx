"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function ProductBackLink() {
  const t = useTranslations("product");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  if (returnTo && returnTo.startsWith("/")) {
    return (
      <Link
        href={returnTo}
        className="text-sm font-medium text-olive-800 hover:text-accent-orange"
      >
        ← {t("back")}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="text-sm font-medium text-olive-800 hover:text-accent-orange"
    >
      ← {t("back")}
    </button>
  );
}
