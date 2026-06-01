import { setRequestLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ContactForm from "@/components/ContactForm";
import { CONTACT_EMAIL, WHATSAPP_NUMBERS } from "@/lib/brand";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="mx-auto max-w-shop px-4 py-12 md:px-6">
      <div className="mb-10">
        <h1 className="section-title">{t("title")}</h1>
        <p className="mt-3 text-neutral-600">{t("subtitle")}</p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <Suspense fallback={<div className="h-96 animate-pulse bg-olive-50" />}>
          <ContactForm />
        </Suspense>
        <div className="card border-olive-200 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-olive-900">{t("info.title")}</h2>
          <ul className="mt-4 space-y-3 text-sm text-neutral-700">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-olive-700 hover:text-accent-orange">
                📧 {CONTACT_EMAIL}
              </a>
            </li>
            {WHATSAPP_NUMBERS.map((w) => (
              <li key={w.number}>
                📱 {w.label}:{" "}
                <a
                  href={`https://wa.me/${w.number.replace(/\D/g, "")}`}
                  className="text-olive-700 hover:text-accent-orange"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {w.number}
                </a>
              </li>
            ))}
            <li>🕐 {t("info.hours")}</li>
            <li>⚡ {t("info.response")}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
