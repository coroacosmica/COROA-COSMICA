"use client";

import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

export default function AdminNavbar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  };

  return (
    <nav className="bg-white px-4 py-4 shadow-sm md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="flex items-center gap-2">
            <img 
              src="/images/cropped-logo.png" 
              alt="Coroa Cosmica Admin" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-bold text-olive-900 hidden sm:inline-block">Admin Panel</span>
          </Link>
          <div className="hidden space-x-4 md:block">
            <Link href="/admin" className="text-neutral-600 hover:text-olive-700">
              Dashboard
            </Link>
            <Link href="/" className="text-neutral-600 hover:text-olive-700" target="_blank">
              View Site ↗
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
