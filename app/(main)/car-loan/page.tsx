"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calculator, ChevronRight, CheckCircle2, Building2, ArrowRight, Phone, Percent, IndianRupee } from "lucide-react";

const BANKS = [
  { name: "SBI", rate: 8.65, tenure: "7 years", processing: "0.35%", badge: "Lowest Rate" },
  { name: "HDFC Bank", rate: 8.75, tenure: "7 years", processing: "0.50%", badge: "Most Popular" },
  { name: "ICICI Bank", rate: 9.00, tenure: "7 years", processing: "0.50%", badge: "" },
  { name: "Axis Bank", rate: 9.25, tenure: "7 years", processing: "1.00%", badge: "" },
  { name: "Kotak Mahindra", rate: 8.99, tenure: "7 years", processing: "1.00%", badge: "" },
  { name: "Bank of Baroda", rate: 8.80, tenure: "7 years", processing: "0.50%", badge: "" },
];

export default function CarLoanPage() {
  const [principal, setPrincipal] = useState(800000);
  const [rate, setRate] = useState(8.75);
  const [tenure, setTenure] = useState(5);

  const emi = useMemo(() => {
    const r = rate / 12 / 100;
    const n = tenure * 12;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [principal, rate, tenure]);

  const totalAmount = emi * tenure * 12;
  const totalInterest = totalAmount - principal;

  function fmt(n: number) {
    return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Car Loan</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-700/50 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Car Loan</h1>
              <p className="text-blue-200 text-sm">Compare rates from 20+ banks. Get instant approval.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {["Starting from 8.65% p.a.", "Loans up to ₹1 Crore", "Instant Online Approval", "Flexible 1–7 Year Tenure"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Calculator */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-5 h-5 text-blue-700" />
                <h2 className="font-bold text-gray-900 text-lg">Car Loan Calculator</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Loan Amount</label>
                    <span className="text-sm font-bold text-blue-700">₹{fmt(principal)}</span>
                  </div>
                  <input type="range" min={100000} max={5000000} step={50000} value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-700" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹1 Lakh</span><span>₹50 Lakh</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Interest Rate (p.a.)</label>
                    <span className="text-sm font-bold text-blue-700">{rate}%</span>
                  </div>
                  <input type="range" min={7} max={16} step={0.25} value={rate}
                    onChange={(e) => setRate(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-700" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>7%</span><span>16%</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Loan Tenure</label>
                    <span className="text-sm font-bold text-blue-700">{tenure} Years</span>
                  </div>
                  <input type="range" min={1} max={7} step={1} value={tenure}
                    onChange={(e) => setTenure(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-700" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 Year</span><span>7 Years</span>
                  </div>
                </div>
              </div>

              <div className="mt-7 bg-gradient-to-r from-blue-700 to-blue-800 rounded-2xl p-6 text-white">
                <p className="text-blue-200 text-xs uppercase tracking-widest font-bold mb-1">Monthly EMI</p>
                <p className="text-4xl font-black mb-5">₹{fmt(emi)}</p>
                <div className="grid grid-cols-3 gap-4 border-t border-blue-600/50 pt-4">
                  <div>
                    <p className="text-blue-300 text-[10px] uppercase tracking-wider mb-0.5">Principal</p>
                    <p className="font-bold text-sm">₹{fmt(principal)}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-[10px] uppercase tracking-wider mb-0.5">Total Interest</p>
                    <p className="font-bold text-sm">₹{fmt(totalInterest)}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-[10px] uppercase tracking-wider mb-0.5">Total Amount</p>
                    <p className="font-bold text-sm">₹{fmt(totalAmount)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank comparison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Compare Bank Rates</h2>
              <div className="space-y-3">
                {BANKS.map((b) => {
                  const r = b.rate / 12 / 100;
                  const n = tenure * 12;
                  const bankEmi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                  return (
                    <div key={b.name} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm">{b.name}</p>
                            {b.badge && <span className="text-[9px] font-bold text-white bg-blue-700 px-1.5 py-0.5 rounded-full">{b.badge}</span>}
                          </div>
                          <p className="text-xs text-gray-400">Processing: {b.processing}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end mb-0.5">
                          <Percent className="w-3 h-3 text-blue-600" />
                          <p className="font-bold text-blue-700 text-sm">{b.rate}% p.a.</p>
                        </div>
                        <p className="text-xs text-gray-500">EMI: ₹{fmt(bankEmi)}/mo</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Apply for Car Loan</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Your Full Name"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                <input type="tel" placeholder="Mobile Number"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                <input type="text" placeholder="Car Model (e.g. Tata Nexon)"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm" />
                <select className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none appearance-none focus:border-blue-500">
                  <option>Annual Income</option>
                  <option>Below ₹3 Lakh</option>
                  <option>₹3L – ₹6L</option>
                  <option>₹6L – ₹12L</option>
                  <option>Above ₹12L</option>
                </select>
                <button className="w-full h-12 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                  Check Eligibility <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-3">Free check • No CIBIL impact • Instant result</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <h4 className="font-bold text-gray-900 text-sm mb-3">Eligibility Checklist</h4>
              <ul className="space-y-2">
                {["Age 21–65 years", "Salaried or Self-Employed", "Minimum income ₹20,000/month", "CIBIL score 700+", "6 months bank statements", "KYC documents"].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-gray-600">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="font-bold text-gray-900 text-sm mb-1">Need Help?</p>
              <p className="text-xs text-gray-500 mb-4">Our loan advisors are available Mon–Sat, 9am–7pm.</p>
              <a href="tel:18001234567"
                className="flex items-center justify-center gap-2 h-10 w-full bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-all">
                <Phone className="w-4 h-4" /> 1800-123-4567
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
