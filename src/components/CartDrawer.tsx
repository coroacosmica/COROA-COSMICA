"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/currency";
import type { Locale } from "@/i18n/routing";
import { buildCartMessage, whatsappLink, mailtoLink } from "@/lib/checkout";
import { WHATSAPP_NUMBERS } from "@/lib/brand";
import { useState, useEffect } from "react";

export default function CartDrawer() {
  const t = useTranslations("cart");
  const tc = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const { items, isOpen, closeCart, openCart, removeItem, updateQuantity, total, count } = useCart();
  const [showWhatsAppPicker, setShowWhatsAppPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    company: "",
    contactMethod: "whatsapp",
  });
  const [logoBase64, setLogoBase64] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File too large. Max 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setLogoBase64(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

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
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                      quality={95}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-900">{item.name}</p>
                    <p className="text-xs text-neutral-500">{item.code}</p>
                    <p className="mt-1 text-sm font-semibold text-olive-700">
                      {formatPrice(item.quantity * (item.price ?? 0), locale)}
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

        {items.length > 0 && !isSubmitted && (
          <div className="border-t border-olive-200 bg-neutral-50 p-4">
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span>{t("total")}</span>
              <span className="text-olive-700">{formatPrice(total, locale)}</span>
            </div>

            {!showCheckoutForm ? (
              <button
                type="button"
                onClick={() => setShowCheckoutForm(true)}
                className="btn-primary w-full min-h-[44px]"
              >
                Proceed to Checkout
              </button>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  try {
                    const res = await fetch("/api/quote", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        items,
                        locale,
                        customer: {
                          name: formData.name,
                          email: formData.email,
                          phone: formData.phone,
                          company: formData.company,
                          location: formData.location,
                        },
                        contactMethod: formData.contactMethod,
                        logoBase64,
                      }),
                    });

                    if (res.ok) {
                      setIsSubmitted(true);
                    } else {
                      alert("Failed to submit order. Please try again.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Network error. Please try again.");
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="space-y-4"
              >
                <input
                  type="text"
                  placeholder="Full Name *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Location / Address *"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Company Name (Optional)"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="input-field w-full rounded border px-3 py-2 text-sm"
                />
                <div>
                  <label className="mb-1 block text-xs text-neutral-600">Upload Logo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-xs"
                  />
                  {logoBase64 && <p className="mt-1 text-xs text-green-600">Logo attached ✓</p>}
                </div>
                
                <div className="rounded bg-white p-3 border border-olive-100">
                  <p className="mb-2 text-xs font-semibold text-olive-900">Preferred Contact Method *</p>
                  <div className="flex gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="whatsapp"
                        checked={formData.contactMethod === "whatsapp"}
                        onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      />
                      WhatsApp
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={formData.contactMethod === "email"}
                        onChange={(e) => setFormData({ ...formData, contactMethod: e.target.value })}
                      />
                      Email
                    </label>
                  </div>
                </div>

                <div className="rounded bg-orange-50 p-3 text-xs text-orange-800 border border-orange-100">
                  <strong>Note:</strong> Shipping fees will be communicated when confirming the order, as it depends on your location.
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCheckoutForm(false)}
                    className="rounded border border-neutral-300 px-4 py-2 text-sm text-neutral-600"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary flex-1 min-h-[44px]"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Order"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {isSubmitted && (
          <div className="border-t border-olive-200 bg-green-50 p-8 text-center flex-1 flex flex-col items-center justify-center">
            <span className="text-5xl mb-4">✅</span>
            <h3 className="text-lg font-bold text-green-800">Order Submitted Successfully!</h3>
            <p className="mt-2 text-sm text-green-700">
              Thank you, <strong>{formData.name}</strong>. We have received your request.
            </p>
            <p className="mt-2 text-sm text-green-700">
              Our team will review your order and contact you shortly via <strong>{formData.contactMethod === "whatsapp" ? "WhatsApp" : "Email"}</strong> to confirm availability and shipping fees.
            </p>
            <button
              type="button"
              onClick={closeCart}
              className="btn-primary mt-8 w-full"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
