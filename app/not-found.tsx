import Link from "next/link";
import { Car, Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-12">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
          <Car className="w-5 h-5 text-white" />
        </div>
        <div className="text-left">
          <p className="font-extrabold text-white text-base leading-none">Walley</p>
          <p className="text-[9px] text-slate-400 uppercase tracking-wider">by Broaddcast</p>
        </div>
      </Link>

      {/* 404 display */}
      <div className="relative mb-8">
        <p className="text-[120px] sm:text-[180px] font-black text-white/[0.04] leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl sm:text-8xl font-black bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent leading-none mb-2">404</p>
          </div>
        </div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">Page not found</h1>
      <p className="text-slate-400 text-sm sm:text-base max-w-sm mb-10 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get you back on track.
      </p>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 w-full max-w-lg">
        {[
          { label: "New Cars", href: "/cars", emoji: "🚗" },
          { label: "Bikes", href: "/bikes", emoji: "🏍️" },
          { label: "Electric", href: "/ev", emoji: "⚡" },
          { label: "Compare", href: "/compare", emoji: "⚖️" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="flex flex-col items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/40 rounded-2xl p-4 transition-all group"
          >
            <span className="text-2xl">{l.emoji}</span>
            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">{l.label}</span>
          </Link>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 h-11 px-6 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
        <Link
          href="/cars"
          className="flex items-center gap-2 h-11 px-6 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-semibold text-sm rounded-xl transition-all"
        >
          <Search className="w-4 h-4" />
          Browse Vehicles
        </Link>
      </div>
    </div>
  );
}
