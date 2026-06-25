"use client";

import { useState } from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Rajesh Kumar",
    location: "Mumbai",
    rating: 5,
    text: "Found my dream car within a week! The platform is incredibly user-friendly and the dealer was very professional. Would highly recommend Walley to everyone.",
    car: "Hyundai Creta",
    initials: "RK",
    color: "from-blue-600 to-blue-800",
  },
  {
    id: 2,
    name: "Priya Sharma",
    location: "Delhi",
    rating: 5,
    text: "Excellent service and transparent pricing. The EMI calculator helped me plan my budget perfectly and I got a great deal on my new Swift!",
    car: "Maruti Swift",
    initials: "PS",
    color: "from-violet-600 to-purple-800",
  },
  {
    id: 3,
    name: "Amit Patel",
    location: "Bangalore",
    rating: 4,
    text: "Great experience selling my old car. Got a fair price and the process was completely hassle-free. The team was supportive throughout.",
    car: "Honda City",
    initials: "AP",
    color: "from-emerald-600 to-teal-800",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Chennai",
    rating: 5,
    text: "The comparison feature saved me so much time. Could easily compare different EV models side-by-side and make a confident, informed decision.",
    car: "Tata Nexon EV",
    initials: "SR",
    color: "from-orange-500 to-rose-700",
  },
];

export function TestimonialsSection() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="py-14 bg-gradient-to-br from-slate-50 to-blue-50/30 border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">

        {/* Heading */}
        <div className="text-center mb-10">
          <p className="section-eyebrow mb-1.5">Customer Stories</p>
          <h2 className="section-title text-2xl sm:text-3xl">
            What Our Customers Say
          </h2>
          <p className="text-slate-500 text-sm mt-2 max-w-lg mx-auto">
            Real experiences from real people who found their perfect vehicle through Walley
          </p>
        </div>

        {/* Grid — 2×2 on md+, stacked on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              onMouseEnter={() => setActive(t.id)}
              onMouseLeave={() => setActive(null)}
              className={`group relative bg-white rounded-2xl border p-5 transition-all duration-300 cursor-default ${
                active === t.id
                  ? "border-blue-200 shadow-xl shadow-blue-500/10 -translate-y-1"
                  : "border-gray-100 shadow-sm hover:shadow-md"
              }`}
            >
              {/* Quote icon */}
              <Quote className={`w-8 h-8 mb-3 transition-colors duration-300 ${active === t.id ? "text-blue-200" : "text-gray-100"}`} />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 transition-colors duration-300 ${
                      i < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-600 text-sm leading-relaxed mb-5 flex-1">
                "{t.text}"
              </p>

              {/* User row */}
              <div className="flex items-center gap-2.5 mt-auto">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 text-sm leading-tight truncate">{t.name}</p>
                  <p className="text-[11px] text-slate-400 leading-tight truncate">
                    {t.location} · <span className="text-blue-600 font-medium">{t.car}</span>
                  </p>
                </div>
              </div>

              {/* Accent bar on hover */}
              <div className={`absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-gradient-to-r ${t.color} transition-all duration-300 ${
                active === t.id ? "opacity-100" : "opacity-0"
              }`} />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Join over <span className="font-bold text-slate-800">10 lakh+</span> satisfied customers who trust Walley
          </p>
        </div>
      </div>
    </section>
  );
}
