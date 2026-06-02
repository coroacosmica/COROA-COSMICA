"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { getAllProducts } from "@/lib/products";
import { getProductName, getProductImage } from "@/lib/product-display";
import { whatsappUrl } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

export default function VirtualSampleForm() {
  const t = useTranslations("virtualSample");
  const tWa = useTranslations("whatsapp");
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const preselected = searchParams.get("product") || "";

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [productCode, setProductCode] = useState(preselected);
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    getAllProducts().then((all) => {
      if (mounted) {
        setProducts(
          all.filter((p) => p.type === "set" || p.tags?.includes("featured") || p.image).slice(0, 150)
        );
      }
    });
    return () => { mounted = false; };
  }, []);

  const selectedProduct = products.find((p) => p.code === productCode);
  const previewImage = selectedProduct
    ? getProductImage(selectedProduct)
    : null;

  const onFile = useCallback((file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = (e) => setLogoUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "virtual-sample",
          productCode,
          company,
          email,
          phone,
          notes,
          hasLogo: !!logoUrl,
        }),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
          ✓
        </div>
        <p className="mt-4 text-lg font-semibold text-forest-900">{t("success")}</p>
        <a
          href={whatsappUrl(`${tWa("message")} - ${productCode}`)}
          className="btn-primary mt-6"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("whatsapp")}
        </a>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-cork-300 bg-cork-50/50 p-8 text-center transition hover:border-forest-400 hover:bg-cork-50"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] || null)}
          />
          <p className="font-semibold text-forest-800">{t("upload")}</p>
          <p className="mt-1 text-sm text-cork-600">{t("dragDrop")}</p>
          <p className="mt-2 text-xs text-cork-500">{t("formats")}</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-forest-800">
            {t("selectProduct")}
          </label>
          <select
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            className="input-field"
            required
          >
            <option value="">—</option>
            {products.map((p) => (
              <option key={p.code} value={p.code}>
                {getProductName(p, locale)} ({p.code})
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder={t("company")}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="email"
          placeholder={t("email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />
        <input
          type="tel"
          placeholder={t("phone")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
        />
        <textarea
          placeholder={t("notes")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input-field min-h-[80px]"
          rows={3}
        />

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "..." : t("submit")}
        </button>
      </form>

      <div>
        <h3 className="font-semibold text-forest-900">{t("preview")}</h3>
        <p className="mt-1 text-sm text-cork-600">{t("previewHint")}</p>
        <div className="relative mt-4 aspect-square max-w-md overflow-hidden rounded-2xl bg-cork-100 shadow-inner">
          {previewImage ? (
            <Image
              src={previewImage}
              alt=""
              fill
              className="object-contain p-4"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-cork-500 text-sm">
              {t("selectProduct")}
            </div>
          )}
          {logoUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={logoUrl}
                alt="Logo"
                className="max-h-24 max-w-[70%] object-contain drop-shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
