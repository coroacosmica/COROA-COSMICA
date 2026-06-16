"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import type { Product } from "@/lib/products";
import { getProductImage } from "@/lib/product-display";
import { buildSampleRequestMessage, whatsappLink, mailtoLink } from "@/lib/checkout";
import { WHATSAPP_NUMBERS } from "@/lib/brand";
import type { Locale } from "@/i18n/routing";

export default function ProductLogoViewer({
  product,
  productName,
}: {
  product: Product;
  productName: string;
}) {
  const t = useTranslations("product");
  const tc = useTranslations("checkout");
  const locale = useLocale() as Locale;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [logoPos, setLogoPos] = useState({ x: 50, y: 40 });
  const [logoSize, setLogoSize] = useState(80);
  const [dragging, setDragging] = useState(false);
  const [rotating, setRotating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateStart = useRef({ x: 0, y: 0, r: 0 });

  const productSrc = getProductImage(product);

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  };

  const onPointerDownLogo = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (dragging) {
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setLogoPos({
          x: Math.max(5, Math.min(95, x)),
          y: Math.max(5, Math.min(95, y)),
        });
      }
      if (rotating) {
        const dx = e.clientX - rotateStart.current.x;
        setRotation(rotateStart.current.r + dx * 0.5);
      }
    },
    [dragging, rotating]
  );

  const onPointerUp = () => {
    setDragging(false);
    setRotating(false);
  };

  const sampleMessage = buildSampleRequestMessage(
    productName,
    product.code,
    locale,
    (key) => tc(key as "greeting")
  );

  return (
    <section className="mt-12 border border-olive-200 bg-olive-50/50 p-6">
      <h2 className="section-title text-xl">{t("seeWithLogo")}</h2>
      <p className="mt-2 text-sm text-neutral-600">{t("logoOverlayHint")}</p>

      <div className="mt-4 flex flex-wrap gap-3">
        <label className="btn-primary cursor-pointer">
          {t("uploadLogo")}
          <input type="file" accept="image/*" className="hidden" onChange={onLogoUpload} />
        </label>
      </div>

      <div
        ref={containerRef}
        className="relative mx-auto mt-6 aspect-square max-w-2xl overflow-hidden bg-white shadow-inner"
        style={{ perspective: "800px" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div
          className="relative h-full w-full transition-transform duration-100"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transformStyle: "preserve-3d",
          }}
          onPointerDown={(e) => {
            if ((e.target as HTMLElement).closest("[data-logo]")) return;
            setRotating(true);
            rotateStart.current = { x: e.clientX, y: e.clientY, r: rotation };
          }}
        >
          <Image
            src={productSrc}
            alt={productName}
            fill
            quality={95}
            className="object-contain p-6"
            sizes="(max-width: 768px) 100vw, 800px"
            unoptimized={productSrc.endsWith(".jpg") || productSrc.endsWith(".jpeg")}
          />
          {logoUrl && (
            <div
              data-logo
              className="absolute touch-none cursor-move"
              style={{
                left: `${logoPos.x}%`,
                top: `${logoPos.y}%`,
                width: logoSize,
                height: logoSize,
                transform: "translate(-50%, -50%)",
              }}
              onPointerDown={onPointerDownLogo}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt="Your logo" className="h-full w-full object-contain drop-shadow-md" />
              <input
                type="range"
                min={40}
                max={160}
                value={logoSize}
                onChange={(e) => setLogoSize(Number(e.target.value))}
                className="absolute -bottom-8 start-0 w-full"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
        <p className="absolute bottom-2 start-0 end-0 text-center text-xs text-neutral-500">
          {t("rotateHint")}
        </p>
      </div>

      {logoUrl && (
        <div className="mt-8 flex flex-wrap gap-3">
          <p className="w-full text-sm font-medium text-olive-800">{t("requestSample")}</p>
          {WHATSAPP_NUMBERS.map((w) => (
            <a
              key={w.number}
              href={whatsappLink(w.number, sampleMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary min-h-[44px] bg-[#25D366] hover:bg-[#20bd5a]"
            >
              📱 WhatsApp ({w.label})
            </a>
          ))}
          <a
            href={mailtoLink(tc("emailSubject"), sampleMessage)}
            className="btn-secondary min-h-[44px]"
          >
            📧 Email
          </a>
        </div>
      )}
    </section>
  );
}
