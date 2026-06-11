"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useState } from "react";

export default function GFMMenu() {
  const t = useTranslations("gfm");
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Grouped structure
  const structure = [
    {
      title: t("indoor"),
      link: "/catalogue?category=gfm-indoor-printing",
      items: [
        { label: t("businessCards"), link: "/catalogue?category=gfm-business-cards" },
        { label: t("flyers"), link: "/catalogue?category=gfm-flyers" },
        { label: t("brochures"), link: "/catalogue?category=gfm-brochures" },
        { label: t("books"), link: "/catalogue?category=gfm-books" },
        { label: t("boxesBags"), link: "/catalogue?category=gfm-boxes-bags" },
        { label: t("invitationCards"), link: "/catalogue?category=gfm-invitation-cards" },
        { label: t("certificates"), link: "/catalogue?category=gfm-certificates" },
        { label: t("events"), link: "/catalogue?category=gfm-events-conferences", isSubParent: true },
        { label: t("rollupBanners"), link: "/catalogue?category=gfm-rollup-banners", indent: true },
        { label: t("popupStands"), link: "/catalogue?category=gfm-popup-stands", indent: true },
        { label: t("conferenceStands"), link: "/catalogue?category=gfm-conference-stands", indent: true },
        { label: t("featherFlags"), link: "/catalogue?category=gfm-feather-flags", indent: true },
        { label: t("eventFlags"), link: "/catalogue?category=gfm-event-flags", indent: true },
        { label: t("idCards"), link: "/catalogue?category=gfm-id-cards", indent: true },
      ],
    },
    {
      title: t("outdoor"),
      link: "/catalogue?category=gfm-outdoor-printing",
      items: [
        { label: t("outdoorSignage"), link: "/catalogue?category=gfm-outdoor-signage" },
        { label: t("buildingFacades"), link: "/catalogue?category=gfm-building-facades" },
        { label: t("shopFronts"), link: "/catalogue?category=gfm-shop-fronts" },
        { label: t("billboards"), link: "/catalogue?category=gfm-billboards" },
        { label: t("outdoorBanners"), link: "/catalogue?category=gfm-outdoor-banners" },
        { label: t("vehicleBranding"), link: "/catalogue?category=gfm-vehicle-branding" },
        { label: t("wayfinding"), link: "/catalogue?category=gfm-wayfinding" },
      ],
    },
    {
      title: t("office"),
      link: "/catalogue?category=gfm-geographic-office",
      items: [
        { label: t("officeSigns"), link: "/catalogue?category=gfm-office-signs" },
        { label: t("directionalSigns"), link: "/catalogue?category=gfm-directional-signs" },
        { label: t("namePlates"), link: "/catalogue?category=gfm-name-plates" },
        { label: t("rubberStamps"), link: "/catalogue?category=gfm-rubber-stamps" },
        { label: t("companyStamps"), link: "/catalogue?category=gfm-company-stamps" },
        { label: t("customSeals"), link: "/catalogue?category=gfm-custom-seals" },
      ],
    },
  ];

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="shop-nav-link flex items-center gap-1 uppercase">
        {t("menuTitle")}
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Mega Menu */}
      <div
        className={`absolute top-full -start-[200px] z-[60] w-max min-w-[700px] transform pt-4 transition-all duration-300 ${
          isOpen ? "translate-y-0 opacity-100 visible" : "translate-y-2 opacity-0 invisible"
        }`}
      >
        <div className="rounded-xl border border-olive-200/50 bg-white p-6 shadow-2xl ring-1 ring-black/5">
          <div className="grid grid-cols-3 gap-8">
            {structure.map((section, idx) => (
              <div key={idx} className="flex flex-col">
                <Link
                  href={section.link}
                  className="mb-4 inline-block font-bold text-olive-950 transition hover:text-accent-orange"
                  onClick={() => setIsOpen(false)}
                >
                  {section.title}
                </Link>
                <ul className="flex flex-col space-y-2.5">
                  {section.items.map((item, itemIdx) => (
                    <li key={itemIdx}>
                      <Link
                        href={item.link}
                        className={`inline-block text-sm transition hover:text-accent-orange ${
                          item.isSubParent
                            ? "font-semibold text-olive-800 mt-2"
                            : item.indent
                            ? "ms-3 text-olive-600"
                            : "text-olive-700"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
