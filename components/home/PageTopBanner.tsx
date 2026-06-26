"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
}

export default function PageTopBanner({ position }: { position: string }) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    fetch(`/api/banners?position=${position}`)
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d.banners)) setBanners(d.banners); })
      .catch(() => {});
  }, [position]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;

  const b = banners[idx];

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 mb-0">
      <div className="relative w-full max-h-[200px] sm:max-h-[260px] aspect-[16/4]">
        <Image
          src={b.imageUrl}
          alt={b.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent flex items-center">
        <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6">
          <div className="max-w-md">
            <h2 className="text-white font-extrabold text-lg sm:text-2xl leading-snug mb-1 drop-shadow">{b.title}</h2>
            {b.subtitle && <p className="text-white/75 text-xs sm:text-sm mb-3">{b.subtitle}</p>}
            {b.linkUrl && (
              <Link href={b.linkUrl}
                className="inline-flex items-center h-8 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors">
                {b.linkLabel || "Explore"}
              </Link>
            )}
          </div>
        </div>
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? "w-5 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}
