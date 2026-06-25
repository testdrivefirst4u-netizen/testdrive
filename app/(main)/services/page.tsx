import type { Metadata } from "next";
import Link from "next/link";
import {
  Wrench, ChevronRight, CheckCircle2, Clock, Star, Phone,
  ArrowRight, Shield, CalendarCheck, MapPin, IndianRupee,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Car Service & Maintenance — Book Online | Walley",
  description: "Book car service, periodic maintenance, and repairs at authorised service centres across India. Compare service packages and save up to 30%.",
};

const PACKAGES = [
  {
    name: "Basic Service",
    price: "₹1,499",
    time: "2–3 hrs",
    badge: "",
    items: ["Engine Oil Change", "Oil Filter Replacement", "Air Filter Check", "Tyre Pressure Check", "Battery Check", "Brake Inspection"],
  },
  {
    name: "Standard Service",
    price: "₹2,999",
    time: "3–4 hrs",
    badge: "Popular",
    items: ["Everything in Basic", "Coolant Top-up", "AC Filter Clean", "Wheel Alignment Check", "Wiper Blade Check", "20-point Inspection Report"],
  },
  {
    name: "Comprehensive Service",
    price: "₹5,499",
    time: "4–6 hrs",
    badge: "Best Value",
    items: ["Everything in Standard", "Spark Plug Replacement", "Brake Fluid Change", "Transmission Check", "Underbody Inspection", "30-day Service Warranty"],
  },
];

const POPULAR_REPAIRS = [
  { name: "AC Repair & Gas Top-up", from: "₹1,200", icon: "❄️" },
  { name: "Tyre Replacement (set of 4)", from: "₹8,000", icon: "🛞" },
  { name: "Battery Replacement", from: "₹3,500", icon: "🔋" },
  { name: "Brake Pad Replacement", from: "₹1,800", icon: "🛑" },
  { name: "Windshield Replacement", from: "₹4,500", icon: "🔍" },
  { name: "Denting & Painting", from: "₹2,000", icon: "🎨" },
];

const CENTRES = [
  { name: "Tata Authorised Service – Begumpet", city: "Hyderabad", rating: 4.7, reviews: 312, wait: "Same Day" },
  { name: "Hyundai Service Centre – Kondapur", city: "Hyderabad", rating: 4.5, reviews: 218, wait: "Next Day" },
  { name: "Maruti True Value Service – Madhapur", city: "Hyderabad", rating: 4.4, reviews: 489, wait: "Same Day" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-teal-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-teal-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Car Service</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-teal-700/50 border border-teal-500/30 rounded-2xl flex items-center justify-center">
              <Wrench className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Car Service & Maintenance</h1>
              <p className="text-teal-200 text-sm">Book at 500+ authorised service centres across India</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {["Authorised Centres Only", "Up to 30% Off MRP", "Free Pickup & Drop", "30-day Service Warranty"].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Quick booking strip */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10">
          <div className="flex items-center gap-2 mb-5">
            <CalendarCheck className="w-5 h-5 text-teal-700" />
            <h2 className="font-bold text-gray-900">Book a Service Appointment</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <input type="text" placeholder="Car Registration (e.g. TS09AB1234)"
              className="h-11 px-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none text-sm transition-all" />
            <select className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none appearance-none focus:border-teal-500 transition-all">
              <option>Select Service Type</option>
              <option>Basic Service</option>
              <option>Standard Service</option>
              <option>Comprehensive Service</option>
              <option>AC Repair</option>
              <option>Tyre Replacement</option>
              <option>Custom / Other</option>
            </select>
            <select className="h-11 px-4 rounded-xl border border-gray-200 bg-white text-sm outline-none appearance-none focus:border-teal-500 transition-all">
              <option>Select City</option>
              <option>Hyderabad</option>
              <option>Mumbai</option>
              <option>Delhi</option>
              <option>Bengaluru</option>
              <option>Chennai</option>
              <option>Pune</option>
            </select>
            <Link href="/contact"
              className="h-11 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              Book Now <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">Our team will call you within 30 minutes to confirm the slot.</p>
        </div>

        {/* Service packages */}
        <h2 className="font-bold text-gray-900 text-xl mb-6">Service Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {PACKAGES.map((p) => (
            <div key={p.name} className={`bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${p.badge === "Popular" ? "border-teal-400" : "border-gray-100"}`}>
              {p.badge && (
                <div className={`text-center text-[10px] font-bold py-1.5 uppercase tracking-wider ${p.badge === "Popular" ? "bg-teal-700 text-white" : "bg-amber-500 text-white"}`}>
                  {p.badge}
                </div>
              )}
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg mb-1">{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <p className="text-2xl font-extrabold text-teal-700">{p.price}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" /> {p.time}
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
                <Link href="/contact"
                  className={`block w-full h-11 font-bold text-sm rounded-xl transition-all flex items-center justify-center ${
                    p.badge === "Popular" ? "bg-teal-700 hover:bg-teal-600 text-white" : "border-2 border-gray-200 hover:border-teal-400 text-gray-700"
                  }`}>
                  Book This Package
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Popular repairs */}
        <h2 className="font-bold text-gray-900 text-xl mb-5">Popular Repairs & Services</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {POPULAR_REPAIRS.map((r) => (
            <Link key={r.name} href="/contact"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center hover:border-teal-300 hover:shadow-md transition-all group">
              <div className="text-2xl mb-2">{r.icon}</div>
              <p className="font-semibold text-xs text-gray-800 leading-tight mb-1 group-hover:text-teal-700 transition-colors">{r.name}</p>
              <p className="text-xs text-teal-700 font-bold">from {r.from}</p>
            </Link>
          ))}
        </div>

        {/* Service centres */}
        <h2 className="font-bold text-gray-900 text-xl mb-5">Nearby Service Centres</h2>
        <div className="space-y-3 mb-12">
          {CENTRES.map((c) => (
            <div key={c.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" /> {c.city}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {c.rating} ({c.reviews})
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <Clock className="w-3 h-3" /> {c.wait}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <a href="tel:18001234567"
                  className="flex items-center gap-1.5 h-9 px-4 border border-gray-200 hover:border-teal-400 text-gray-700 font-semibold text-sm rounded-xl transition-all">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <Link href="/contact"
                  className="flex items-center gap-1.5 h-9 px-4 bg-teal-700 hover:bg-teal-600 text-white font-bold text-sm rounded-xl transition-all">
                  Book Slot
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Why book with us */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          {[
            { Icon: Shield, title: "Genuine Parts Only", desc: "We only work with authorised centres that use OEM-approved parts." },
            { Icon: IndianRupee, title: "Transparent Pricing", desc: "Fixed package prices upfront. No hidden charges or surprise bills." },
            { Icon: CalendarCheck, title: "Free Pickup & Drop", desc: "We pick up your car and return it to your doorstep after service." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
              <div className="w-10 h-10 bg-teal-50 border border-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-teal-700 to-cyan-800 rounded-3xl p-8 text-center text-white">
          <p className="font-extrabold text-xl mb-2">Need a custom service quote?</p>
          <p className="text-teal-100 text-sm mb-6">Tell us your car model and issue — we&apos;ll get you the best price from authorised centres.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 h-11 px-8 bg-white text-teal-700 hover:bg-teal-50 font-bold text-sm rounded-xl transition-all">
            Get a Free Quote <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
