"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

export default function AdminLogin() {
  const t = useTranslations("admin.login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-4">
      <div className="card w-full max-w-md bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center gap-4 bg-olive-600 p-4 rounded-lg mb-6 w-full justify-center">
            <img 
              src="/images/coroacosmica-logo.png" 
              alt="Coroa Cosmica" 
              className="h-12 w-auto object-contain"
            />
            <img 
              src="/images/gfm-logo.png" 
              alt="GFM Advertising" 
              className="h-12 w-auto object-contain"
            />
          </div>
          <h1 className="text-center text-2xl font-bold text-olive-900">
            {t("title")}
          </h1>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-olive-500 focus:outline-none"
              placeholder="admin@coroa.com"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              {t("password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-olive-500 focus:outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="btn-primary w-full py-2.5"
            disabled={loading}
          >
            {loading ? t("signingIn") : t("signIn")}
          </button>
        </form>
      </div>
    </div>
  );
}
