import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkLabel: string | null;
}

export default function PromoStrip({ banners }: { banners: Banner[] }) {
  if (!banners.length) return null;

  const gridClass =
    banners.length === 1 ? "grid-cols-1"
    : banners.length === 2 ? "grid-cols-1 sm:grid-cols-2"
    : banners.length === 3 ? "grid-cols-1 sm:grid-cols-3"
    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="bg-white py-6 border-b border-gray-100">
      <div className={`max-w-[1400px] mx-auto px-4 sm:px-6 grid ${gridClass} gap-4`}>
        {banners.map((b) => (
          <div key={b.id} className="relative rounded-2xl overflow-hidden group bg-gray-100 aspect-[16/6]">
            <Image
              src={b.imageUrl}
              alt={b.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex items-center px-5 sm:px-6">
              <div className="max-w-xs">
                <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug mb-1 drop-shadow">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-white/75 text-xs sm:text-sm mb-3 leading-relaxed">{b.subtitle}</p>
                )}
                {b.linkUrl && (
                  <Link href={b.linkUrl}
                    className="inline-flex items-center gap-1.5 h-8 px-4 bg-white text-gray-900 font-bold text-xs rounded-lg hover:bg-blue-600 hover:text-white transition-colors">
                    {b.linkLabel || "View More"}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
