"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";

export default function ContactForm() {
  const t = useTranslations("contact");
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "contact",
          name: form.get("name"),
          company: form.get("company"),
          email: form.get("email"),
          phone: form.get("phone"),
          product: form.get("product"),
          quantity: form.get("quantity"),
          message: form.get("message"),
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
      <div className="card p-8 text-center">
        <p className="text-lg font-semibold text-forest-900">{t("success")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-6 md:p-8">
      <input name="name" type="text" placeholder={t("form.name")} className="input-field" required />
      <input name="company" type="text" placeholder={t("form.company")} className="input-field" required />
      <input name="email" type="email" placeholder={t("form.email")} className="input-field" required />
      <input name="phone" type="tel" placeholder={t("form.phone")} className="input-field" />
      <input
        name="product"
        type="text"
        placeholder={t("form.product")}
        className="input-field"
        defaultValue={searchParams.get("product") || ""}
      />
      <input name="quantity" type="text" placeholder={t("form.quantity")} className="input-field" />
      <textarea name="message" placeholder={t("form.message")} className="input-field min-h-[120px]" rows={4} required />
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "..." : t("form.submit")}
      </button>
    </form>
  );
}
