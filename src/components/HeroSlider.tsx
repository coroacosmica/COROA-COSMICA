"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export type HeroSlide = {
  title?: string;
  subtitle?: string;
  image: string;
  href: string;
  isBanner?: boolean;
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
    <section className="relative w-full overflow-hidden bg-neutral-100">
      <div className="relative mx-auto aspect-[16/10] sm:aspect-[16/9] md:aspect-[18/8] min-h-[380px] md:min-h-[500px] max-h-[620px] w-full overflow-hidden">
        {slides.map((s, i) => (
          <div
            key={s.href + i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100 z-10" : "pointer-events-none opacity-0 z-0"
            }`}
          >
            <Link href={s.href} className="relative block h-full w-full overflow-hidden">
              {s.isBanner ? (
                <>
                  {/* Seamless matching ambient color backdrop that expands across the entire width without any black */}
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      aria-hidden="true"
                      className="object-cover scale-125 blur-3xl opacity-80 pointer-events-none"
                      priority={false}
                    />
                    <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  </div>

                  {/* 100% complete poster in center - zero clipping at top or bottom */}
                  <div className="relative mx-auto h-full w-full max-w-shop flex items-center justify-center">
                    <Image
                      src={s.image}
                      alt={s.title || "Special Offer"}
                      fill
                      unoptimized={s.image.endsWith(".svg")}
                      className="object-contain object-center drop-shadow-xl"
                      sizes="100vw"
                      quality={100}
                      priority={i === 0}
                    />
                  </div>
                </>
              ) : (
                <div className="relative mx-auto h-full w-full max-w-shop bg-white">
                  <Image
                    src={s.image}
                    alt={s.title || "Product"}
                    fill
                    unoptimized={s.image.endsWith(".svg")}
                    className="object-cover object-center"
                    sizes="100vw"
                    quality={95}
                    priority={i === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/50 to-transparent" />
                </div>
              )}
            </Link>

            {!s.isBanner && s.title && (
              <div className="pointer-events-none absolute inset-0 flex items-center">
                <div className="pointer-events-auto mx-auto w-full max-w-shop px-8 md:px-12">
                  <Link href={s.href} className="group inline-block">
                    <h2 className="font-display text-3xl font-light tracking-[0.25em] text-neutral-900 md:text-5xl">
                      {s.title}
                    </h2>
                    {s.subtitle && (
                      <p className="mt-2 text-sm uppercase tracking-widest text-neutral-600 group-hover:text-accent-orange">
                        {s.subtitle}
                      </p>
                    )}
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute start-3 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 md:start-6"
              aria-label="Previous"
            >
              <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute end-3 top-1/2 z-20 -translate-y-1/2 flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md shadow-lg transition-all hover:scale-105 active:scale-95 md:end-6"
              aria-label="Next"
            >
              <svg className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-md shadow-md">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? "w-7 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
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
