import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Record<string, unknown>
): T {
  const result = { ...base } as Record<string, unknown>;
  for (const key of Object.keys(override)) {
    const baseVal = base[key];
    const overVal = override[key];
    if (
      overVal &&
      typeof overVal === "object" &&
      !Array.isArray(overVal) &&
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(
        baseVal as Record<string, unknown>,
        overVal as Record<string, unknown>
      );
    } else {
      result[key] = overVal;
    }
  }
  return result as T;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const en = (await import("../../messages/en.json")).default as Record<string, unknown>;
  let localeMessages: Record<string, unknown> = {};
  try {
    localeMessages = (await import(`../../messages/${locale}.json`)).default;
  } catch {
    /* English only */
  }

  const messages =
    locale === "en" ? en : deepMerge(en, localeMessages);

  return { locale, messages };
});
