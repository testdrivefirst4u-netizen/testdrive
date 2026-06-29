"use client";

import { useState } from "react";
import { X, Phone, MessageCircle, Loader2, CheckCircle2 } from "lucide-react";

export function WhatsAppWidget() {
  const [open, setOpen]       = useState(false);
  const [name, setName]       = useState("");
  const [mobile, setMobile]   = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Enter your name"); return; }
    if (!/^\d{10}$/.test(mobile)) { setError("Enter valid 10-digit number"); return; }
    setError("");
    setLoading(true);
    try {
      await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), mobile, source: "callback_widget" }),
      });
    } catch {}
    setSent(true);
    setLoading(false);
  }

  function handleOpen() {
    setOpen((p) => !p);
    if (!open) { setName(""); setMobile(""); setSent(false); setError(""); }
  }

  return (
    <div className="fixed bottom-[88px] right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end gap-2.5">
      {/* Panel */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-72 animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Phone className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Get a Free Callback</p>
                <p className="text-[10px] text-green-100">Our expert calls within 30 mins</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4">
            {sent ? (
              <div className="text-center py-5">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <p className="font-bold text-slate-900 text-sm">We'll call you shortly!</p>
                <p className="text-xs text-gray-400 mt-1">Expect a call within 30 minutes</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">+91</span>
                  <input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Mobile number"
                    className="w-full h-9 pl-10 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition-all"
                  />
                </div>
                {error && <p className="text-xs text-red-500">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-green-500 hover:bg-green-600 disabled:opacity-70 text-white text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    : <><Phone className="w-4 h-4" /> Call Me Back</>}
                </button>
                <p className="text-[10px] text-gray-400 text-center">
                  Free consultation · No spam calls
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={handleOpen}
        title="Get a free callback"
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 ${
          open
            ? "bg-gray-800 hover:bg-gray-900"
            : "bg-green-500 hover:bg-green-600"
        }`}
      >
        {open
          ? <X className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}
