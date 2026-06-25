"use client";

import { useEffect, useRef, useState } from "react";
import { Car, Users, Award, TrendingUp } from "lucide-react";

const STATS = [
  { icon: Car, value: 50000, label: "Cars Listed", suffix: "+" },
  { icon: Users, value: 1000000, label: "Happy Customers", suffix: "+" },
  { icon: Award, value: 500, label: "Trusted Dealers", suffix: "+" },
  { icon: TrendingUp, value: 98, label: "Satisfaction Rate", suffix: "%" },
];

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, 2000 / steps);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref} className="text-3xl md:text-4xl font-bold text-slate-900">
      {count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-14 bg-gradient-to-br from-blue-950 to-blue-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Trusted by Millions Across India
          </h2>
          <p className="text-blue-200 max-w-xl mx-auto text-sm">
            Join India's fastest-growing automotive marketplace with verified dealers and satisfied customers
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group text-center bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-blue-200" />
                </div>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-blue-200 mt-1.5 text-sm font-medium">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
