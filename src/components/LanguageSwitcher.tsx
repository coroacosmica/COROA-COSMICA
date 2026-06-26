"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { LOCALE_META } from "@/lib/locales";
import { LOCALE_STORAGE_KEY } from "@/lib/cart";
import { clsx } from "clsx";

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations("header");
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = LOCALE_META[locale];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-[44px] items-center gap-2 rounded border border-white/30 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base leading-none">{meta.flag}</span>
        <span className="hidden max-w-[120px] truncate sm:inline">{meta.nativeName}</span>
        <svg className={clsx("h-4 w-4 transition", open && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute end-0 top-full z-50 mt-1 max-h-80 w-56 overflow-y-auto rounded border border-olive-200 bg-white py-1 shadow-xl"
        >
          {routing.locales.map((loc) => {
            const m = LOCALE_META[loc];
            return (
              <li key={loc}>
                <button
                  type="button"
                  role="option"
                  aria-selected={locale === loc}
                  onClick={() => {
                    localStorage.setItem(LOCALE_STORAGE_KEY, "1");
                    router.replace(pathname, { locale: loc });
                    setOpen(false);
                  }}
                  className={clsx(
                    "flex w-full min-h-[44px] items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-olive-50",
                    locale === loc && "bg-olive-100 font-semibold text-olive-800"
                  )}
                >
                  <span className="text-lg">{m.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-neutral-800">{m.nativeName}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
