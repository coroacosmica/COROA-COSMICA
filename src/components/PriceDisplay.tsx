"use client";

import { useCurrency } from "@/context/CurrencyContext";

export default function PriceDisplay({ amount }: { amount: number }) {
  const { formatPrice, isLoading } = useCurrency();
  
  if (isLoading) return <span className="animate-pulse bg-neutral-200 text-transparent rounded">00.00</span>;
  return <span>{formatPrice(amount)}</span>;
}
