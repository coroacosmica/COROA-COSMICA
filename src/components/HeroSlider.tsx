"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export type HeroSlide = {
  title: string;
  subtitle?: string;
  image: string;
  href: string;
};

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [count, next]);

  if (count === 0) return null;

  const slide = slides[index];

  return (
    <section className="relative bg-neutral-100">
      <div className="relative mx-auto aspect-[21/9] max-h-[480px] w-full max-w-shop overflow-hidden md:aspect-[21/8]">
        {slides.map((s, i) => (
          <div
            key={s.href + i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image
              src={s.image}
              alt={s.title}
              fill
              unoptimized={s.image.endsWith(".svg")}
              className="object-cover object-center"
              sizes="100vw"
              quality={95}
              priority={i === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-shop px-8 md:px-12">
            <Link href={slide.href} className="group inline-block">
              <h2 className="font-display text-3xl font-light tracking-[0.25em] text-neutral-900 md:text-5xl">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-2 text-sm uppercase tracking-widest text-neutral-600 group-hover:text-accent-orange">
                  {slide.subtitle}
                </p>
              )}
            </Link>
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute start-2 top-1/2 z-10 -translate-y-1/2 p-2 text-neutral-800/70 transition hover:text-neutral-900 md:start-4"
              aria-label="Previous"
            >
              <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute end-2 top-1/2 z-10 -translate-y-1/2 p-2 text-neutral-800/70 transition hover:text-neutral-900 md:end-4"
              aria-label="Next"
            >
              <svg className="h-8 w-8 md:h-10 md:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-2 w-2 rounded-full transition ${
                    i === index ? "bg-neutral-800" : "bg-neutral-400/80"
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
