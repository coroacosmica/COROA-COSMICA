"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useState } from "react";

export default function MobileGFMMenu({ onClose }: { onClose: () => void }) {
  const t = useTranslations("gfm");
  const [isOpen, setIsOpen] = useState(false);

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
    <div className="border-b border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full min-h-[44px] items-center justify-between py-3 text-sm font-semibold uppercase tracking-wider text-white"
      >
        <span>{t("menuTitle")}</span>
        <svg
          className={`h-5 w-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="flex flex-col space-y-4 pb-4 pt-1">
          {structure.map((section, idx) => (
            <div key={idx} className="flex flex-col ps-3 border-s border-white/20 ms-1">
              <Link
                href={section.link}
                className="mb-2 text-sm font-bold text-accent-orange"
                onClick={onClose}
              >
                {section.title}
              </Link>
              <ul className="flex flex-col space-y-2">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <Link
                      href={item.link}
                      className={`block text-xs text-white/80 transition hover:text-white ${
                        item.isSubParent
                          ? "font-semibold text-white/90 mt-2"
                          : item.indent
                          ? "ms-3"
                          : ""
                      }`}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
