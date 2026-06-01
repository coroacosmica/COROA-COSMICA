"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { clsx } from "clsx";

export default function HeaderSearch({ variant = "light" }: { variant?: "light" | "dark" }) {
  const t = useTranslations("header");
  const router = useRouter();
  const [query, setQuery] = useState("");
  const isDark = variant === "dark";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) router.push(`/catalogue?q=${encodeURIComponent(q)}`);
    else router.push("/catalogue");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={clsx("flex flex-1", isDark ? "md:flex" : "hidden md:flex md:max-w-xl lg:max-w-2xl")}
    >
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="h-11 min-h-[44px] flex-1 border-0 bg-white px-4 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent-orange"
      />
      <button
        type="submit"
        className="flex h-11 min-h-[44px] w-12 shrink-0 items-center justify-center bg-accent-orange text-olive-950 transition hover:bg-accent-orange/90"
        aria-label={t("search")}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
}
