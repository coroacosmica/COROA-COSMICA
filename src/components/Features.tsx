import { useTranslations } from "next-intl";

const icons = ["🪵", "🎁", "🖼️", "🌿"];

export default function Features() {
  const t = useTranslations("features");
  const items = ["cork", "vip", "sample", "eco"] as const;

  return (
    <section className="bg-white py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <h2 className="section-title text-center">{t("title")}</h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((key, i) => (
            <div key={key} className="card p-6">
              <span className="text-3xl">{icons[i]}</span>
              <h3 className="mt-4 font-display text-lg font-bold text-forest-900">
                {t(`${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-cork-700">
                {t(`${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
