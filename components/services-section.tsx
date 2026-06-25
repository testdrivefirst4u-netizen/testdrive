import Link from "next/link";
import { CarFront, PiggyBank, ShieldCheck, LocateFixed, BookOpen, Wrench, ArrowRight } from "lucide-react";

const SERVICES = [
  {
    icon: CarFront, title: "Buy New Cars", desc: "Explore latest models with best prices and offers",
    href: "/cars",
    gradient: "from-blue-500 to-blue-700", glow: "shadow-blue-500/25",
    bg: "from-blue-50/80 to-blue-100/30", border: "border-blue-100 hover:border-blue-200",
    accent: "text-blue-700",
  },
  {
    icon: PiggyBank, title: "EMI Calculator", desc: "Plan your car loan & calculate monthly EMI",
    href: "/emi-calculator",
    gradient: "from-emerald-500 to-teal-700", glow: "shadow-emerald-500/25",
    bg: "from-emerald-50/80 to-teal-50/30", border: "border-emerald-100 hover:border-emerald-200",
    accent: "text-emerald-700",
  },
  {
    icon: ShieldCheck, title: "Car Insurance", desc: "Compare & buy insurance at lowest premium",
    href: "/insurance",
    gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25",
    bg: "from-amber-50/80 to-orange-50/30", border: "border-amber-100 hover:border-amber-200",
    accent: "text-amber-700",
  },
  {
    icon: LocateFixed, title: "Find Dealers", desc: "Locate certified authorised dealers near you",
    href: "/dealers",
    gradient: "from-purple-500 to-violet-700", glow: "shadow-purple-500/25",
    bg: "from-purple-50/80 to-violet-50/30", border: "border-purple-100 hover:border-purple-200",
    accent: "text-purple-700",
  },
  {
    icon: BookOpen, title: "Expert Reviews", desc: "In-depth road tests from our automotive editors",
    href: "/reviews",
    gradient: "from-rose-500 to-pink-700", glow: "shadow-rose-500/25",
    bg: "from-rose-50/80 to-pink-50/30", border: "border-rose-100 hover:border-rose-200",
    accent: "text-rose-700",
  },
  {
    icon: Wrench, title: "Car Service", desc: "Book maintenance & service appointments online",
    href: "/services",
    gradient: "from-teal-500 to-cyan-700", glow: "shadow-teal-500/25",
    bg: "from-teal-50/80 to-cyan-50/30", border: "border-teal-100 hover:border-teal-200",
    accent: "text-teal-700",
  },
];

export function ServicesSection() {
  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-eyebrow mb-1">What We Offer</p>
            <h2 className="section-title">Complete Automotive Services</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SERVICES.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.title}
                href={s.href}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl border bg-gradient-to-br ${s.bg} ${s.border} transition-all duration-200 hover:shadow-lg hover:-translate-y-1`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} shadow-lg ${s.glow} flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Text */}
                <h3 className={`font-bold text-sm mb-1.5 leading-tight ${s.accent} group-hover:opacity-90`}>{s.title}</h3>
                <p className="text-xs text-gray-500 leading-snug mb-3.5 flex-1">{s.desc}</p>

                {/* CTA */}
                <span className={`inline-flex items-center gap-1 text-xs font-bold ${s.accent} group-hover:gap-2 transition-all duration-200`}>
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
