"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, Search, Phone, Star, ChevronRight, Navigation, Car, Clock } from "lucide-react";

const DEALERS = [
  { name: "Tata Motors – Hyderabad Central", brand: "Tata", city: "Hyderabad", area: "Begumpet", phone: "040-12345678", rating: 4.7, reviews: 342, open: "9am – 7pm", distance: "2.3 km" },
  { name: "Hyundai – Kondapur Showroom", brand: "Hyundai", city: "Hyderabad", area: "Kondapur", phone: "040-23456789", rating: 4.5, reviews: 218, open: "9am – 8pm", distance: "4.1 km" },
  { name: "Maruti Arena – Madhapur", brand: "Maruti", city: "Hyderabad", area: "Madhapur", phone: "040-34567890", rating: 4.4, reviews: 567, open: "9am – 7pm", distance: "5.8 km" },
  { name: "Mahindra – Kukatpally", brand: "Mahindra", city: "Hyderabad", area: "Kukatpally", phone: "040-45678901", rating: 4.6, reviews: 189, open: "9am – 7pm", distance: "7.2 km" },
  { name: "Kia – Hi-Tech City", brand: "Kia", city: "Hyderabad", area: "Hi-Tech City", phone: "040-56789012", rating: 4.8, reviews: 413, open: "9am – 8pm", distance: "3.5 km" },
  { name: "Honda Cars – Ameerpet", brand: "Honda", city: "Hyderabad", area: "Ameerpet", phone: "040-67890123", rating: 4.3, reviews: 271, open: "9:30am – 7pm", distance: "6.4 km" },
];

const BRANDS = ["All", "Tata", "Hyundai", "Maruti", "Mahindra", "Kia", "Honda", "Toyota", "Volkswagen"];
const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Pune", "Kolkata"];

export default function DealersPage() {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("All");
  const [city, setCity] = useState("Hyderabad");

  const filtered = DEALERS.filter((d) =>
    (brand === "All" || d.brand === brand) &&
    d.city === city &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.area.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Find Dealers</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Find Authorised Dealers Near You</h1>
          <p className="text-blue-200 text-sm mb-7">500+ verified dealerships across India</p>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by name or area…" value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl text-gray-900 text-sm outline-none border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </div>
            <select value={city} onChange={(e) => setCity(e.target.value)}
              className="h-11 px-4 rounded-xl text-gray-900 text-sm outline-none border border-gray-200 bg-white min-w-[160px] appearance-none focus:border-blue-400 transition-all">
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Brand tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
          {BRANDS.map((b) => (
            <button key={b} onClick={() => setBrand(b)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                brand === b ? "bg-blue-700 text-white border-blue-700" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-700"
              }`}>
              {b}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-4">{filtered.length} dealers found in <strong>{city}</strong></p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No dealers found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different city or brand</p>
            </div>
          ) : filtered.map((d) => (
            <div key={d.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-5 pt-5 pb-3 flex items-start justify-between">
                <div>
                  <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full mb-2">{d.brand}</span>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">{d.name}</h3>
                </div>
                <div className="flex-shrink-0 ml-2 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-bold text-gray-800">{d.rating}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">{d.reviews} reviews</p>
                </div>
              </div>
              <div className="px-5 py-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {d.area}, {d.city}
                  <span className="ml-auto flex items-center gap-1 text-blue-600 font-semibold">
                    <Navigation className="w-3 h-3" /> {d.distance}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {d.open}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {d.phone}
                </div>
              </div>
              <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                <a href={`tel:${d.phone}`}
                  className="flex items-center justify-center gap-1.5 h-9 text-xs font-semibold text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-700 rounded-xl transition-all">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
                <Link href="/test-drive"
                  className="flex items-center justify-center gap-1.5 h-9 text-xs font-semibold text-white bg-blue-700 hover:bg-blue-600 rounded-xl transition-all">
                  <Car className="w-3.5 h-3.5" /> Test Drive
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-blue-700 rounded-2xl p-7 text-center text-white">
          <p className="font-bold text-lg mb-1">Can&apos;t find your city?</p>
          <p className="text-blue-200 text-sm mb-4">Contact us and we&apos;ll connect you with the nearest authorised dealer.</p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 h-11 px-6 bg-white text-blue-700 font-bold text-sm rounded-xl hover:bg-blue-50 transition-all">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
