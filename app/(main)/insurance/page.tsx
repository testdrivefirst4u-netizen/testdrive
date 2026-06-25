import type { Metadata } from "next";
import Link from "next/link";
import { Shield, CheckCircle2, ChevronRight, Phone, Star, Zap, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Car Insurance India 2026 — Compare & Buy | Walley",
  description: "Compare car insurance plans from 20+ insurers. Get the lowest premium for comprehensive cover, zero depreciation, and roadside assistance.",
};

const PLANS = [
  { insurer: "HDFC ERGO",    premium: "₹6,200/yr", coverage: "Comprehensive", stars: 4.7, features: ["Zero Depreciation", "24×7 RSA", "Cashless Garages"], badge: "Best Value" },
  { insurer: "Bajaj Allianz",premium: "₹5,800/yr", coverage: "Comprehensive", stars: 4.5, features: ["Engine Protection", "Key Replacement", "RSA"], badge: "Popular"    },
  { insurer: "ICICI Lombard", premium: "₹6,600/yr", coverage: "Comprehensive + OD", stars: 4.6, features: ["Zero Dep", "Consumables", "Tyre Protect"], badge: ""     },
  { insurer: "New India",     premium: "₹4,900/yr", coverage: "Third Party",   stars: 4.2, features: ["3rd Party Cover", "Legal Compliance", "Fast Claim"], badge: "Cheapest" },
];

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Car Insurance</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-700/50 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Car Insurance</h1>
              <p className="text-blue-200 text-sm">Compare 20+ insurers. Save up to 40% on premium.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {["Instant Policy Issuance", "Cashless at 7,000+ Garages", "24×7 Claims Support"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

        {/* Quick quote strip */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-amber-500" />
            <p className="font-bold text-gray-900">Get Your Quote in 2 Minutes</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input type="text" placeholder="Car Registration No. (e.g. TS09AB1234)"
              className="h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
            <select className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none focus:border-blue-500 appearance-none">
              <option>Select Cover Type</option>
              <option>Comprehensive</option>
              <option>Third Party Only</option>
              <option>Zero Depreciation Add-on</option>
            </select>
            <button className="h-11 bg-blue-700 hover:bg-blue-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              Get Quote <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-400">By proceeding you agree to be contacted by our insurance partners. No spam.</p>
        </div>

        {/* Plans */}
        <h2 className="font-bold text-gray-900 text-lg mb-4">Recommended Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
          {PLANS.map((p) => (
            <div key={p.insurer} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between p-5 pb-3">
                <div>
                  {p.badge && <span className="inline-block text-[10px] font-bold text-white bg-blue-700 px-2 py-0.5 rounded-full mb-2">{p.badge}</span>}
                  <p className="font-bold text-gray-900">{p.insurer}</p>
                  <p className="text-xs text-gray-400">{p.coverage}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-extrabold text-blue-700">{p.premium}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-gray-700">{p.stars}</span>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-4">
                <ul className="space-y-1 mb-4">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button className="w-full h-10 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all">
                  Buy Plan
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info section */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-7">
          <h3 className="font-bold text-gray-900 mb-4">Why Buy Through Walley?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { Icon: Shield, title: "Trusted Partners", desc: "All insurers are IRDAI-licensed and verified." },
              { Icon: Phone,  title: "Claims Support",   desc: "Dedicated team to help you at every step." },
              { Icon: Zap,    title: "Instant Policy",   desc: "Get your policy PDF within minutes of payment." },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 bg-white border border-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-blue-700" />
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
