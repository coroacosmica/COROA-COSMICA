"use client";

import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export default function AdminNavbar() {
  const t = useTranslations("admin.navbar");
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <nav className="bg-olive-600 px-4 py-4 shadow-sm md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-4">
            <img 
              src="/images/coroacosmica-logo.png" 
              alt="Coroa Cosmica" 
              className="h-10 w-auto object-contain"
            />
            <img 
              src="/images/gfm-logo.png" 
              alt="GFM Advertising" 
              className="h-10 w-auto object-contain"
            />
          </Link>
          <div className="hidden space-x-4 md:block">
            <Link href="/admin" className="text-neutral-300 hover:text-white">
              {t("dashboard")}
            </Link>
            <Link href="/" className="text-neutral-300 hover:text-white" target="_blank">
              {t("viewSite")}
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-500 hover:text-red-400"
        >
          {t("logout")}
        </button>
      </div>
    </nav>
  );
}
