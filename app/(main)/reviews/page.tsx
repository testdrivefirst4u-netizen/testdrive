import type { Metadata } from "next";
import Link from "next/link";
import { Star, ChevronRight, Clock, ArrowRight, Fuel, Gauge, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "Expert Car Reviews 2026 — In-Depth Test Drives | Walley",
  description: "Read unbiased expert reviews of the latest cars, bikes, and EVs in India. Real-world driving impressions, pros & cons, and verdict.",
};

const FEATURED = {
  title: "2026 Tata Curvv EV — Long-Term Review After 10,000 km",
  excerpt: "Six months and 10,000 km later, we put Tata's bold SUV coupé EV through its paces. From Hyderabad's notorious traffic to the Araku mountain roads — here's the unfiltered verdict.",
  category: "Electric",
  rating: 4.3,
  readTime: "12 min",
  author: "Kiran Reddy",
  slug: "tata-curvv-ev-long-term-review",
};

const REVIEWS = [
  { title: "Hyundai Creta N Line — Weekend Drive Review", excerpt: "More than just a cosmetic upgrade? We take the sporty N Line out on twisties to find out.", category: "Cars", rating: 4.1, readTime: "8 min", author: "Priya M.", fuel: "Petrol", power: "140 PS" },
  { title: "Maruti Suzuki Fronx Turbo — City & Highway Test", excerpt: "Punchy turbo engine in a compact crossover body. Impressive real-world fuel efficiency of 19.2 km/l.", category: "Cars", rating: 4.4, readTime: "7 min", author: "Arjun K.", fuel: "Petrol Turbo", power: "100 PS" },
  { title: "Mahindra XUV 3XO AX7 — Long-Range Road Trip", excerpt: "Drove 1,400 km from Hyderabad to Goa. Here's what the 3XO feels like away from city traffic.", category: "Cars", rating: 4.2, readTime: "10 min", author: "Sneha P.", fuel: "Petrol", power: "130 PS" },
  { title: "Kia Seltos HTX 2026 — Ownership Cost Deep Dive", excerpt: "Real service bills, tyre costs, and insurance data from 30,000 km of real ownership.", category: "Cars", rating: 4.5, readTime: "9 min", author: "Rahul D.", fuel: "Petrol", power: "115 PS" },
  { title: "Ola S1 Pro Gen 3 — 6 Months of Daily Commuting", excerpt: "Range, charging speeds, OTA updates, and the reality of electric scooter ownership in India.", category: "Bikes", rating: 3.9, readTime: "11 min", author: "Ananya R.", fuel: "Electric", power: "11 kW" },
  { title: "Honda Elevate — Premium Compact SUV or Just Hype?", excerpt: "Honda's late entry into the compact SUV space. Refined, comfortable, but does it justify the price?", category: "Cars", rating: 4.0, readTime: "8 min", author: "Vijay S.", fuel: "Petrol", power: "121 PS" },
];

const CATEGORIES = ["All", "Cars", "Bikes", "Electric", "Commercial"];

function Stars({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(n) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
      ))}
      <span className="text-xs font-bold text-gray-700 ml-1">{n.toFixed(1)}</span>
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Expert Reviews</span>
          </nav>
          <h1 className="text-2xl sm:text-4xl font-extrabold mb-2">Expert Car Reviews</h1>
          <p className="text-blue-200 text-sm">Unbiased. In-depth. By automotive journalists who actually drive them.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CATEGORIES.map((c) => (
            <span key={c}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border cursor-pointer transition-all ${
                c === "All" ? "bg-blue-700 text-white border-blue-700" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
              }`}>
              {c}
            </span>
          ))}
        </div>

        {/* Featured review */}
        <div className="bg-gradient-to-r from-slate-800 to-blue-900 rounded-3xl p-7 sm:p-10 text-white mb-8 relative overflow-hidden">
          <div className="absolute top-4 right-4 text-[10px] font-bold bg-amber-400 text-amber-900 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Featured
          </div>
          <span className="inline-block text-[10px] font-bold bg-blue-600/50 border border-blue-400/30 text-blue-100 px-2.5 py-0.5 rounded-full mb-4">
            {FEATURED.category}
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-3 max-w-2xl leading-snug">{FEATURED.title}</h2>
          <p className="text-blue-200 text-sm leading-relaxed mb-5 max-w-2xl">{FEATURED.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Stars n={FEATURED.rating} />
            <div className="flex items-center gap-1.5 text-blue-300 text-xs">
              <Clock className="w-3.5 h-3.5" /> {FEATURED.readTime} read
            </div>
            <span className="text-blue-400 text-xs">by {FEATURED.author}</span>
          </div>
          <Link href={`/reviews/${FEATURED.slug}`}
            className="inline-flex items-center gap-2 mt-5 h-11 px-6 bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all">
            Read Full Review <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Review grid */}
        <h2 className="font-bold text-gray-900 text-lg mb-5">Latest Reviews</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REVIEWS.map((r) => (
            <div key={r.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative">
                <Gauge className="w-12 h-12 text-slate-300" />
                <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-slate-700 px-2 py-0.5 rounded-full">{r.category}</span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-blue-700 transition-colors">{r.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{r.excerpt}</p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    {r.fuel === "Electric" ? <Zap className="w-3 h-3 text-green-500" /> : <Fuel className="w-3 h-3 text-gray-400" />}
                    {r.fuel}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Gauge className="w-3 h-3 text-gray-400" /> {r.power}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <Stars n={r.rating} />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {r.readTime}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <p className="text-[11px] text-gray-400">by {r.author}</p>
                  <Link href="#"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Read <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-8">
          <button className="h-11 px-8 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all">
            Load More Reviews
          </button>
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-7 text-center text-white">
          <p className="font-bold text-lg mb-1">Want a specific car reviewed?</p>
          <p className="text-blue-200 text-sm mb-5">Tell us which model you&apos;d like our experts to test drive next.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 h-11 px-6 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all">
            Request a Review
          </Link>
        </div>
      </div>
    </div>
  );
}
