"use client";

import { useState, useMemo } from "react";
import { IndianRupee, Percent, Calendar, TrendingDown } from "lucide-react";

interface EMICalculatorProps {
  carPrice?: number;
  carName?: string;
}

const TENURE_OPTIONS = [1, 2, 3, 4, 5, 6, 7];

function fmt(n: number): string {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

function fmtShort(n: number): string {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `${(n / 100000).toFixed(2)} L`;
  return Math.round(n).toLocaleString("en-IN");
}

export function EMICalculator({ carPrice = 800000, carName }: EMICalculatorProps) {
  const [downPct, setDownPct]   = useState(20);   // % of car price
  const [rate, setRate]         = useState(8.5);  // annual %
  const [tenure, setTenure]     = useState(5);    // years

  const downPayment  = Math.round((carPrice * downPct) / 100);
  const loanAmount   = carPrice - downPayment;

  const result = useMemo(() => {
    if (loanAmount <= 0) return null;
    const r = rate / 12 / 100;
    const n = tenure * 12;
    const emi = r > 0
      ? (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
      : loanAmount / n;
    const totalPayable = emi * n;
    const totalInterest = totalPayable - loanAmount;
    const principalPct = Math.round((loanAmount / totalPayable) * 100);
    const interestPct  = 100 - principalPct;
    return {
      emi: Math.round(emi),
      totalPayable: Math.round(totalPayable),
      totalInterest: Math.round(totalInterest),
      principalPct,
      interestPct,
    };
  }, [loanAmount, rate, tenure]);

  // SVG donut: radius 46, circumference ≈ 289
  const circ = 2 * Math.PI * 46;
  const principalDash = result ? (result.principalPct / 100) * circ : circ;

  return (
    <div className="p-5 space-y-6">
      {carName && (
        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{carName}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Inputs ── */}
        <div className="space-y-5">
          {/* Car price display */}
          <div className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center justify-between border border-slate-100">
            <span className="text-sm font-medium text-gray-500">Vehicle Price</span>
            <span className="text-base font-extrabold text-slate-900">{fmt(carPrice)}</span>
          </div>

          {/* Down Payment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-blue-500" /> Down Payment
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                  {downPct}%
                </span>
                <span className="text-xs text-gray-400">{fmt(downPayment)}</span>
              </div>
            </div>
            <input
              type="range"
              min={5}
              max={60}
              step={5}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>5%</span>
              <span>60%</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                <TrendingDown className="w-3.5 h-3.5 text-indigo-500" /> Interest Rate
              </label>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                {rate.toFixed(1)}% p.a.
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={15}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>6%</span>
              <span>15%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-violet-500" /> Loan Tenure
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {TENURE_OPTIONS.map((y) => (
                <button
                  key={y}
                  onClick={() => setTenure(y)}
                  className={`flex-1 min-w-[44px] py-2 rounded-xl text-xs font-bold border transition-all ${
                    tenure === y
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600"
                  }`}
                >
                  {y}Y
                </button>
              ))}
            </div>
          </div>

          {/* Loan amount chip */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-4 text-white">
            <p className="text-xs font-semibold opacity-80 mb-1">Loan Amount</p>
            <p className="text-2xl font-extrabold">{fmt(loanAmount)}</p>
            <p className="text-xs opacity-70 mt-1">
              {downPct}% down · {tenure} yr · {rate}% p.a.
            </p>
          </div>
        </div>

        {/* ── Result ── */}
        <div className="flex flex-col items-center justify-between gap-5">
          {result ? (
            <>
              {/* Donut chart */}
              <div className="relative w-44 h-44">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="-rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="#e0e7ff"
                    strokeWidth="8"
                  />
                  {/* Principal arc */}
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${principalDash} ${circ}`}
                    strokeLinecap="round"
                  />
                  {/* Interest arc */}
                  <circle
                    cx="50" cy="50" r="46"
                    fill="none"
                    stroke="#818cf8"
                    strokeWidth="8"
                    strokeDasharray={`${circ - principalDash} ${circ}`}
                    strokeDashoffset={-principalDash}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Monthly EMI</p>
                  <p className="text-xl font-extrabold text-slate-900 leading-tight">
                    ₹{fmtShort(result.emi)}
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-gray-500">Principal <strong className="text-gray-700">{result.principalPct}%</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-indigo-400 shrink-0" />
                  <span className="text-gray-500">Interest <strong className="text-gray-700">{result.interestPct}%</strong></span>
                </div>
              </div>

              {/* Breakdown table */}
              <div className="w-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                {[
                  { label: "Down Payment",       value: fmt(downPayment),          color: "text-gray-700" },
                  { label: "Loan Amount",         value: fmt(loanAmount),           color: "text-blue-700" },
                  { label: "Total Interest",      value: fmt(result.totalInterest), color: "text-indigo-600" },
                  { label: "Total Amount Payable",value: fmt(result.totalPayable),  color: "text-slate-900", bold: true },
                ].map((row, i, arr) => (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between px-4 py-2.5 text-sm ${
                      i < arr.length - 1 ? "border-b border-slate-100" : "bg-white"
                    }`}
                  >
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-bold ${row.color} ${row.bold ? "text-base" : ""}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <IndianRupee className="w-10 h-10 text-gray-200 mb-3" />
              <p className="text-sm text-gray-400">Adjust sliders to calculate EMI</p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
        {[
          { icon: "💰", tip: "Higher down payment = lower EMI and less total interest paid." },
          { icon: "📅", tip: "Shorter tenure means higher EMI but saves significantly on interest." },
          { icon: "🏦", tip: "A good credit score (750+) can help you secure rates below 8%." },
        ].map((t) => (
          <div key={t.tip} className="flex items-start gap-2 text-xs text-gray-500">
            <span className="text-base shrink-0">{t.icon}</span>
            <p>{t.tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
