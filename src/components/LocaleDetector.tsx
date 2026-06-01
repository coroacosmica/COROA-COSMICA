"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { detectBrowserLocale } from "@/lib/locales";
import { LOCALE_STORAGE_KEY } from "@/lib/cart";
import type { Locale } from "@/i18n/routing";

export default function LocaleDetector() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const picked = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (picked === "1") return;

    const detected = detectBrowserLocale();
    if (detected && detected !== locale) {
      localStorage.setItem(LOCALE_STORAGE_KEY, "1");
      router.replace(pathname, { locale: detected as Locale });
    } else {
      localStorage.setItem(LOCALE_STORAGE_KEY, "1");
    }
  }, [locale, pathname, router]);

  return null;
}
