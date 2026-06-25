"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Car, Bike, PlugZap, Truck, ArrowLeftRight,
  Newspaper, Star, Calculator, MapPin, Phone, Mail,
  Facebook, Twitter, Instagram, Youtube,
  Shield, ChevronRight, HeartHandshake, Zap,
  Send, CheckCircle2, TrendingUp, Loader2,
} from "lucide-react";

const QUICK_LINKS = [
  { icon: Car,            label: "New Cars",          href: "/cars"              },
  { icon: TrendingUp,     label: "New Launches",      href: "/new-car-launches"  },
  { icon: Bike,           label: "Bikes & Scooters",  href: "/bikes"             },
  { icon: PlugZap,        label: "Electric Vehicles", href: "/ev"                },
  { icon: Truck,          label: "Commercial",        href: "/commercial"        },
  { icon: ArrowLeftRight, label: "Compare Cars",      href: "/compare"           },
];

const SERVICES_LINKS = [
  { icon: Calculator, label: "EMI Calculator",  href: "/emi-calculator" },
  { icon: Shield,     label: "Car Insurance",   href: "/insurance"      },
  { icon: MapPin,     label: "Find Dealers",    href: "/dealers"        },
  { icon: Star,       label: "Expert Reviews",  href: "/reviews"        },
  { icon: Newspaper,  label: "Auto News",       href: "/news"           },
];

const POPULAR_BRANDS = [
  { label: "Maruti Suzuki",  href: "/cars?brand=maruti-suzuki" },
  { label: "Hyundai",        href: "/cars?brand=hyundai" },
  { label: "Tata Motors",    href: "/cars?brand=tata" },
  { label: "Mahindra",       href: "/cars?brand=mahindra" },
  { label: "Honda",          href: "/cars?brand=honda" },
  { label: "Royal Enfield",  href: "/bikes?brand=royal-enfield" },
  { label: "Ola Electric",   href: "/ev?brand=ola-electric" },
  { label: "Ather Energy",   href: "/ev?brand=ather-energy" },
];

const SOCIALS = [
  { icon: Facebook,  href: "https://facebook.com/walleyindia",    label: "Facebook",    bg: "hover:bg-[#1877f2]" },
  { icon: Twitter,   href: "https://x.com/walleyindia",           label: "X (Twitter)", bg: "hover:bg-[#0f1419]" },
  { icon: Instagram, href: "https://instagram.com/walley.india",  label: "Instagram",   bg: "hover:bg-gradient-to-br hover:from-[#f58529] hover:via-[#dd2a7b] hover:to-[#515bd4]" },
  { icon: Youtube,   href: "https://youtube.com/@walleyindia",    label: "YouTube",     bg: "hover:bg-[#ff0000]" },
];

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 rounded-2xl p-6 sm:p-8">
      {/* Decorative glow rings */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-6">
        {/* Left */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 mb-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white text-xs font-semibold">Stay updated</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
            Get the best auto deals, news & launches
          </h3>
          <p className="text-blue-200 text-sm">
            Join 5 lakh+ subscribers. No spam — just the good stuff.
          </p>
        </div>

        {/* Right: form */}
        <div className="w-full lg:w-auto lg:min-w-[360px]">
          {sent ? (
            <div className="flex flex-col items-center gap-2 bg-white/10 rounded-2xl p-5 text-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              <p className="text-white font-semibold">You're subscribed!</p>
              <p className="text-blue-200 text-xs">Thanks, we'll keep you in the loop.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-5 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 disabled:opacity-70 transition-all flex items-center gap-2 hover:shadow-lg whitespace-nowrap"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                {loading ? "Subscribing…" : "Subscribe"}
              </button>
            </form>
          )}
          <p className="text-blue-300 text-[10px] mt-2 text-center lg:text-left">
            By subscribing you agree to our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-white">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">

      {/* ── Newsletter bar ─────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-6">
        <NewsletterForm />
      </div>

      {/* ── Top bar ─────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <Car className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-base font-extrabold tracking-tight">Walley</p>
                <p className="text-xs text-slate-400 font-medium">by Broaddcast · India's Trusted Auto Platform</p>
              </div>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 mr-1 hidden sm:block">Follow us</span>
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-200 ${s.bg} hover:border-transparent`}
                  >
                    <Icon className="w-4 h-4 text-slate-300" />
                  </Link>
                );
              })}
            </div>

            {/* Contact pills */}
            <div className="flex flex-wrap gap-2">
              <a href="tel:+911800123456"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 text-sm transition-all">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200 text-xs">1800-123-4567</span>
              </a>
              <a href="mailto:support@broaddcast.com"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3.5 py-2 text-sm transition-all">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-200 text-xs">support@broaddcast.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main links grid ─────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">

          {/* Browse Vehicles */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Browse Vehicles</h4>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors group text-sm">
                      <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Our Services</h4>
            <ul className="space-y-2.5">
              {SERVICES_LINKS.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.href}>
                    <Link href={l.href}
                      className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors group text-sm">
                      <Icon className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Popular Brands</h4>
            <ul className="space-y-2.5">
              {POPULAR_BRANDS.map((b) => (
                <li key={b.href}>
                  <Link href={b.href}
                    className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm group">
                    <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About + Trust */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Company</h4>
            <ul className="space-y-2.5 mb-6">
              {[
                { label: "About Broaddcast", href: "/about" },
                { label: "Privacy Policy",   href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Advertise With Us",href: "/advertise" },
                { label: "Careers",          href: "/careers" },
                { label: "Contact Us",       href: "/contact" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-slate-300 hover:text-white transition-colors text-sm">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Trust badge */}
            <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl p-3">
              <HeartHandshake className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Trusted by 1M+ users</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Verified dealers · Certified vehicles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            © 2026 Broaddcast Technologies Pvt. Ltd. · All rights reserved
          </p>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Terms</Link>
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-3 py-1">
              <MapPin className="w-3 h-3 text-blue-400" />
              <span className="text-[11px] text-slate-400">Made in India 🇮🇳</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
