import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Hero() {
  const t = useTranslations("hero");

  const stats = [
    t("stats.products"),
    t("stats.sets"),
    t("stats.delivery"),
    t("stats.sample"),
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cork-50 via-white to-forest-50">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -end-20 -top-20 h-96 w-96 rounded-full bg-cork-300 blur-3xl" />
        <div className="absolute -bottom-20 -start-20 h-80 w-80 rounded-full bg-forest-300 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex rounded-full bg-forest-100 px-4 py-1 text-sm font-semibold text-forest-700">
              {t("badge")}
            </span>
            <h1 className="mt-6 max-w-2xl font-display text-4xl font-bold leading-tight text-forest-900 md:text-5xl lg:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-cork-700 font-medium">
              {t("subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/catalogue" className="btn-primary">
                {t("ctaCatalogue")}
              </Link>
              <Link href="/virtual-sample" className="btn-secondary bg-white">
                {t("ctaSample")}
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s}
                  className="rounded-xl border border-cork-200/80 bg-white/80 px-4 py-3 text-center text-sm font-semibold text-forest-800 backdrop-blur"
                >
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block h-[500px]">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-2xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500 z-20">
              <img src="/images/products/NB Set 1.png" alt="Premium Set" className="w-full h-full object-cover" />
            </div>
            <div className="absolute top-32 right-48 w-56 h-56 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 hover:rotate-0 transition duration-500 z-10">
              <img src="/images/products/Mug 28 Set.png" alt="Premium Mug Set" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-16 w-72 h-48 rounded-2xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500 z-30">
              <img src="/images/products/Box Ramadan.png" alt="Ramadan Box" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
