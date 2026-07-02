"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Car, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mb-6">
        <Car className="w-8 h-8 text-red-400" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
      <p className="text-slate-400 text-sm max-w-sm mb-8 leading-relaxed">
        We hit an unexpected error. Our team has been notified. Please try again or go back home.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="flex items-center gap-2 h-11 px-6 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 h-11 px-6 bg-white/5 border border-white/10 text-slate-200 font-semibold text-sm rounded-xl transition-all"
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
