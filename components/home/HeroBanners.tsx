"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
  sortOrder: number;
}

export default function HeroBannerSlider({ banners }: { banners: Banner[] }) {
  const [idx, setIdx]       = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef            = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIdx((p) => (p + 1) % banners.length);
    }, 5000);
  }, [banners.length]);

  useEffect(() => {
    if (!paused && banners.length > 1) start();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, start, banners.length]);

  if (!banners.length) return null;

  const banner = banners[idx];

  function prev() { setIdx((p) => (p - 1 + banners.length) % banners.length); start(); }
  function next() { setIdx((p) => (p + 1) % banners.length); start(); }

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {banners.map((b, i) => (
        <div
          key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <Image
            src={b.imageUrl}
            alt={b.title}
            fill
            className="object-cover"
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content overlay */}
      <div className="relative z-20 flex items-end min-h-[240px] sm:min-h-[340px] lg:min-h-[420px]">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-2 drop-shadow-lg">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="text-sm sm:text-base text-white/80 mb-4 leading-relaxed">{banner.subtitle}</p>
            )}
            {banner.linkUrl && (
              <Link
                href={banner.linkUrl}
                className="inline-flex items-center gap-2 h-10 sm:h-11 px-5 sm:px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
              >
                {banner.linkLabel || "Explore Now"}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} aria-label="Previous"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} aria-label="Next"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-black/40 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors backdrop-blur-sm">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5">
            {banners.map((_, i) => (
              <button key={i} onClick={() => { setIdx(i); start(); }} aria-label={`Slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${i === idx ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"}`} />
            ))}
          </div>

          {!paused && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 z-30 overflow-hidden">
              <div key={`prog-${idx}`} className="h-full bg-blue-400" style={{ animation: "banner-progress 5s linear forwards" }} />
            </div>
          )}
        </>
      )}

      <style>{`@keyframes banner-progress { from { width: 0% } to { width: 100% } }`}</style>
    </div>
  );
}
