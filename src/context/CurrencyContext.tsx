"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocale } from "next-intl";

export type CurrencyCode = "USD" | "EGP" | "EUR" | "SAR" | "AED";
export type RegionCode = "usa" | "egypt" | "europe" | "saudi";

interface CurrencyContextType {
  currency: CurrencyCode;
  symbol: string;
  region: RegionCode;
  convertPrice: (amountInUSD: number) => number;
  formatPrice: (amountInUSD: number) => string;
  formatProductPrice: (product: { price?: number; prices?: Record<string, number> }) => string;
  isLoading: boolean;
}

const defaultContext: CurrencyContextType = {
  currency: "USD",
  symbol: "$",
  region: "usa",
  convertPrice: (a) => a,
  formatPrice: (a) => `$${a.toFixed(2)}`,
  formatProductPrice: (p) => `$${(p.price ?? 0).toFixed(2)}`,
  isLoading: true,
};

const CurrencyContext = createContext<CurrencyContextType>(defaultContext);

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  USD: 1.0,
  EGP: 48.5,
  EUR: 0.92,
  SAR: 3.75,
  AED: 3.67,
};

const EU_COUNTRIES = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","GB","CH","NO"];
const GULF_COUNTRIES = ["QA", "KW", "BH", "OM"];

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [state, setState] = useState<{ currency: CurrencyCode; symbol: string; region: RegionCode; isLoading: boolean }>({
    currency: "USD",
    symbol: "$",
    region: "usa",
    isLoading: true,
  });

  useEffect(() => {
    const detectCurrency = async () => {
      try {
        const cached = localStorage.getItem("cc_currency_data");
        if (cached) {
          const parsed = JSON.parse(cached);
          const age = Date.now() - parsed.timestamp;
          if (age < 24 * 60 * 60 * 1000) {
            setState({ ...parsed.data, isLoading: false });
            return;
          }
        }

        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const country = data.country_code;

        let currency: CurrencyCode = "USD";
        let symbol = "$";
        let region: RegionCode = "usa";

        if (country === "EG") {
          currency = "EGP";
          symbol = "ج.م";
          region = "egypt";
        } else if (country === "SA") {
          currency = "SAR";
          symbol = "ر.س";
          region = "saudi";
        } else if (country === "AE") {
          currency = "AED";
          symbol = "د.إ";
          region = "saudi";
        } else if (GULF_COUNTRIES.includes(country)) {
          currency = "SAR";
          symbol = "ر.س";
          region = "saudi";
        } else if (EU_COUNTRIES.includes(country)) {
          currency = "EUR";
          symbol = "€";
          region = "europe";
        } else if (country === "US" || country === "CA") {
          currency = "USD";
          symbol = "$";
          region = "usa";
        }

        const newData = { currency, symbol, region };
        localStorage.setItem("cc_currency_data", JSON.stringify({ data: newData, timestamp: Date.now() }));
        setState({ ...newData, isLoading: false });

      } catch (e) {
        console.error("Failed to detect currency, falling back to USD", e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    detectCurrency();
  }, []);

  const convertPrice = (amountInUSD: number) => {
    // Check if there are env overrides, else use static dictionary
    const rate = EXCHANGE_RATES[state.currency] || 1;
    return Number((amountInUSD * rate).toFixed(2));
  };

  // Get dynamic symbol based on language and currency
  const getDynamicSymbol = (curr: CurrencyCode) => {
    if (curr === "EGP") return locale === "ar" ? "ج.م" : "EGP";
    if (curr === "SAR") return locale === "ar" ? "ر.س" : "SAR";
    if (curr === "AED") return locale === "ar" ? "د.إ" : "AED";
    return state.symbol; // Default to the originally detected symbol for USD/EUR
  };

  const formatPrice = (amountInUSD: number) => {
    const converted = convertPrice(amountInUSD);
    const sym = getDynamicSymbol(state.currency);
    // Format based on currency
    if (state.currency === "EGP" || state.currency === "SAR" || state.currency === "AED") {
      return `${converted.toLocaleString("en-US")} ${sym}`;
    }
    return `${sym}${converted.toLocaleString("en-US")}`;
  };

  const formatProductPrice = (product: { price?: number; prices?: Record<string, number> }) => {
    const sym = getDynamicSymbol(state.currency);
    if (product.prices && typeof product.prices[state.currency] === "number" && product.prices[state.currency] > 0) {
      const explicitPrice = product.prices[state.currency];
      if (state.currency === "EGP" || state.currency === "SAR" || state.currency === "AED") {
        return `${explicitPrice.toLocaleString("en-US")} ${sym}`;
      }
      return `${sym}${explicitPrice.toLocaleString("en-US")}`;
    }
    return formatPrice(product.price ?? 0);
  };

  return (
    <CurrencyContext.Provider value={{ ...state, convertPrice, formatPrice, formatProductPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
