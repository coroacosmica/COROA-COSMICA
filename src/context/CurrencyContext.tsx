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
  formatProductPrice: (product: { price?: number; prices?: Record<string, number>; discount_percentage?: number }) => string;
  calculateDiscountedPrice: (product: { price?: number; prices?: Record<string, number>; discount_percentage?: number }) => number;
  getRawPrice: (product: { price?: number; prices?: Record<string, number> }) => number;
  formatLocalPrice: (amount: number) => string;
  overrideCurrencyByCountry: (countryCode: string) => void;
  isLoading: boolean;
}

const defaultContext: CurrencyContextType = {
  currency: "USD",
  symbol: "$",
  region: "usa",
  convertPrice: (a) => a,
  formatPrice: (a) => `$${a.toFixed(2)}`,
  formatProductPrice: (p) => `$${(p.price ?? 0).toFixed(2)}`,
  calculateDiscountedPrice: (p) => p.price ?? 0,
  getRawPrice: (p) => p.price ?? 0,
  formatLocalPrice: (a) => `$${a.toFixed(2)}`,
  overrideCurrencyByCountry: () => {},
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
    currency: "EUR",
    symbol: "€",
    region: "europe",
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

        let currency: CurrencyCode = "EUR";
        let symbol = "€";
        let region: RegionCode = "europe";

        if (country === "EG") {
          currency = "EGP";
          symbol = "ج.م";
          region = "egypt";
        } else if (country === "SA") {
          currency = "SAR";
          symbol = "ر.س";
          region = "saudi-arabia";
        } else if (country === "AE") {
          currency = "AED";
          symbol = "د.إ";
          region = "uae";
        } else if (country === "US") {
          currency = "USD";
          symbol = "$";
          region = "usa";
        } else if (EU_COUNTRIES.includes(country)) {
          currency = "EUR";
          symbol = "€";
          region = "europe";
        }

        const newData = { currency, symbol, region };
        localStorage.setItem("cc_currency_data", JSON.stringify({ data: newData, timestamp: Date.now() }));
        setState({ ...newData, isLoading: false });

      } catch (e) {
        console.error("Failed to detect currency, falling back to EUR", e);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    detectCurrency();
  }, []);

  const overrideCurrencyByCountry = (countryCode: string) => {
    let currency: CurrencyCode = "EUR";
    let symbol = "€";
    let region: RegionCode = "europe";

    if (countryCode === "EG") {
      currency = "EGP";
      symbol = "ج.م";
      region = "egypt";
    } else if (countryCode === "SA") {
      currency = "SAR";
      symbol = "ر.س";
      region = "saudi-arabia";
    } else if (countryCode === "AE") {
      currency = "AED";
      symbol = "د.إ";
      region = "uae";
    } else if (countryCode === "US") {
      currency = "USD";
      symbol = "$";
      region = "usa";
    } else if (EU_COUNTRIES.includes(countryCode)) {
      currency = "EUR";
      symbol = "€";
      region = "europe";
    }

    setState(prev => ({ ...prev, currency, symbol, region }));
  };

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

  // Get the raw price in the current currency BEFORE discount
  const getRawPrice = (product: { price?: number; prices?: Record<string, number> }) => {
    if (product.prices && typeof product.prices[state.currency] === "number" && product.prices[state.currency] > 0) {
      return product.prices[state.currency];
    }
    return convertPrice(product.price ?? 0);
  };

  // Get the raw price in the current currency AFTER discount
  const calculateDiscountedPrice = (product: { price?: number; prices?: Record<string, number>; discount_percentage?: number }) => {
    const raw = getRawPrice(product);
    if (product.discount_percentage && product.discount_percentage > 0) {
      return raw * (1 - product.discount_percentage / 100);
    }
    return raw;
  };

  // Format a local currency amount natively
  const formatLocalPrice = (localAmount: number) => {
    if (state.currency === "USD" || state.currency === "SAR" || state.currency === "AED") {
      return locale === "ar" ? "قريباً" : "Coming Soon";
    }
    const sym = getDynamicSymbol(state.currency);
    if (state.currency === "EGP" || state.currency === "SAR" || state.currency === "AED") {
      return `${localAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${sym}`;
    }
    return `${sym}${localAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPrice = (amountInUSD: number) => {
    return formatLocalPrice(convertPrice(amountInUSD));
  };

  const formatProductPrice = (product: { price?: number; prices?: Record<string, number>; discount_percentage?: number }) => {
    return formatLocalPrice(calculateDiscountedPrice(product));
  };

  return (
    <CurrencyContext.Provider value={{ ...state, convertPrice, formatPrice, formatProductPrice, calculateDiscountedPrice, getRawPrice, formatLocalPrice, overrideCurrencyByCountry }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
