import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { ContactCta } from "@/components/HomeSections";

export const dynamic = 'force-dynamic';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <>
      <section className="bg-olive-50 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 text-center md:px-6">
          <h1 className="font-display text-4xl uppercase tracking-wider text-olive-950 md:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-4 md:px-6 text-center">
          <h2 className="font-display text-3xl text-olive-900 mb-6">{t("storyTitle")}</h2>
          <p className="text-lg leading-relaxed text-neutral-700">
            {t("storyText")}
          </p>
        </div>
      </section>

      <section className="bg-olive-50 py-16 md:py-24">
        <div className="mx-auto max-w-shop px-4 md:px-6">
          <h2 className="font-display text-3xl text-center text-olive-900 mb-12">{t("whyCorkTitle")}</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="bg-white p-8 border border-olive-200 text-center shadow-sm">
              <div className="text-4xl mb-4">🌿</div>
              <p className="font-semibold text-olive-900">{t("corkSustainable")}</p>
            </div>
            <div className="bg-white p-8 border border-olive-200 text-center shadow-sm">
              <div className="text-4xl mb-4">💧</div>
              <p className="font-semibold text-olive-900">{t("corkDurable")}</p>
            </div>
            <div className="bg-white p-8 border border-olive-200 text-center shadow-sm">
              <div className="text-4xl mb-4">✨</div>
              <p className="font-semibold text-olive-900">{t("corkUnique")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="mx-auto max-w-shop px-4 md:px-6 text-center">
          <h2 className="font-display text-3xl text-olive-900 mb-10">{t("whereWeOperateTitle")}</h2>
          <div className="flex flex-wrap justify-center gap-6 text-lg font-semibold text-olive-800">
            <span className="bg-olive-100 px-6 py-3 rounded-full">🇪🇬 Egypt</span>
            <span className="bg-olive-100 px-6 py-3 rounded-full">🇪🇺 Europe</span>
            <span className="bg-olive-100 px-6 py-3 rounded-full">🇺🇸 USA</span>
            <span className="bg-olive-100 px-6 py-3 rounded-full">🇸🇦 Saudi Arabia</span>
          </div>
        </div>
      </section>

      <section className="bg-olive-600 py-16 text-white">
        <div className="mx-auto max-w-shop px-4 text-center md:px-6">
          <h2 className="font-display text-3xl tracking-[0.1em]">{t("ctaTitle")}</h2>
          <div className="mt-8">
            <Link href="/contact" className="btn-primary min-h-[44px] bg-accent-orange hover:bg-white hover:text-olive-800 px-8 py-3 text-lg inline-block">
              {t("ctaButton")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
