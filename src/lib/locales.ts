import type { Locale } from "@/i18n/routing";

export type CurrencyCode = "EUR" | "USD" | "EGP" | "BRL" | "PLN" | "RON";

export interface LocaleMeta {
  flag: string;
  label: string;
  nativeName: string;
  currency: CurrencyCode;
  dir: "ltr" | "rtl";
  browserCodes: string[];
}

export const LOCALE_META: Record<Locale, LocaleMeta> = {
  pt: {
    flag: "🇵🇹",
    label: "Portuguese",
    nativeName: "Português",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["pt", "pt-pt"],
  },
  es: {
    flag: "🇪🇸",
    label: "Spanish",
    nativeName: "Español",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["es"],
  },
  fr: {
    flag: "🇫🇷",
    label: "French",
    nativeName: "Français",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["fr"],
  },
  de: {
    flag: "🇩🇪",
    label: "German",
    nativeName: "Deutsch",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["de"],
  },
  it: {
    flag: "🇮🇹",
    label: "Italian",
    nativeName: "Italiano",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["it"],
  },
  nl: {
    flag: "🇳🇱",
    label: "Dutch",
    nativeName: "Nederlands",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["nl"],
  },
  pl: {
    flag: "🇵🇱",
    label: "Polish",
    nativeName: "Polski",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["pl"],
  },
  ro: {
    flag: "🇷🇴",
    label: "Romanian",
    nativeName: "Română",
    currency: "EUR",
    dir: "ltr",
    browserCodes: ["ro"],
  },
  en: {
    flag: "🇬🇧",
    label: "English",
    nativeName: "English",
    currency: "USD",
    dir: "ltr",
    browserCodes: ["en", "en-gb"],
  },
  "en-us": {
    flag: "🇺🇸",
    label: "English (US)",
    nativeName: "English (US)",
    currency: "USD",
    dir: "ltr",
    browserCodes: ["en-us"],
  },
  ar: {
    flag: "🇸🇦",
    label: "Arabic",
    nativeName: "العربية",
    currency: "EGP",
    dir: "rtl",
    browserCodes: ["ar"],
  },
  "ar-eg": {
    flag: "🇪🇬",
    label: "Arabic (Egypt)",
    nativeName: "العربية (مصر)",
    currency: "EGP",
    dir: "rtl",
    browserCodes: ["ar-eg"],
  },
  "pt-br": {
    flag: "🇧🇷",
    label: "Portuguese (Brazil)",
    nativeName: "Português (Brasil)",
    currency: "BRL",
    dir: "ltr",
    browserCodes: ["pt-br"],
  },
};

export function isRtlLocale(locale: string): boolean {
  const meta = LOCALE_META[locale as Locale];
  return meta?.dir === "rtl";
}

export function detectBrowserLocale(): Locale | null {
  if (typeof navigator === "undefined") return null;
  const preferred = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  for (const lang of preferred) {
    const lower = lang.toLowerCase();
    for (const [loc, meta] of Object.entries(LOCALE_META) as [Locale, LocaleMeta][]) {
      if (meta.browserCodes.some((c) => lower === c || lower.startsWith(`${c}-`))) {
        return loc;
      }
    }
    const base = lower.split("-")[0];
    for (const [loc, meta] of Object.entries(LOCALE_META) as [Locale, LocaleMeta][]) {
      if (meta.browserCodes.includes(base)) return loc;
    }
  }
  return null;
}
