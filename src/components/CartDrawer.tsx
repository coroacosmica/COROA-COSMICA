"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { formatPrice } from "@/lib/currency";
import type { Locale } from "@/i18n/routing";
import { buildCartMessage, whatsappLink, mailtoLink } from "@/lib/checkout";
import { WHATSAPP_NUMBERS } from "@/lib/brand";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const tc = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, openCart, removeItem, updateQuantity, total, count, clearCart } = useCart();
  const currencyState = useCurrency();
  const [showWhatsAppPicker, setShowWhatsAppPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"cart" | "branding" | "checkout" | "success">("cart");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    contactMethod: "whatsapp",
  });
  const [brandingData, setBrandingData] = useState({
    notes: "",
    color: "",
    requestSample: false,
  });
  const [brandingFile, setBrandingFile] = useState<File | null>(null);
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File too large. Max 10MB.");
        return;
      }
      setBrandingFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setLogoBase64(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Reset states when the drawer closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep("cart");
        setIsSubmitting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("openCart=true")) {
      openCart();
      // Remove the parameter from the URL cleanly
      const url = new URL(window.location.href);
      url.searchParams.delete("openCart");
      window.history.replaceState({}, "", url.toString() || "/");
    }
  }, [openCart]);

  if (!isOpen) return null;

  const message = buildCartMessage(items, locale, (key, values) =>
    tc(key as "greeting", values as Record<string, string>)
  );

  const hasGfmItems = items.some(item => item.code.startsWith("GFM-") || item.category?.startsWith("gfm-"));

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={closeCart}
        aria-label="Close cart"
      />
      <aside
        className="fixed end-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        role="dialog"
        aria-label={t("title")}
      >
        <div className="flex items-center justify-between border-b border-olive-200 bg-olive-600 px-4 py-4 text-white">
          <h2 className="text-lg font-semibold">
            {t("title")} ({count})
          </h2>
          <button
            type="button"
            onClick={closeCart}
            className="flex h-11 w-11 items-center justify-center rounded hover:bg-white/10"
            aria-label="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-neutral-500">{t("empty")}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.code}
                  className="flex gap-3 border border-olive-100 bg-white p-3"
                >
                  <div className="relative h-20 w-20 shrink-0 bg-neutral-50">
                    {item.customDesign ? (
                      <img
                        src={item.customDesign.pngDataUrl}
                        alt={item.name}
                        className="object-contain p-1 h-full w-full"
                      />
                    ) : (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="80px"
                        quality={95}
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.code}</p>
                    <p className="mt-1 text-sm font-semibold text-olive-700">
                      {currencyState.formatPrice(item.quantity * (item.price ?? 0))}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center border border-olive-200 text-lg"
                        onClick={() => updateQuantity(item.code, item.quantity - 1)}
                        aria-label="-"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center border border-olive-200 text-lg"
                        onClick={() => updateQuantity(item.code, item.quantity + 1)}
                        aria-label="+"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        className="ms-auto text-xs text-red-600 hover:underline"
                        onClick={() => removeItem(item.code)}
                      >
                        {t("remove")}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && step !== "success" && (
          <div className="border-t border-olive-200 bg-neutral-50 p-4">
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span>{t("total")}</span>
              <span className="text-olive-700">{currencyState.formatPrice(total)}</span>
            </div>

            {step === "cart" && (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setStep("branding")}
                  className="btn-primary w-full min-h-[44px]"
                >
                  {t("proceedToBranding")}
                </button>
                {!hasGfmItems && (
                  <button
                    type="button"
                    onClick={() => setStep("checkout")}
                    className="rounded border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 min-h-[44px] hover:bg-neutral-50 transition-colors"
                  >
                    {t("buyWithoutBranding")}
                  </button>
                )}
              </div>
            )}

            {step === "branding" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-neutral-900">
                  {hasGfmItems ? "Custom Design Required for GFM Products" : tc("addBrandingOptional")}
                </h3>
                
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">{tc("uploadLogoLabel")}</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.eps,.ai"
                    onChange={handleFileChange}
                    className="w-full text-xs"
                  />
                  {brandingFile && <p className="mt-1 text-xs text-green-600">{tc("fileAttached")} {brandingFile.name}</p>}
                </div>
                
                <textarea
                  placeholder={tc("brandingNotes")}
                  value={brandingData.notes}
                  onChange={(e) => setBrandingData({ ...brandingData, notes: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm min-h-[80px]"
                />
                
                <input
                  type="text"
                  placeholder={tc("colorPreference")}
                  value={brandingData.color}
                  onChange={(e) => setBrandingData({ ...brandingData, color: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                
                <label className="flex items-start gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={brandingData.requestSample}
                    onChange={(e) => setBrandingData({ ...brandingData, requestSample: e.target.checked })}
                    className="mt-1"
                  />
                  <span className="text-sm text-neutral-700">
                    {tc("requestSample")}
                    <br />
                    <span className="text-xs text-neutral-500">{tc("sampleNoteInfo")}</span>
                  </span>
                </label>

                <div className="flex gap-2 pt-4">
                  {!hasGfmItems && (
                    <button
                      type="button"
                      onClick={() => {
                        setStep("checkout");
                      }}
                      className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
                    >
                      {tc("skipUseStandard")}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (hasGfmItems && !brandingFile && !brandingData.notes && !logoBase64) {
                        alert("Please upload a file or add design notes for your GFM products.");
                        return;
                      }
                      setStep("checkout");
                    }}
                    className="btn-primary flex-1 min-h-[44px]"
                  >
                    {tc("continueToCheckout")}
                  </button>
                </div>
              </div>
            )}

            {step === "checkout" && (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    let fileUrl = "";
                    if (brandingFile) {
                      const supabase = createClient();
                      const fileExt = brandingFile.name.split('.').pop();
                      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                      const { data, error } = await supabase.storage
                        .from('branding')
                        .upload(fileName, brandingFile);
                      
                      if (error) {
                        console.error('Error uploading file:', error);
                        fileUrl = logoBase64 || "";
                      } else if (data) {
                        const { data: publicUrlData } = supabase.storage.from('branding').getPublicUrl(data.path);
                        fileUrl = publicUrlData.publicUrl;
                      }
                    }

                    const supabaseClient = createClient();
                    const processedItems = await Promise.all(items.map(async (item) => {
                      if (item.customDesign?.pngDataUrl.startsWith("data:image")) {
                        try {
                          const res = await fetch(item.customDesign.pngDataUrl);
                          const blob = await res.blob();
                          const fileName = `design-${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
                          const { data, error } = await supabaseClient.storage.from('branding').upload(fileName, blob);
                          if (error || !data) {
                            throw new Error("Supabase upload failed");
                          }
                          const { data: publicUrlData } = supabaseClient.storage.from('branding').getPublicUrl(data.path);
                          // Strip out stateJson to save payload size for the Vercel API
                          return { 
                            ...item, 
                            customDesign: { 
                              pngDataUrl: publicUrlData.publicUrl 
                            } 
                          };
                        } catch (e) {
                          console.error("Failed to upload custom design", e);
                          throw new Error("Failed to process custom design images. Please check your connection or contact support.");
                        }
                      }
                      return item;
                    }));

                    const res = await fetch("/api/quote", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        items: processedItems,
                        locale,
                        currencyInfo: {
                          currency: currencyState.currency,
                          region: currencyState.region,
                          totalAmount: currencyState.convertPrice(total),
                        },
                        customer: {
                          name: formData.name,
                          email: formData.email,
                          phone: formData.phone,
                          company: formData.company,
                          location: formData.location,
                        },
                        contactMethod: formData.contactMethod,
                        branding: {
                          fileUrl: fileUrl || logoBase64,
                          notes: brandingData.notes,
                          color: brandingData.color,
                          requestSample: brandingData.requestSample,
                        }
                      }),
                    });

                    if (res.ok) {
                      setStep("success");
                      clearCart(); 
                    } else {
                      alert(tc("errorFailed"));
                    }
                  } catch (err) {
                    console.error(err);
                    alert(tc("errorNetwork"));
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder={tc("formName")}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder={tc("formPhone")}
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder={tc("formEmail")}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder={tc("formLocation")}
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder={tc("formCompany")}
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <div className="rounded bg-white p-3 border border-olive-100">
                  <p className="mb-2 text-xs font-semibold text-olive-900">{tc("contactMethod")}</p>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="whatsapp"
                        checked={formData.contactMethod === "whatsapp"}
                        onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      />
                      {tc("whatsapp")}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={formData.contactMethod === "email"}
                        onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      />
                      {tc("email")}
                    </label>
                  </div>
                </div>

                <div className="rounded bg-orange-50 p-3 text-xs text-orange-800 border border-orange-100">
                  {tc("shippingNote")}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep("branding")}
                    className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
                  >
                    {tc("back")}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 min-h-[44px]"
                  >
                    {isSubmitting ? tc("submitting") : tc("submitOrder")}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {step === "success" && (
          <div className="border-t border-olive-200 bg-green-50 p-8 text-center flex-1 flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">✅</span>
            <h3 className="text-lg font-bold text-green-800">{tc("successTitle")}</h3>
            <p className="mt-2 text-sm text-green-700">
              {tc("successMsg1", { name: formData.name })}
            </p>
            <p className="mt-2 text-sm text-green-700">
              {tc("successMsg2", { method: formData.contactMethod === "whatsapp" ? tc("whatsapp") : tc("email") })}
            </p>
            <button
              type="button"
              onClick={() => {
                setStep("cart");
                closeCart();
              }}
              className="btn-primary mt-8 w-full"
            >
              {tc("continueShopping")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
