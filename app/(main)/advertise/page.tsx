import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, ChevronRight, CheckCircle2, Users, Megaphone, Globe, ArrowRight, Mail, Phone, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Advertise With Walley — Reach 1M+ Car Buyers | Broaddcast",
  description: "Reach over 1 million monthly car buyers on Walley. Display ads, native listings, sponsored content, and dealer partnerships.",
};

const PLANS = [
  {
    name: "Starter",
    price: "₹9,999",
    period: "/month",
    desc: "Perfect for small dealerships and local businesses",
    features: ["1 Featured Listing", "500 Guaranteed Impressions/day", "Dealer Profile Badge", "WhatsApp Lead Forwarding", "Monthly Performance Report"],
    cta: "Get Started",
    highlight: false,
  },
  {
    name: "Growth",
    price: "₹29,999",
    period: "/month",
    desc: "Ideal for multi-brand dealers and OEM partners",
    features: ["5 Featured Listings", "2,500 Impressions/day", "Premium Dealer Badge", "Homepage Banner (1 week/month)", "Weekly Performance Report", "Dedicated Account Manager"],
    cta: "Most Popular",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "pricing",
    desc: "For OEM brands, insurance companies, and large networks",
    features: ["Unlimited Listings", "Homepage Takeover", "Native Content Articles", "Video Reviews", "Co-branded Campaigns", "Dedicated Campaign Team", "Real-time Dashboard"],
    cta: "Contact Sales",
    highlight: false,
  },
];

const STATS = [
  { value: "1M+", label: "Monthly Visitors" },
  { value: "35%", label: "Purchase Intent" },
  { value: "4.2min", label: "Avg. Session Time" },
  { value: "68%", label: "Mobile Users" },
];

const AD_FORMATS = [
  { Icon: BarChart3, title: "Display Banners", desc: "High-impact banner placements on homepage, listing pages, and car detail pages." },
  { Icon: TrendingUp, title: "Sponsored Listings", desc: "Feature your inventory at the top of search results with a sponsored badge." },
  { Icon: Megaphone, title: "Native Articles", desc: "Branded content articles written by our editorial team, distributed across the site and newsletter." },
  { Icon: Globe, title: "Dealer Profile", desc: "A dedicated, SEO-optimised dealer page with photos, inventory, and review collection." },
];

export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <nav className="flex items-center justify-center gap-1.5 text-xs text-blue-300 mb-7">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Advertise With Us</span>
          </nav>
          <div className="w-14 h-14 bg-blue-700/50 border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Megaphone className="w-7 h-7 text-blue-200" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Reach 1 Million<br />Car Buyers Monthly
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-2xl mx-auto mb-8 leading-relaxed">
            Walley connects your brand with high-intent vehicle buyers across India. From display ads to dealer partnerships, we have a format for every budget.
          </p>
          <a href="mailto:advertise@broaddcast.com"
            className="inline-flex items-center gap-2 h-12 px-8 bg-white text-blue-800 hover:bg-blue-50 font-bold text-sm rounded-xl transition-all shadow-lg">
            <Mail className="w-4 h-4" /> Get Media Kit
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-blue-700">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ad formats */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Ad Formats</p>
          <h2 className="text-2xl font-bold text-gray-900">Advertising Solutions</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
          {AD_FORMATS.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 bg-slate-50 rounded-2xl p-6 border border-gray-100">
              <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="font-bold text-gray-900 mb-1.5">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Packages</p>
          <h2 className="text-2xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
          {PLANS.map((p) => (
            <div key={p.name} className={`rounded-2xl border overflow-hidden ${p.highlight ? "border-blue-600 shadow-lg shadow-blue-100" : "border-gray-200"}`}>
              {p.highlight && <div className="bg-blue-700 text-white text-center text-xs font-bold py-1.5 tracking-wider uppercase">Most Popular</div>}
              <div className={`p-6 ${p.highlight ? "bg-blue-50" : "bg-white"}`}>
                <p className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-1">{p.name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <p className="text-3xl font-extrabold text-gray-900">{p.price}</p>
                  <p className="text-gray-400 text-sm">{p.period}</p>
                </div>
                <p className="text-xs text-gray-500 mb-5">{p.desc}</p>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.highlight ? "text-blue-600" : "text-green-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="mailto:advertise@broaddcast.com"
                  className={`block w-full h-11 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 ${
                    p.highlight ? "bg-blue-700 hover:bg-blue-600 text-white" : "border-2 border-gray-200 hover:border-blue-400 text-gray-700"
                  }`}>
                  {p.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Audience */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 text-white mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-3">Our Audience</p>
              <h3 className="text-2xl font-extrabold mb-3">High-Intent, Purchase-Ready Buyers</h3>
              <p className="text-blue-200 text-sm leading-relaxed">
                Walley users are actively researching their next vehicle purchase. 35% plan to buy within 3 months. Reach them when it matters most.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Age 25–44", value: "71%" },
                { label: "Tier 1 Cities", value: "58%" },
                { label: "First-time Buyers", value: "44%" },
                { label: "Monthly HHI ₹50k+", value: "63%" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white/10 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-extrabold">{value}</p>
                  <p className="text-blue-200 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-slate-50 rounded-2xl border border-gray-100 p-7 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <p className="font-bold text-gray-900 mb-1">Ready to advertise?</p>
            <p className="text-sm text-gray-500">Our partnerships team will get back to you within 24 hours.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a href="mailto:advertise@broaddcast.com"
              className="flex items-center gap-2 h-11 px-5 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all">
              <Mail className="w-4 h-4" /> Email Us
            </a>
            <a href="tel:18001234567"
              className="flex items-center gap-2 h-11 px-5 border-2 border-gray-200 hover:border-blue-400 text-gray-700 font-bold text-sm rounded-xl transition-all">
              <Phone className="w-4 h-4" /> Call Sales
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Part of <Link href="/about" className="text-blue-500 hover:underline">Broaddcast Technologies</Link> ·
            {" "}<Link href="/contact" className="text-blue-500 hover:underline">General Enquiries</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
