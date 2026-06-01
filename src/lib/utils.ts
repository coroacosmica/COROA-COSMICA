import { type ClassValue, clsx } from "clsx";
import { WHATSAPP_FLOAT } from "./brand";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Strip PDF junk (newlines, extra spaces) from product codes. */
export function normalizeProductCode(code: string): string {
  const line = code.replace(/\r/g, "\n").split("\n")[0].trim();
  return line.replace(/\s+/g, " ").trim();
}

export function slugifyCode(code: string): string {
  return encodeURIComponent(normalizeProductCode(code));
}

export function whatsappUrl(message: string, number = WHATSAPP_FLOAT): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
