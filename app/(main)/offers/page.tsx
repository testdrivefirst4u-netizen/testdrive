import type { Metadata } from "next";
import Link from "next/link";
import { Tag, ChevronRight, Clock, ArrowRight, CheckCircle2, Zap, Percent, Gift } from "lucide-react";

export const metadata: Metadata = {
  title: "Latest Car Offers & Deals June 2026 — Discounts, Cashback | Walley",
  description: "Find the best car offers, discounts, cashback deals, and exchange bonuses across all brands in India. Updated for June 2026.",
};

const FEATURED_DEALS = [
  { brand: "Tata Motors", title: "Up to ₹50,000 off on Nexon EV", tag: "Electric Special", expires: "30 Jun 2026", savings: "₹50,000", type: "Discount", color: "bg-blue-50 border-blue-100 text-blue-700", badgeColor: "bg-blue-700" },
  { brand: "Hyundai", title: "₹30,000 exchange bonus on Creta", tag: "Exchange Offer", expires: "30 Jun 2026", savings: "₹30,000", type: "Exchange", color: "bg-violet-50 border-violet-100 text-violet-700", badgeColor: "bg-violet-700" },
  { brand: "Maruti Suzuki", title: "Free 5-yr warranty on Fronx & Brezza", tag: "Warranty Deal", expires: "30 Jun 2026", savings: "₹18,000", type: "Warranty", color: "bg-emerald-50 border-emerald-100 text-emerald-700", badgeColor: "bg-emerald-700" },
];

const ALL_OFFERS = [
  { brand: "Tata Motors", model: "Punch EV", offer: "₹20,000 cashback + free home charger", category: "EV", till: "30 Jun", hot: true },
  { brand: "Mahindra", model: "XUV 3XO", offer: "₹25,000 off + accessories worth ₹10,000", category: "Cars", till: "30 Jun", hot: true },
  { brand: "Kia", model: "Seltos", offer: "0% processing fee on all variants", category: "Finance", till: "30 Jun", hot: false },
  { brand: "Honda", model: "Elevate", offer: "₹15,000 cashback + 5-year service plan", category: "Cars", till: "30 Jun", hot: false },
  { brand: "Toyota", model: "Urban Cruiser Hyryder", offer: "Free insurance for 1 year (worth ₹20,000)", category: "Insurance", till: "30 Jun", hot: true },
  { brand: "Hyundai", model: "Exter", offer: "₹10,000 off + complimentary accessories kit", category: "Cars", till: "30 Jun", hot: false },
  { brand: "Volkswagen", model: "Taigun", offer: "₹40,000 off GT variant + sunroof free", category: "Cars", till: "30 Jun", hot: false },
  { brand: "Maruti Suzuki", model: "Grand Vitara", offer: "6.99% interest rate — lowest in segment", category: "Finance", till: "30 Jun", hot: false },
  { brand: "MG Motor", model: "Windsor EV", offer: "₹60,000 off + free 3-year maintenance", category: "EV", till: "30 Jun", hot: true },
];

const CATEGORIES = ["All", "Cars", "EV", "Finance", "Insurance", "Exchange"];

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-amber-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-amber-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Latest Offers</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-700/50 border border-amber-500/30 rounded-2xl flex items-center justify-center">
              <Tag className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Car Offers & Deals</h1>
              <p className="text-amber-200 text-sm">Updated June 2026 — Discounts, Cashbacks, Exchange Bonuses</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 bg-amber-900/40 border border-amber-700/30 rounded-xl px-4 py-2.5 max-w-max">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <p className="text-xs text-amber-200">All offers valid till <strong className="text-white">30 June 2026</strong>. Verify with dealer for final terms.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-7">
          {CATEGORIES.map((c) => (
            <span key={c} className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border cursor-pointer transition-all ${
              c === "All" ? "bg-amber-600 text-white border-amber-600" : "bg-white border-gray-200 text-gray-600 hover:border-amber-300"
            }`}>
              {c}
            </span>
          ))}
        </div>

        {/* Top 3 featured deals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {FEATURED_DEALS.map((d) => (
            <div key={d.title} className={`rounded-2xl border p-5 ${d.color} relative overflow-hidden`}>
              <span className={`absolute top-4 right-4 text-[10px] font-bold text-white px-2 py-0.5 rounded-full ${d.badgeColor}`}>{d.tag}</span>
              <p className="font-black text-xs uppercase tracking-widest opacity-60 mb-1">{d.brand}</p>
              <h3 className="font-bold text-base leading-snug mb-3">{d.title}</h3>
              <div className="flex items-center gap-2 mb-3">
                <Percent className="w-4 h-4 opacity-70" />
                <p className="font-black text-2xl">{d.savings}</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs opacity-60">
                <Clock className="w-3 h-3" /> Valid till {d.expires}
              </div>
              <Link href="/dealers"
                className="mt-4 flex items-center justify-center gap-2 h-9 w-full bg-white/70 hover:bg-white font-bold text-xs rounded-xl transition-all">
                Claim at Dealer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* All offers table */}
        <h2 className="font-bold text-gray-900 text-lg mb-5">All Offers — June 2026</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Brand / Model</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Offer</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="text-center px-4 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wider">Valid Till</th>
                  <th className="px-4 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {ALL_OFFERS.map((o) => (
                  <tr key={o.model} className="hover:bg-amber-50/40 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {o.hot && <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{o.model}</p>
                          <p className="text-xs text-gray-400">{o.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{o.offer}</p>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.category === "EV" ? "bg-green-100 text-green-700" :
                        o.category === "Finance" ? "bg-blue-100 text-blue-700" :
                        o.category === "Insurance" ? "bg-purple-100 text-purple-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{o.category}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <p className="text-xs text-gray-500">30 Jun 2026</p>
                    </td>
                    <td className="px-4 py-4">
                      <Link href="/dealers" className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap flex items-center gap-1">
                        Claim <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Benefits strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { Icon: Gift, title: "Exchange Bonus", desc: "Upgrade your old car and get extra discount on your new purchase." },
            { Icon: Percent, title: "Finance Deals", desc: "Special EMI schemes with 0% down payment from select banks." },
            { Icon: CheckCircle2, title: "Free Services", desc: "Some brands are bundling 3–5 free services worth ₹15,000+" },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
              <div className="w-10 h-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-3xl p-7 text-center text-white">
          <p className="font-extrabold text-xl mb-2">Ready to grab the deal?</p>
          <p className="text-amber-100 text-sm mb-5">Book your test drive today and mention the Walley offer at the dealership.</p>
          <Link href="/test-drive"
            className="inline-flex items-center gap-2 h-11 px-8 bg-white text-amber-700 font-bold text-sm rounded-xl hover:bg-amber-50 transition-all">
            Book Test Drive <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
