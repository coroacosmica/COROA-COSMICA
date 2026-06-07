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
            <div className="mt-6 flex gap-3">
              <a href="https://www.facebook.com/profile.php?id=61590414132209" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-accent-orange transition-colors" title="Facebook">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/coroacosmica/" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-accent-orange transition-colors" title="Instagram">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://youtube.com/@coroa_cosmica?si=1iQmUKQyXFEvKhe1" target="_blank" rel="noopener noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-accent-orange transition-colors" title="YouTube">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
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
