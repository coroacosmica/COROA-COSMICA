"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import ProductCard from "./ProductCard";
import type { Product } from "@/lib/products";
import { CATEGORY_IDS } from "@/lib/products";
import { clsx } from "clsx";

type SortKey = "newest" | "price-low" | "price-high" | "popular";

function buildCatalogueQuery(opts: {
  query: string;
  category: string;
  setsOnly: boolean;
  page: number;
  sort: SortKey;
  view: string;
}): string {
  const params = new URLSearchParams();
  if (opts.query.trim()) params.set("q", opts.query.trim());
  if (opts.category !== "all") params.set("category", opts.category);
  if (opts.setsOnly) params.set("setsOnly", "1");
  if (opts.page > 1) params.set("page", String(opts.page));
  if (opts.sort !== "popular") params.set("sort", opts.sort);
  if (opts.view === "list") params.set("view", "list");
  const s = params.toString();
  return s ? `?${s}` : "";
}

export default function CatalogueClient({ allProducts }: { allProducts: Product[] }) {
  const t = useTranslations("catalogue");
  const tc = useTranslations("categories");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [setsOnly, setSetsOnly] = useState(searchParams.get("setsOnly") === "1");
  const [sort, setSort] = useState<SortKey>(
    (searchParams.get("sort") as SortKey) || "popular"
  );
  const [listView, setListView] = useState(searchParams.get("view") === "list");
  const [page, setPage] = useState(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(p) && p > 0 ? p : 1;
  });
  const pageSize = 24;

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
    const q = searchParams.get("q");
    if (q !== null) setQuery(q);
    setSetsOnly(searchParams.get("setsOnly") === "1");
    const p = parseInt(searchParams.get("page") || "1", 10);
    setPage(Number.isFinite(p) && p > 0 ? p : 1);
    const s = searchParams.get("sort") as SortKey;
    if (s) setSort(s);
    setListView(searchParams.get("view") === "list");
  }, [searchParams]);

  const syncUrl = useCallback(
    (next: Partial<{
      query: string;
      category: string;
      setsOnly: boolean;
      page: number;
      sort: SortKey;
      view: string;
    }>) => {
      const q = buildCatalogueQuery({
        query: next.query ?? query,
        category: next.category ?? category,
        setsOnly: next.setsOnly ?? setsOnly,
        page: next.page ?? page,
        sort: next.sort ?? sort,
        view: next.view ?? (listView ? "list" : "grid"),
      });
      router.replace(`${pathname}${q}`, { scroll: false });
    },
    [query, category, setsOnly, page, sort, listView, pathname, router]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    let list = allProducts;
    if (category !== "all") list = list.filter((p) => p.category === category);
    if (setsOnly) list = list.filter((p) => p.type === "set" || p.includes.length > 0);
    if (q) {
      list = list.filter((p) => {
        const names = [p.names?.pt, p.names?.en, p.names?.ar].filter(Boolean).join(" ");
        return (
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          names.toLowerCase().includes(q) ||
          p.includes.some((i) => i.toLowerCase().includes(q))
        );
      });
    }
    const sorted = [...list];
    if (sort === "price-low" || sort === "price-high") {
      sorted.sort((a, b) => a.code.localeCompare(b.code));
      if (sort === "price-high") sorted.reverse();
    } else if (sort === "newest") {
      sorted.reverse();
    } else {
      sorted.sort((a, b) => {
        const af = a.featured || a.tags?.includes("featured") ? 1 : 0;
        const bf = b.featured || b.tags?.includes("featured") ? 1 : 0;
        return bf - af;
      });
    }
    return sorted;
  }, [allProducts, query, category, setsOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const catalogueReturnTo = `/catalogue${buildCatalogueQuery({
    query,
    category,
    setsOnly,
    page: safePage,
    sort,
    view: listView ? "list" : "grid",
  })}`;

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <aside className="lg:w-56 lg:shrink-0">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-olive-800">
          {t("sidebar")}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-600">{t("filter")}</label>
            <select
              value={category}
              onChange={(e) => {
                const v = e.target.value;
                setCategory(v);
                setPage(1);
                syncUrl({ category: v, page: 1 });
              }}
              className="input-field"
            >
              <option value="all">{t("all")}</option>
              {CATEGORY_IDS.map((cat) => (
                <option key={cat} value={cat}>
                  {tc(cat as "vip-sets")}
                </option>
              ))}
            </select>
          </div>
          <label className="flex min-h-[44px] items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={setsOnly}
              onChange={(e) => {
                const v = e.target.checked;
                setSetsOnly(v);
                setPage(1);
                syncUrl({ setsOnly: v, page: 1 });
              }}
              className="rounded border-olive-300 accent-olive-600"
            />
            {t("setsOnly")}
          </label>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              const v = e.target.value;
              setQuery(v);
              setPage(1);
              syncUrl({ query: v, page: 1 });
            }}
            placeholder={t("search")}
            className="input-field flex-1"
          />
          <select
            value={sort}
            onChange={(e) => {
              const v = e.target.value as SortKey;
              setSort(v);
              syncUrl({ sort: v });
            }}
            className="input-field md:w-48"
            aria-label={t("sortBy")}
          >
            <option value="popular">{t("sortPopular")}</option>
            <option value="newest">{t("sortNewest")}</option>
            <option value="price-low">{t("sortPriceLow")}</option>
            <option value="price-high">{t("sortPriceHigh")}</option>
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setListView(false);
                syncUrl({ view: "grid" });
              }}
              className={clsx(
                "min-h-[44px] flex-1 border px-3 text-sm font-medium md:flex-none",
                !listView
                  ? "border-olive-600 bg-olive-600 text-white"
                  : "border-olive-200 text-olive-700"
              )}
            >
              {t("gridView")}
            </button>
            <button
              type="button"
              onClick={() => {
                setListView(true);
                syncUrl({ view: "list" });
              }}
              className={clsx(
                "min-h-[44px] flex-1 border px-3 text-sm font-medium md:flex-none",
                listView
                  ? "border-olive-600 bg-olive-600 text-white"
                  : "border-olive-200 text-olive-700"
              )}
            >
              {t("listView")}
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm text-neutral-500">
          {t("productsFound", { count: filtered.length })}
        </p>

        {items.length === 0 ? (
          <p className="mt-12 text-center text-neutral-500">{t("noResults")}</p>
        ) : (
          <div
            className={clsx(
              "mt-8",
              listView
                ? "flex flex-col gap-4"
                : "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4"
            )}
          >
            {items.map((p) => (
              <ProductCard
                key={p.code}
                product={p}
                catalogueReturnTo={catalogueReturnTo}
                listView={listView}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex justify-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => {
                const next = safePage - 1;
                setPage(next);
                syncUrl({ page: next });
              }}
              className="min-h-[44px] border border-olive-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              ←
            </button>
            <span className="flex min-h-[44px] items-center px-4 text-sm text-neutral-600">
              {safePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => {
                const next = safePage + 1;
                setPage(next);
                syncUrl({ page: next });
              }}
              className="min-h-[44px] border border-olive-300 px-4 py-2 text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
