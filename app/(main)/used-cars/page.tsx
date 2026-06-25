import Link from "next/link";
import {
  Search, Tag, Car, Shield, Calculator, MapPin,
  FileText, Wrench, ChevronRight, ArrowRight, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const QUICK_LINKS = [
  { icon: Search, label: "Explore Used Cars", desc: "Browse certified pre-owned vehicles", href: "/used-cars/explore", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { icon: Tag, label: "Sell Your Car", desc: "Get best price for your vehicle", href: "/used-cars/sell", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { icon: Calculator, label: "Car Valuation", desc: "Know your car's current market value", href: "/used-cars/valuation", color: "bg-amber-50 text-amber-700 border-amber-100" },
  { icon: Shield, label: "abSure Certified", desc: "130-point inspected & certified cars", href: "/used-cars/absure", color: "bg-purple-50 text-purple-700 border-purple-100" },
  { icon: Car, label: "Used Car Loan", desc: "Loans from ₹1L at low interest", href: "/used-cars/loan", color: "bg-teal-50 text-teal-700 border-teal-100" },
  { icon: MapPin, label: "Find Dealers", desc: "Certified used car dealers near you", href: "/used-cars/dealers", color: "bg-rose-50 text-rose-700 border-rose-100" },
  { icon: FileText, label: "My Listings", desc: "Manage your car listings", href: "/used-cars/my-listings", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { icon: Wrench, label: "Car Inspection", desc: "Book a pre-purchase inspection", href: "/used-cars/inspection", color: "bg-orange-50 text-orange-700 border-orange-100" },
];

const WHY_US = [
  { icon: CheckCircle2, title: "130-Point Inspection", desc: "Every car goes through rigorous quality checks before listing." },
  { icon: Shield, title: "6-Month Warranty", desc: "Drive with peace of mind with our warranty coverage." },
  { icon: Calculator, title: "Easy Financing", desc: "Instant loan approvals starting from 8.5% interest." },
  { icon: FileText, title: "Free RC Transfer", desc: "We handle all paperwork — smooth ownership transfer." },
];

export default function UsedCarsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-900 text-white py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-emerald-200 hover:text-white">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-400" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Used Cars</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-4xl font-bold mb-3 leading-tight">
              Buy & Sell Used Cars<br />
              <span className="text-emerald-300">Trusted. Certified. Easy.</span>
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base mb-8">
              Find the best certified pre-owned cars — inspected, warranted, and ready to drive. Sell yours at the best price in 30 minutes.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/used-cars/explore">
                <Button className="bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-6 h-11 shadow-lg">
                  <Search className="w-4 h-4 mr-2" /> Browse Used Cars
                </Button>
              </Link>
              <Link href="/used-cars/sell">
                <Button variant="outline" className="border-emerald-300 text-white hover:bg-emerald-800 font-bold px-6 h-11">
                  <Tag className="w-4 h-4 mr-2" /> Sell Your Car
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick links grid */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <h2 className="font-bold text-slate-900 text-lg mb-4">What are you looking for?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`group flex flex-col p-4 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${link.color}`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-sm leading-tight mb-1">{link.label}</p>
                <p className="text-xs opacity-70 leading-snug">{link.desc}</p>
                <span className="inline-flex items-center gap-1 text-xs font-semibold mt-3 opacity-80 group-hover:gap-2 transition-all">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Why buy used cars section */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-emerald-700 font-semibold text-xs uppercase tracking-widest mb-1">Our Promise</p>
              <h2 className="text-xl font-bold text-slate-900">Why Buy From Us?</h2>
            </div>
            <Link href="/used-cars/absure" className="flex items-center gap-1 text-emerald-700 font-semibold text-sm hover:gap-2 transition-all">
              Learn More <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHY_US.map((w) => {
              const Icon = w.icon;
              return (
                <div key={w.title} className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 mb-1">{w.title}</p>
                    <p className="text-xs text-gray-500 leading-snug">{w.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sell CTA banner */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-12">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold mb-1">Ready to sell your car?</h3>
            <p className="text-blue-200 text-sm">Get your car evaluated & sell at the best price — paperwork included.</p>
          </div>
          <Link href="/used-cars/sell" className="flex-shrink-0">
            <Button className="bg-white text-blue-800 hover:bg-blue-50 font-bold px-8 h-11 shadow-lg">
              Sell Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
