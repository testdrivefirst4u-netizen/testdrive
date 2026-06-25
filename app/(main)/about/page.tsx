import type { Metadata } from "next";
import Link from "next/link";
import { Car, Users, Award, Shield, TrendingUp, MapPin, ChevronRight, HeartHandshake } from "lucide-react";

export const metadata: Metadata = {
  title: "About Walley by Broaddcast | India's Trusted Auto Marketplace",
  description: "Walley is India's trusted automotive marketplace by Broaddcast. Compare 2,000+ vehicles, find dealers, calculate EMI, and book test drives.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <nav className="flex items-center justify-center gap-1.5 text-xs text-blue-300 mb-8">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">About Us</span>
          </nav>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-900/50">
            <Car className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">India&apos;s Most Trusted<br />Auto Marketplace</h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Walley by Broaddcast is on a mission to make buying a vehicle simple, transparent, and exciting for every Indian.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { Icon: Car,      value: "2,000+",  label: "Vehicle Listings"  },
            { Icon: Users,    value: "1M+",     label: "Monthly Users"     },
            { Icon: Award,    value: "50+",     label: "Brands Covered"    },
            { Icon: MapPin,   value: "500+",    label: "Verified Dealers"  },
          ].map(({ Icon, value, label }) => (
            <div key={label} className="text-center">
              <Icon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Our Story</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Making vehicle buying easy for every Indian</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              Walley was born from a simple frustration — buying a car in India was confusing, opaque, and stressful. Prices weren&apos;t transparent, comparisons were hard, and dealers weren&apos;t always trustworthy.
            </p>
            <p className="text-gray-500 text-sm leading-relaxed">
              Founded by Broaddcast Technologies, we built Walley to fix that. Our platform aggregates real on-road prices, expert reviews, and dealer listings — putting buyers in control.
            </p>
          </div>
          <div className="space-y-4">
            {[
              { Icon: Shield,        title: "Verified Information",   desc: "All specs, prices, and dealer listings are verified and updated regularly." },
              { Icon: TrendingUp,    title: "Expert Reviews",         desc: "Unbiased in-depth reviews from our team of automotive journalists." },
              { Icon: HeartHandshake,title: "Buyer-First Approach",   desc: "We never accept payment from dealers to influence our recommendations." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-5">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900 mb-0.5">{title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-8 sm:p-12 text-center text-white">
          <h3 className="text-2xl font-extrabold mb-2">Ready to find your dream vehicle?</h3>
          <p className="text-blue-200 text-sm mb-7">Compare prices, read reviews, and book your test drive today.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cars" className="h-12 px-8 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
              <Car className="w-4 h-4" /> Browse Cars
            </Link>
            <Link href="/test-drive" className="h-12 px-8 bg-blue-600/40 border border-blue-400/40 text-white font-bold text-sm rounded-xl hover:bg-blue-600/60 transition-all flex items-center justify-center">
              Book Test Drive
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
