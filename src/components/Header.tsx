"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import BrandLogo from "./BrandLogo";
import HeaderSearch from "./HeaderSearch";
import StripeBar from "./StripeBar";
import { useCart } from "@/context/CartContext";
import GFMMenu from "./GFMMenu";
import MobileGFMMenu from "./MobileGFMMenu";

export default function Header() {
  const t = useTranslations("nav");
  const th = useTranslations("header");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { toggleCart, count } = useCart();

  const navLinks = [
    { href: "/catalogue", label: t("catalogue") },
    { href: "/catalogue?category=vip-sets", label: t("vip") },
    { href: "/catalogue?category=cork-eco", label: t("cork") },
    { href: "/virtual-sample", label: t("virtualSample") },
    { href: "/contact", label: t("contact") },
  ];

  if (pathname.startsWith("/admin")) {
    return (
      <header className="sticky top-0 z-50">
        <div className="bg-olive-600">
          <div className="mx-auto flex max-w-shop items-center justify-between px-4 py-3 md:px-6 md:py-3">
            <Link href="/" className="flex shrink-0 items-center">
              <BrandLogo height={52} priority />
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-olive-600 py-1.5 text-center text-[11px] font-medium tracking-wide text-white/90 md:text-xs">
        {th("announcement")}
      </div>

      <div className="bg-olive-600">
        <div className="mx-auto flex max-w-shop items-center gap-3 px-4 py-3 md:gap-6 md:px-6 md:py-3">
          <Link href="/" className="flex shrink-0 items-center">
            <BrandLogo height={52} priority />
          </Link>

          <div className="hidden flex-1 md:block">
            <HeaderSearch variant="dark" />
          </div>

            <div className="ms-auto flex items-center gap-2 md:gap-4">
            <LanguageSwitcher />
            {!pathname.startsWith("/admin") && (
              <>
                <button
                  type="button"
                  onClick={toggleCart}
                  className="relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center text-white transition hover:text-accent-orange"
                  aria-label={th("cart")}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {count > 0 && (
                    <span className="absolute -end-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-orange px-1 text-[10px] font-bold text-olive-950">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                  <span className="hidden text-[10px] font-medium uppercase lg:block">{th("cart")}</span>
                </button>
              </>
            )}
            <button
              type="button"
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded p-2 text-white lg:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      <StripeBar />

      <nav className="hidden border-b border-olive-700/30 bg-olive-600 lg:block">
        <ul className="mx-auto flex max-w-shop flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-2.5">
          {navLinks.map((l) => {
            const base = l.href.split("?")[0];
            const active = pathname === base;
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={active ? "shop-nav-link-active shop-nav-link" : "shop-nav-link"}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
          <li>
            <GFMMenu />
          </li>
          <li>
            <Link href="/contact" className="shop-nav-link font-bold text-accent-orange">
              {t("quote")}
            </Link>
          </li>
        </ul>
      </nav>

      {open && (
        <nav className="border-b border-olive-700/30 bg-olive-600 px-4 py-4 lg:hidden max-h-[calc(100vh-110px)] overflow-y-auto">
          <div className="mb-4 md:hidden">
            <HeaderSearch variant="dark" />
          </div>
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="block min-h-[44px] border-b border-white/10 py-3 text-sm font-semibold uppercase tracking-wider text-white"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <MobileGFMMenu onClose={() => setOpen(false)} />
        </nav>
      )}
    </header>
  );
}
