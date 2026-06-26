import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { Analytics } from "@vercel/analytics/react";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { LOGO_PATH, BRAND_SHORT } from "@/lib/brand";
import { Inter, Cairo } from "next/font/google";
import { routing, type Locale } from "@/i18n/routing";
import { isRtlLocale } from "@/lib/locales";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ChatBot from "@/components/ChatBot";
import CartDrawer from "@/components/CartDrawer";
import LocaleDetector from "@/components/LocaleDetector";
import MobileCartBar from "@/components/MobileCartBar";
import { CartProvider } from "@/context/CartContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { getAllCategories } from "@/lib/products";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-arabic" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://coroacosmica.vercel.app"),
    title: t("title"),
    description: t("description"),
    icons: { icon: LOGO_PATH, apple: LOGO_PATH },
    openGraph: {
      title: t("title"),
      description: t("description"),
      siteName: BRAND_SHORT,
      images: [{ url: LOGO_PATH }],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const categories = await getAllCategories();
  const dir = isRtlLocale(locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <body
        className={`${inter.variable} ${cairo.variable} min-h-screen bg-white font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <CategoryProvider categories={categories}>
            <CurrencyProvider>
              <CartProvider>
                <LocaleDetector />
                <Header />
                <main className="min-h-[50vh]">{children}</main>
                <Footer />
                <CartDrawer />
                <MobileCartBar />
                <WhatsAppButton />
                <ChatBot />
                <Analytics />
                <AnalyticsTracker />
              </CartProvider>
            </CurrencyProvider>
          </CategoryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
