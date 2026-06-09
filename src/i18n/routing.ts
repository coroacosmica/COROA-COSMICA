import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: [
    "pt",
    "es",
    "fr",
    "de",
    "it",
    "nl",
    "pl",
    "ro",
    "en",
    "en-us",
    "ar",
    "ar-sa",
    "ar-eg",
    "pt-br",
  ],
  defaultLocale: "pt",
  localePrefix: "always",
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
