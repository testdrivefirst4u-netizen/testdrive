"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Droplets, Wind, Zap, Settings2, Gauge, BatteryCharging,
  Check, Minus, X, Copy, Trophy, ChevronDown, ChevronUp,
  Sparkles, Share2, Calculator, Printer, Phone, User,
  MapPin, Tag,
} from "lucide-react";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface CompareVehicle {
  id: string; name: string; slug: string; type: string;
  priceMin: number | null; priceMax: number | null; priceDisplay: string | null;
  isElectric: boolean; pros: unknown; cons: unknown;
  brand: { name: string; slug: string; logo: string | null };
  images: Array<{ url: string }>;
  variants: Array<{
    id: string; name: string; priceDisplay: string | null;
    fuelType: string | null; transmission: string | null;
    mileage: string | null; range: string | null; isDefault: boolean;
  }>;
  specGroups: Array<{
    id: string;
    group: { name: string; slug: string; sortOrder: number };
    specValues: Array<{ value: string; specItem: { name: string; unit: string | null; sortOrder: number } }>;
  }>;
  features: Array<{ id: string; category: string; name: string; available: boolean; sortOrder: number }>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtPrice(v: { priceDisplay: string | null; priceMin: number | null; priceMax: number | null }) {
  if (v.priceDisplay) return v.priceDisplay;
  if (v.priceMin && v.priceMax) return `₹${v.priceMin}–${v.priceMax} L*`;
  if (v.priceMin) return `₹${v.priceMin} L*`;
  return "Price TBD";
}

function fmtAmt(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function typeToPath(type: string) {
  const t = type?.toUpperCase();
  if (t === "BIKE" || t === "SCOOTER") return "bikes";
  if (t === "EV") return "ev";
  if (t === "COMMERCIAL") return "commercial";
  return "cars";
}

function FuelIcon({ fuel, cn = "w-3 h-3" }: { fuel: string; cn?: string }) {
  const ft = fuel.toLowerCase();
  if (ft.includes("electric")) return <Zap className={`${cn} text-teal-500`} />;
  if (ft.includes("cng") || ft.includes("lpg")) return <Wind className={`${cn} text-green-500`} />;
  return <Droplets className={`${cn} text-blue-400`} />;
}

function safeArr(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  return [];
}

function parseNum(val: string): number | null {
  const m = val.replace(/,/g, "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

function getWinnerIdx(vals: string[], specName: string): number | null {
  if (vals.length < 2) return null;
  const nums = vals.map(parseNum);
  if (nums.some((n) => n === null)) return null;
  const n = specName.toLowerCase();
  const higherBetter = ["mileage", "range", "power", "torque", "speed", "capacity", "boot", "ground clearance", "horsepower", "bhp", "kw"].some((k) => n.includes(k));
  const lowerBetter = ["price", "weight", "0-100", "0 to 100", "charging time", "emission"].some((k) => n.includes(k));
  if (!higherBetter && !lowerBetter) return null;
  const arr = nums as number[];
  if (arr.every((v) => v === arr[0])) return null;
  const best = higherBetter ? Math.max(...arr) : Math.min(...arr);
  return arr.findIndex((v) => v === best);
}

// ── Score computation ─────────────────────────────────────────────────────────

function findSpecNum(v: CompareVehicle, keywords: string[]): number | null {
  for (const sg of v.specGroups) {
    for (const sv of sg.specValues) {
      if (keywords.some((k) => sv.specItem.name.toLowerCase().includes(k))) {
        return parseNum(sv.value);
      }
    }
  }
  return null;
}

function normalizeScores(values: (number | null)[], lowerBetter = false): (number | null)[] {
  const valid = values.filter((v): v is number => v !== null);
  if (valid.length < 2) return values.map((v) => (v !== null ? 75 : null));
  const max = Math.max(...valid);
  const min = Math.min(...valid);
  if (max === min) return values.map((v) => (v !== null ? 75 : null));
  return values.map((v) => {
    if (v === null) return null;
    const pct = lowerBetter
      ? ((max - v) / (max - min)) * 75 + 25
      : ((v - min) / (max - min)) * 75 + 25;
    return Math.round(pct);
  });
}

function computeScores(vehicles: CompareVehicle[]) {
  const mileages = vehicles.map((v) =>
    v.isElectric
      ? findSpecNum(v, ["range", "real-world range", "claimed range", "wltp"])
      : findSpecNum(v, ["mileage", "fuel efficiency", "arai", "claimed mileage"])
  );
  const powers = vehicles.map((v) =>
    findSpecNum(v, ["max power", "power", "bhp", "hp", "motor power", "peak power", "kw"])
  );
  const featurePcts = vehicles.map((v) => {
    if (!v.features.length) return null;
    return Math.round((v.features.filter((f) => f.available).length / v.features.length) * 100);
  });
  const prices = vehicles.map((v) => v.priceMin);

  return {
    efficiency: normalizeScores(mileages),
    power: normalizeScores(powers),
    features: normalizeScores(featurePcts),
    value: normalizeScores(prices, true),
  };
}

// ── Score bar ─────────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-gray-300 font-medium">—</span>;
  const color = score >= 80 ? "bg-green-500" : score >= 55 ? "bg-blue-500" : "bg-amber-400";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-bold w-7 text-right ${score >= 80 ? "text-green-600" : score >= 55 ? "text-blue-600" : "text-amber-600"}`}>{score}</span>
    </div>
  );
}

// ── AI Verdict ────────────────────────────────────────────────────────────────

function AIVerdict({ vehicles }: { vehicles: CompareVehicle[] }) {
  const [verdict, setVerdict] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const key = vehicles.map((v) => v.id).join(",");

  useEffect(() => {
    if (vehicles.length < 2) return;
    setVerdict(null);
    setLoading(true);
    fetch("/api/compare/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vehicle1: `${vehicles[0].brand.name} ${vehicles[0].name}`,
        vehicle2: `${vehicles[1].brand.name} ${vehicles[1].name}`,
      }),
    })
      .then((r) => r.json())
      .then((d) => setVerdict(d.result || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!loading && !verdict) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <p className="font-bold text-blue-900 text-sm">AI Verdict</p>
        <span className="text-[10px] text-blue-400 ml-auto">Expert Analysis</span>
      </div>
      {loading ? (
        <div className="space-y-2">
          {[100, 85, 65].map((w, i) => (
            <div key={i} className="h-2.5 bg-blue-200/60 rounded-full animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-blue-900 leading-relaxed">{verdict}</p>
      )}
    </div>
  );
}

// ── Score Summary ─────────────────────────────────────────────────────────────

const SCORE_LABELS = [
  { key: "value" as const, label: "Value for Money", icon: "₹" },
  { key: "efficiency" as const, label: "Fuel / Range", icon: "⛽" },
  { key: "power" as const, label: "Performance", icon: "⚡" },
  { key: "features" as const, label: "Features", icon: "★" },
];

function ScoreSection({ vehicles }: { vehicles: CompareVehicle[] }) {
  const scores = computeScores(vehicles);
  const hasAnyScore = SCORE_LABELS.some(({ key }) => scores[key].some((s) => s !== null));
  if (!hasAnyScore) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2">
        <Trophy className="w-4 h-4 text-amber-500" />
        <h3 className="font-bold text-slate-800 text-sm">Score Summary</h3>
        <span className="text-[10px] text-gray-400 ml-1">Based on actual specs &amp; features</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left py-2.5 px-5 text-[11px] font-semibold text-gray-400 w-40">Metric</th>
              {vehicles.map((v) => (
                <th key={v.id} className="py-2.5 px-4 text-center">
                  <p className="text-[10px] text-gray-400 truncate">{v.brand.name}</p>
                  <p className="font-bold text-xs text-slate-800 truncate">{v.name}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORE_LABELS.map(({ key, label, icon }, ri) => (
              <tr key={key} className={`border-b border-gray-50 ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                <td className="py-3 px-5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{icon}</span>
                    <span className="text-xs font-medium text-gray-600">{label}</span>
                  </div>
                </td>
                {vehicles.map((v, i) => (
                  <td key={v.id} className="py-3 px-4 text-center">
                    <ScoreBar score={scores[key][i]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="px-5 py-2 text-[10px] text-gray-400 border-t border-gray-100">
        Scores are relative — 100 means best in this comparison for that metric.
      </p>
    </div>
  );
}

// ── EMI Calculator ────────────────────────────────────────────────────────────

const EMI_RATES = [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13, 14, 15];
const EMI_TENURES = [
  { v: 12, l: "1 yr" }, { v: 24, l: "2 yr" }, { v: 36, l: "3 yr" },
  { v: 48, l: "4 yr" }, { v: 60, l: "5 yr" }, { v: 72, l: "6 yr" }, { v: 84, l: "7 yr" },
];

function calcEMIDetails(priceMin: number, downPct: number, rate: number, tenure: number) {
  const price = priceMin * 100000;
  const down = Math.round(price * downPct / 100);
  const loan = price - down;
  const r = rate / 12 / 100;
  const n = tenure;
  const emi = Math.round((loan * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) / 100) * 100;
  const totalPayable = emi * n;
  return { price: Math.round(price), down, loan: Math.round(loan), emi, totalPayable, totalInterest: totalPayable - Math.round(loan) };
}

function EMICalcSection({ vehicles }: { vehicles: CompareVehicle[] }) {
  const [open, setOpen] = useState(false);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(9);
  const [tenure, setTenure] = useState(60);

  if (!vehicles.some((v) => v.priceMin)) return null;

  const rows: Array<{ label: string; key: keyof ReturnType<typeof calcEMIDetails>; highlight?: boolean }> = [
    { label: "Ex-showroom Price", key: "price" },
    { label: `Down Payment (${downPct}%)`, key: "down" },
    { label: "Loan Amount", key: "loan" },
    { label: "Monthly EMI", key: "emi", highlight: true },
    { label: "Total Interest", key: "totalInterest" },
    { label: "Total Payable", key: "totalPayable" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden no-print">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
            <Calculator className="w-3.5 h-3.5 text-green-700" />
          </div>
          <p className="font-bold text-sm text-slate-800">EMI Calculator</p>
          {!open && <span className="hidden sm:inline text-[10px] text-gray-400">Adjust down payment, rate &amp; tenure</span>}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-5 py-4 bg-slate-50">
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Down Payment</label>
                <span className="text-xs font-black text-blue-700">{downPct}%</span>
              </div>
              <input
                type="range" min={10} max={50} step={5} value={downPct}
                onChange={(e) => setDownPct(+e.target.value)}
                className="w-full accent-blue-600 h-1.5 cursor-pointer"
              />
              <div className="flex justify-between mt-0.5">
                <span className="text-[9px] text-gray-400">10%</span>
                <span className="text-[9px] text-gray-400">50%</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Interest Rate</label>
              <select
                value={rate} onChange={(e) => setRate(+e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400 font-semibold text-slate-700"
              >
                {EMI_RATES.map((r) => <option key={r} value={r}>{r}% p.a.</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Loan Tenure</label>
              <select
                value={tenure} onChange={(e) => setTenure(+e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-blue-400 font-semibold text-slate-700"
              >
                {EMI_TENURES.map((t) => <option key={t.v} value={t.v}>{t.v} months ({t.l})</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-white">
                  <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400">Details</th>
                  {vehicles.map((v) => (
                    <th key={v.id} className="py-2.5 px-4 text-center">
                      <p className="text-[9px] text-gray-400">{v.brand.name}</p>
                      <p className="font-bold text-xs text-slate-800">{v.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.key} className={`border-b border-gray-50 ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                    <td className="py-3 px-5 text-xs font-medium text-gray-500">{row.label}</td>
                    {vehicles.map((v) => {
                      if (!v.priceMin) return <td key={v.id} className="py-3 px-4 text-center text-xs text-gray-300">—</td>;
                      const d = calcEMIDetails(v.priceMin, downPct, rate, tenure);
                      return (
                        <td key={v.id} className="py-3 px-4 text-center">
                          {row.highlight
                            ? <span className="text-base font-black text-green-700">{fmtAmt(d[row.key])}<span className="text-[9px] font-semibold text-green-600">/mo</span></span>
                            : <span className="text-xs font-semibold text-slate-700">{fmtAmt(d[row.key])}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="px-5 py-2.5 text-[10px] text-gray-400 border-t border-gray-100">
            * EMI calculated on ex-showroom price. On-road price includes RTO, insurance &amp; accessories. Consult dealer for actual EMI.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Lead Modal ────────────────────────────────────────────────────────────────

const LEAD_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Chandigarh", "Indore", "Bhopal", "Kochi", "Other",
];

function LeadModal({
  vehicle, intent, onClose,
}: {
  vehicle: CompareVehicle;
  intent: "quote" | "test_drive";
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const title = intent === "quote" ? "Get Best Price" : "Book Test Drive";
  const cta = intent === "quote" ? "Get Dealer Quote →" : "Book Test Drive →";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !city) { setError("Please fill all fields."); return; }
    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, "").slice(-10))) { setError("Enter a valid 10-digit phone number."); return; }
    setLoading(true); setError("");
    try {
      await fetch("/api/compare/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, phone, city, intent,
          vehicleName: vehicle.name,
          vehicleSlug: vehicle.slug,
          brandName: vehicle.brand.name,
          source: "compare",
        }),
      });
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm z-10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-black text-slate-900 text-base">{title}</p>
            <p className="text-xs text-gray-500">{vehicle.brand.name} {vehicle.name} · {fmtPrice(vehicle)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <p className="font-bold text-slate-900 text-base mb-1">
              {intent === "quote" ? "Request Submitted!" : "Test Drive Booked!"}
            </p>
            <p className="text-sm text-gray-500">
              {intent === "quote"
                ? "A dealer will contact you within 24 hours with the best price."
                : "A dealer will confirm your test drive slot within 24 hours."}
            </p>
            <button onClick={onClose} className="mt-5 text-sm text-blue-600 font-semibold hover:underline">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-5 space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Your Name" autoComplete="name"
                className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Mobile Number (10 digits)" type="tel" maxLength={10} autoComplete="tel"
                className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={city} onChange={(e) => setCity(e.target.value)}
                className="w-full pl-9 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-blue-400 bg-white appearance-none text-slate-700"
              >
                <option value="">Select Your City</option>
                {LEAD_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</>
                : cta}
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              By submitting, you agree to be contacted by authorised dealers. No spam.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Vehicle header card ───────────────────────────────────────────────────────

function VehicleHeaderCard({
  v, variantIdx, onVariantChange, onGetQuote,
}: {
  v: CompareVehicle;
  variantIdx: number;
  onVariantChange: (idx: number) => void;
  onGetQuote?: (intent: "quote" | "test_drive") => void;
}) {
  const [showVariants, setShowVariants] = useState(false);
  const img = v.images[0]?.url || "/placeholder.svg";
  const variant = v.variants[variantIdx] || v.variants.find((va) => va.isDefault) || v.variants[0];
  const hasMultipleVariants = v.variants.length > 1;

  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="relative h-28 w-full mb-3">
        <Image src={img} alt={v.name} fill className="object-contain" sizes="200px" />
      </div>

      <p className="text-[10px] text-gray-400 mb-0.5">{v.brand.name}</p>
      <p className="font-bold text-slate-900 text-sm leading-tight mb-1">{v.name}</p>
      <p className="font-black text-blue-700 text-base mb-2">{fmtPrice(v)}</p>

      {/* Variant selector */}
      {hasMultipleVariants && (
        <div className="relative w-full mb-3">
          <button
            onClick={() => setShowVariants((p) => !p)}
            className="w-full flex items-center justify-between gap-1 text-[10px] bg-slate-50 border border-gray-200 hover:border-blue-300 text-slate-700 rounded-lg px-2.5 py-1.5 transition-colors"
          >
            <span className="truncate font-semibold">{variant?.name || "Base"}</span>
            <ChevronDown className={`w-3 h-3 flex-shrink-0 text-gray-400 transition-transform ${showVariants ? "rotate-180" : ""}`} />
          </button>
          {showVariants && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl z-30 mt-1 max-h-40 overflow-y-auto">
              {v.variants.map((va, idx) => (
                <button
                  key={va.id}
                  onClick={() => { onVariantChange(idx); setShowVariants(false); }}
                  className={`w-full text-left px-3 py-2 text-[10px] hover:bg-blue-50 transition-colors ${idx === variantIdx ? "text-blue-700 font-bold bg-blue-50/60" : "text-slate-700 font-medium"}`}
                >
                  <p className="truncate">{va.name}</p>
                  {va.priceDisplay && <p className="text-[9px] text-blue-600 font-semibold">{va.priceDisplay}</p>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spec pills */}
      <div className="flex flex-wrap gap-1 justify-center mb-3">
        {variant?.fuelType && (
          <span className="flex items-center gap-0.5 text-[9px] bg-slate-50 border border-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
            <FuelIcon fuel={variant.fuelType} cn="w-2.5 h-2.5" />{variant.fuelType}
          </span>
        )}
        {variant?.transmission && (
          <span className="flex items-center gap-0.5 text-[9px] bg-slate-50 border border-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
            <Settings2 className="w-2.5 h-2.5 text-gray-400" />{variant.transmission}
          </span>
        )}
        {(variant?.mileage || variant?.range) && (
          <span className="flex items-center gap-0.5 text-[9px] bg-slate-50 border border-gray-100 px-1.5 py-0.5 rounded-full text-gray-500">
            {v.isElectric ? <BatteryCharging className="w-2.5 h-2.5 text-teal-500" /> : <Gauge className="w-2.5 h-2.5 text-gray-400" />}
            {v.isElectric ? variant?.range : variant?.mileage}
          </span>
        )}
      </div>

      {/* View details */}
      <Link
        href={`/${typeToPath(v.type)}/${v.brand.slug}/${v.slug}`}
        className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 text-[10px] font-bold transition-colors mb-2"
      >
        View Details
      </Link>

      {/* CTA buttons */}
      {onGetQuote && (
        <div className="flex gap-2 w-full">
          <button
            onClick={() => onGetQuote("quote")}
            className="flex-1 flex items-center justify-center gap-1 text-[9px] border border-green-400 text-green-700 hover:bg-green-50 rounded-lg py-1.5 font-bold transition-colors"
          >
            <Tag className="w-2.5 h-2.5" /> Get Quote
          </button>
          <button
            onClick={() => onGetQuote("test_drive")}
            className="flex-1 text-[9px] border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg py-1.5 font-bold transition-colors"
          >
            Test Drive
          </button>
        </div>
      )}
    </div>
  );
}

// ── Spec table ────────────────────────────────────────────────────────────────

function SpecTable({
  vehicles, activeGroup, highlightDiffs, hideCommon,
}: {
  vehicles: CompareVehicle[];
  activeGroup: string | null;
  highlightDiffs: boolean;
  hideCommon: boolean;
}) {
  const allGroups = Array.from(
    new Map(vehicles.flatMap((v) => v.specGroups.map((sg) => [sg.group.name, sg.group]))).values()
  ).sort((a, b) => a.sortOrder - b.sortOrder);
  const groups = activeGroup ? allGroups.filter((g) => g.name === activeGroup) : allGroups;

  function getValue(v: CompareVehicle, groupName: string, itemName: string): string {
    const sg = v.specGroups.find((sg) => sg.group.name === groupName);
    const sv = sg?.specValues.find((sv) => sv.specItem.name === itemName);
    if (!sv) return "—";
    return sv.specItem.unit ? `${sv.value} ${sv.specItem.unit}` : sv.value;
  }

  if (!groups.length) {
    return (
      <div className="p-10 text-center text-sm text-gray-400">
        No spec data yet. Add specs via the admin panel.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: 180 + vehicles.length * 150 }}>
        {groups.map((group) => {
          const itemsMap = new Map<string, { name: string; unit: string | null; sortOrder: number }>();
          for (const v of vehicles) {
            const sg = v.specGroups.find((sg) => sg.group.name === group.name);
            for (const sv of sg?.specValues || []) itemsMap.set(sv.specItem.name, sv.specItem);
          }
          const items = Array.from(itemsMap.values()).sort((a, b) => a.sortOrder - b.sortOrder);
          const visible = items.filter((item) => {
            const vals = vehicles.map((v) => getValue(v, group.name, item.name));
            if (!vals.some((v) => v !== "—")) return false;
            if (hideCommon && vals.every((v) => v === vals[0]) && vals[0] !== "—") return false;
            return true;
          });
          if (!visible.length) return null;

          return (
            <tbody key={group.name}>
              <tr className="bg-blue-700">
                <td colSpan={1 + vehicles.length} className="py-2 px-5 text-[11px] font-bold text-white uppercase tracking-widest sticky left-0 bg-blue-700">
                  {group.name}
                </td>
              </tr>
              {visible.map((item, rowIdx) => {
                const vals = vehicles.map((v) => getValue(v, group.name, item.name));
                const allSame = vals.every((v) => v === vals[0]);
                const winnerIdx = getWinnerIdx(vals, item.name);
                return (
                  <tr key={item.name}
                    className={`border-b border-gray-100 transition-colors ${rowIdx % 2 === 0 ? "bg-white hover:bg-blue-50/20" : "bg-slate-50/50 hover:bg-blue-50/30"}`}>
                    <td className="py-3 px-5 text-xs font-medium text-gray-500 align-middle sticky left-0 bg-inherit"
                      style={{ minWidth: 160, maxWidth: 200 }}>
                      {item.name}
                    </td>
                    {vals.map((val, i) => (
                      <td key={i}
                        className={`py-3 px-4 text-center text-xs font-semibold align-middle
                          ${val === "—" ? "text-gray-300"
                            : highlightDiffs && !allSame ? "text-amber-700 bg-amber-50/60"
                            : "text-slate-800"}`}>
                        <span>{val}</span>
                        {winnerIdx === i && val !== "—" && (
                          <span className="flex items-center justify-center gap-0.5 mt-1 text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full mx-auto w-fit">
                            <Trophy className="w-2 h-2" /> Best
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

// ── Pros & Cons ───────────────────────────────────────────────────────────────

function ProsConsSection({ vehicles }: { vehicles: CompareVehicle[] }) {
  const [tab, setTab] = useState<"pros" | "cons">("pros");
  const hasPros = vehicles.some((v) => safeArr(v.pros).length > 0);
  const hasCons = vehicles.some((v) => safeArr(v.cons).length > 0);
  if (!hasPros && !hasCons) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
        <h3 className="font-bold text-slate-800 text-sm flex-1">Pros &amp; Cons</h3>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-xs">
          <button onClick={() => setTab("pros")}
            className={`px-3 py-1.5 font-semibold transition-colors ${tab === "pros" ? "bg-green-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
            Pros
          </button>
          <button onClick={() => setTab("cons")}
            className={`px-3 py-1.5 font-semibold transition-colors ${tab === "cons" ? "bg-red-500 text-white" : "text-gray-500 hover:bg-gray-50"}`}>
            Cons
          </button>
        </div>
      </div>
      <div className="grid divide-x divide-gray-100" style={{ gridTemplateColumns: `repeat(${vehicles.length}, 1fr)` }}>
        {vehicles.map((v) => {
          const items = safeArr(tab === "pros" ? v.pros : v.cons);
          return (
            <div key={v.id} className="p-4">
              <p className="font-bold text-xs text-slate-700 mb-3 truncate">{v.name}</p>
              {items.length === 0
                ? <p className="text-xs text-gray-400 italic">No data</p>
                : (
                  <ul className="space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                        <span className={`w-4 h-4 rounded-full flex-shrink-0 mt-0.5 flex items-center justify-center ${tab === "pros" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}>
                          {tab === "pros" ? <Check className="w-2.5 h-2.5" /> : <Minus className="w-2.5 h-2.5" />}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Features comparison ───────────────────────────────────────────────────────

function FeaturesSection({ vehicles }: { vehicles: CompareVehicle[] }) {
  const catMap = new Map<string, Set<string>>();
  for (const v of vehicles) {
    for (const f of v.features) {
      if (!catMap.has(f.category)) catMap.set(f.category, new Set());
      catMap.get(f.category)!.add(f.name);
    }
  }
  if (!catMap.size) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100">
        <h3 className="font-bold text-slate-800 text-sm">Features Comparison</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50">
              <th className="text-left py-2.5 px-5 text-xs font-medium text-gray-400 sticky left-0 bg-slate-50" style={{ minWidth: 160 }}>Feature</th>
              {vehicles.map((v) => <th key={v.id} className="py-2.5 px-4 text-center text-xs font-bold text-slate-800">{v.name}</th>)}
            </tr>
          </thead>
          {Array.from(catMap.entries()).map(([cat, names]) => (
            <tbody key={cat}>
              <tr className="bg-blue-700">
                <td colSpan={1 + vehicles.length}
                  className="py-2 px-5 text-[11px] font-bold text-white uppercase tracking-widest sticky left-0 bg-blue-700">
                  {cat}
                </td>
              </tr>
              {Array.from(names).map((name, ri) => (
                <tr key={name} className={`border-b border-gray-50 hover:bg-blue-50/20 transition-colors ${ri % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                  <td className="py-2.5 px-5 text-xs text-gray-500 font-medium sticky left-0 bg-inherit">{name}</td>
                  {vehicles.map((v) => {
                    const f = v.features.find((f) => f.category === cat && f.name === name);
                    return (
                      <td key={v.id} className="py-2.5 px-4 text-center">
                        {f === undefined
                          ? <span className="text-gray-300 text-xs">—</span>
                          : f.available
                          ? <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 rounded-full"><Check className="w-3 h-3 text-green-600" /></span>
                          : <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-100 rounded-full"><X className="w-3 h-3 text-gray-400" /></span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

// ── Share bar ─────────────────────────────────────────────────────────────────

function ShareBar({ vehicles, shareUrl }: { vehicles: CompareVehicle[]; shareUrl?: string }) {
  const [copied, setCopied] = useState(false);
  const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
  const text = `Compare ${vehicles.map((v) => v.name).join(" vs ")} — specs, features & price`;

  function copyLink() {
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  function shareWA() {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + url)}`, "_blank");
  }
  function printPage() {
    window.print();
  }

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button onClick={shareWA}
        className="flex items-center gap-1 text-[10px] sm:text-xs bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-full px-2.5 sm:px-3 py-1.5 font-semibold transition-colors">
        <Share2 className="w-3 h-3" /> <span className="hidden sm:inline">WhatsApp</span>
      </button>
      <button onClick={copyLink}
        className="flex items-center gap-1 text-[10px] sm:text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-200 rounded-full px-2.5 sm:px-3 py-1.5 font-semibold transition-colors">
        <Copy className="w-3 h-3" /> {copied ? "Copied!" : <span className="hidden sm:inline">Copy Link</span>}
      </button>
      <button onClick={printPage}
        className="flex items-center gap-1 text-[10px] sm:text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-gray-200 rounded-full px-2.5 sm:px-3 py-1.5 font-semibold transition-colors no-print">
        <Printer className="w-3 h-3" /> <span className="hidden sm:inline">Print</span>
      </button>
    </div>
  );
}

// ── Toggle checkbox ───────────────────────────────────────────────────────────

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button role="checkbox" aria-checked={checked} onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}>
        {checked && <Check className="w-2.5 h-2.5 text-white" />}
      </button>
      <span className="text-xs text-gray-700 font-medium">{label}</span>
    </label>
  );
}

// ── Floating mobile nav ───────────────────────────────────────────────────────

function FloatingMobileNav({
  groups, activeGroup, onGroupChange,
}: {
  groups: Array<{ name: string; slug: string; sortOrder: number }>;
  activeGroup: string | null;
  onGroupChange: (g: string | null) => void;
}) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => setVisible(!e.isIntersecting),
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} className="h-px" />
      {visible && groups.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-lg no-print">
          <div className="flex overflow-x-auto gap-1 px-3 py-2" style={{ scrollbarWidth: "none" }}>
            <button
              onClick={() => onGroupChange(null)}
              className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors ${activeGroup === null ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
            >
              All
            </button>
            {groups.map((g) => (
              <button
                key={g.name}
                onClick={() => onGroupChange(g.name)}
                className={`flex-shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${activeGroup === g.name ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CompareClientSection({
  vehicles,
  shareUrl,
}: {
  vehicles: CompareVehicle[];
  shareUrl?: string;
}) {
  const [hideCommon, setHideCommon] = useState(false);
  const [highlightDiffs, setHighlightDiffs] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [variantMap, setVariantMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const v of vehicles) {
      const defIdx = v.variants.findIndex((va) => va.isDefault);
      map[v.id] = defIdx < 0 ? 0 : defIdx;
    }
    return map;
  });
  const [leadModal, setLeadModal] = useState<{ vehicle: CompareVehicle; intent: "quote" | "test_drive" } | null>(null);

  const allGroups = Array.from(
    new Map(vehicles.flatMap((v) => v.specGroups.map((sg) => [sg.group.name, sg.group]))).values()
  ).sort((a, b) => a.sortOrder - b.sortOrder);

  function setVariantIdx(vehicleId: string, idx: number) {
    setVariantMap((prev) => ({ ...prev, [vehicleId]: idx }));
  }

  return (
    <>
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          header, footer, nav, .no-print { display: none !important; }
          body { background: white !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .bg-blue-700 { background-color: #1d4ed8 !important; }
        }
      ` }} />

      <div className="space-y-4">

        {/* Vehicle header cards */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Comparing {vehicles.length} Vehicles</p>
            <ShareBar vehicles={vehicles} shareUrl={shareUrl} />
          </div>

          {/* Mobile: swipe carousel */}
          <div className="sm:hidden overflow-x-auto snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
            <div className="flex" style={{ width: `${vehicles.length * 100}%` }}>
              {vehicles.map((v) => (
                <div key={v.id} className="snap-start" style={{ width: `${100 / vehicles.length}%` }}>
                  <VehicleHeaderCard
                    v={v}
                    variantIdx={variantMap[v.id] ?? 0}
                    onVariantChange={(idx) => setVariantIdx(v.id, idx)}
                    onGetQuote={(intent) => setLeadModal({ vehicle: v, intent })}
                  />
                </div>
              ))}
            </div>
          </div>
          {vehicles.length > 1 && (
            <p className="sm:hidden text-center text-[10px] text-gray-400 pb-2">← Swipe to see all vehicles →</p>
          )}

          {/* Desktop: side by side */}
          <div className="hidden sm:flex divide-x divide-gray-100">
            {vehicles.map((v, i) => (
              <div key={v.id} className="flex-1 min-w-0 relative">
                {i > 0 && (
                  <div className="absolute -left-4 top-20 z-10 w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center text-[8px] font-black shadow-lg ring-2 ring-white">
                    VS
                  </div>
                )}
                <VehicleHeaderCard
                  v={v}
                  variantIdx={variantMap[v.id] ?? 0}
                  onVariantChange={(idx) => setVariantIdx(v.id, idx)}
                  onGetQuote={(intent) => setLeadModal({ vehicle: v, intent })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Verdict */}
        <AIVerdict vehicles={vehicles} />

        {/* Score Summary */}
        <ScoreSection vehicles={vehicles} />

        {/* EMI Calculator */}
        <EMICalcSection vehicles={vehicles} />

        {/* Controls */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {allGroups.length > 0 && (
            <div className="flex overflow-x-auto border-b border-gray-100" style={{ scrollbarWidth: "none" }}>
              <button onClick={() => setActiveGroup(null)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-bold border-b-2 transition-colors ${activeGroup === null ? "border-blue-600 text-blue-600 bg-blue-50/40" : "border-transparent text-gray-500 hover:text-slate-700"}`}>
                All Specs
              </button>
              {allGroups.map((g) => (
                <button key={g.name} onClick={() => setActiveGroup(g.name)}
                  className={`flex-shrink-0 px-4 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${activeGroup === g.name ? "border-blue-600 text-blue-600 bg-blue-50/40" : "border-transparent text-gray-500 hover:text-slate-700"}`}>
                  {g.name}
                </button>
              ))}
            </div>
          )}
          <div className="px-5 py-3 flex items-center gap-5 flex-wrap">
            <Toggle checked={hideCommon} onChange={() => setHideCommon((p) => !p)} label="Hide Common Specs" />
            <Toggle checked={highlightDiffs} onChange={() => setHighlightDiffs((p) => !p)} label="Highlight Differences" />
            {highlightDiffs && (
              <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                Differences shown in amber
              </span>
            )}
            <span className="ml-auto flex items-center gap-1 text-[10px] text-gray-400">
              <Trophy className="w-3 h-3 text-green-500" />
              <span className="text-green-700 font-semibold">Best</span> = winner in that spec
            </span>
          </div>
        </div>

        {/* Sticky column header + spec table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="sticky top-16 z-20 bg-white border-b-2 border-blue-700 shadow-sm">
            <div className="grid" style={{ gridTemplateColumns: `180px repeat(${vehicles.length}, 1fr)` }}>
              <div className="py-3 px-5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Specification</div>
              {vehicles.map((v) => (
                <div key={v.id} className="py-3 px-3 text-center border-l border-gray-100">
                  <p className="text-[9px] text-gray-400 truncate">{v.brand.name}</p>
                  <p className="font-bold text-xs text-slate-900 truncate">{v.name}</p>
                  <p className="text-xs text-blue-700 font-black">{fmtPrice(v)}</p>
                </div>
              ))}
            </div>
          </div>
          <SpecTable
            vehicles={vehicles}
            activeGroup={activeGroup}
            highlightDiffs={highlightDiffs}
            hideCommon={hideCommon}
          />
        </div>

        {/* Pros & Cons */}
        <ProsConsSection vehicles={vehicles} />

        {/* Features */}
        <FeaturesSection vehicles={vehicles} />

        {/* Floating mobile spec group nav */}
        <FloatingMobileNav groups={allGroups} activeGroup={activeGroup} onGroupChange={setActiveGroup} />

      </div>

      {/* Lead modal */}
      {leadModal && (
        <LeadModal
          vehicle={leadModal.vehicle}
          intent={leadModal.intent}
          onClose={() => setLeadModal(null)}
        />
      )}
    </>
  );
}
