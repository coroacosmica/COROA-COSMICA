import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import BrandLogo from "./BrandLogo";
import StripeBar from "./StripeBar";
import { BRAND_NAME, CONTACT_EMAIL, WHATSAPP_NUMBERS } from "@/lib/brand";

export default function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-olive-600 text-[#E8E8E8]">
      <StripeBar />
      <div className="mx-auto max-w-shop px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <BrandLogo height={48} />
            <p className="mt-4 text-sm leading-relaxed text-white/70">{t("tagline")}</p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-orange">
              {nav("catalogue")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/catalogue?category=vip-sets" className="hover:text-accent-orange">
                  {nav("vip")}
                </Link>
              </li>
              <li>
                <Link href="/catalogue?category=cork-eco" className="hover:text-accent-orange">
                  {nav("cork")}
                </Link>
              </li>
              <li>
                <Link href="/virtual-sample" className="hover:text-accent-orange">
                  {nav("virtualSample")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-orange">
              {nav("contact")}
            </h4>
            <p className="mt-4 text-sm text-white/70">
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-accent-orange">
                {CONTACT_EMAIL}
              </a>
            </p>
            <ul className="mt-3 space-y-1 text-sm text-white/70">
              {WHATSAPP_NUMBERS.map((w) => (
                <li key={w.number}>
                  <span className="text-white/50">{w.label}: </span>
                  <a
                    href={`https://wa.me/${w.number.replace(/\D/g, "")}`}
                    className="hover:text-accent-orange"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {w.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/50 sm:flex-row">
          <p>
            © {year} {BRAND_NAME}. {t("rights")}
          </p>
          <div className="flex gap-6">
            <span>{t("privacy")}</span>
            <span>{t("terms")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
