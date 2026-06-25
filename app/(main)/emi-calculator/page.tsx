import type { Metadata } from "next";
import { EMICalculator } from "@/components/emi-calculator";
import Link from "next/link";
import { Calculator, ChevronRight, Shield, TrendingDown, CreditCard, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Car EMI Calculator India 2026 | Walley",
  description: "Calculate your car loan EMI instantly. Enter car price, down payment, interest rate & tenure to get accurate monthly instalment. Compare banks.",
};

export default function EMICalculatorPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">EMI Calculator</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-700/60 border border-blue-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Calculator className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-1">Car Loan EMI Calculator</h1>
              <p className="text-blue-200 text-sm max-w-xl">
                Calculate your exact monthly instalment in seconds. Compare rates across tenures and plan your car purchase confidently.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            {[
              { Icon: Shield,      text: "100% Accurate Formula" },
              { Icon: TrendingDown,text: "Compare Multiple Rates"  },
              { Icon: CreditCard,  text: "All Banks Covered"       },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-300">
                <Icon className="w-3.5 h-3.5 text-blue-400" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Calculator + sidebar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <div>
            <EMICalculator carPrice={1000000} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-5">
            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-blue-600" />
                <p className="text-sm font-bold text-gray-800">How EMI is Calculated</p>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                EMI = <code className="bg-gray-50 px-1 py-0.5 rounded text-blue-700">P × r × (1+r)ⁿ / ((1+r)ⁿ − 1)</code>
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li><strong>P</strong> = Principal loan amount</li>
                <li><strong>r</strong> = Monthly interest rate</li>
                <li><strong>n</strong> = Number of months</li>
              </ul>
            </div>

            {/* Average rates */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-800 mb-3">Bank Interest Rates</p>
              <div className="space-y-2">
                {[
                  { bank: "SBI",       rate: "8.85%",  tag: ""       },
                  { bank: "HDFC Bank", rate: "8.75%",  tag: "Lowest" },
                  { bank: "ICICI",     rate: "9.00%",  tag: ""       },
                  { bank: "Axis Bank", rate: "9.25%",  tag: ""       },
                  { bank: "Kotak",     rate: "8.99%",  tag: ""       },
                ].map((b) => (
                  <div key={b.bank} className="flex items-center justify-between text-xs border-b border-gray-50 pb-1.5">
                    <span className="text-gray-600">{b.bank}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="font-bold text-blue-700">{b.rate}</span>
                      {b.tag && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 rounded-full">{b.tag}</span>}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 mt-2">*Indicative rates. Check with bank for latest.</p>
            </div>

            {/* CTA */}
            <div className="bg-blue-700 rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-1">Ready to buy?</p>
              <p className="text-blue-200 text-xs mb-4">Book a test drive today — free, no obligation.</p>
              <Link href="/test-drive"
                className="block text-center text-xs font-bold bg-white text-blue-700 hover:bg-blue-50 rounded-xl py-2.5 transition-colors">
                Book Test Drive →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
