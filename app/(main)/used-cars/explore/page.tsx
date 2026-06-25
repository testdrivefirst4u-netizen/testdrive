"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Car, ChevronRight, Fuel, Gauge, MapPin, Heart, ArrowRight } from "lucide-react";

const BRANDS = ["All Brands", "Tata", "Hyundai", "Maruti", "Mahindra", "Honda", "Kia", "Toyota", "Ford", "Volkswagen"];
const CITIES = ["All Cities", "Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Chennai", "Pune"];
const FUELS = ["All Fuel Types", "Petrol", "Diesel", "Electric", "CNG"];
const PRICE_RANGES = ["Any Budget", "Under ₹3L", "₹3L – ₹6L", "₹6L – ₹10L", "₹10L – ₹15L", "Above ₹15L"];

const CARS = [
  { name: "Tata Nexon", year: 2022, km: "28,000", fuel: "Petrol", price: "₹11.5L", city: "Hyderabad", area: "Kukatpally", transmission: "Manual", certified: true, color: "Flame Red" },
  { name: "Hyundai Creta", year: 2021, km: "42,000", fuel: "Diesel", price: "₹13.2L", city: "Hyderabad", area: "Madhapur", transmission: "Automatic", certified: true, color: "Phantom Black" },
  { name: "Maruti Suzuki Swift", year: 2023, km: "12,500", fuel: "Petrol", price: "₹7.8L", city: "Hyderabad", area: "Ameerpet", transmission: "Manual", certified: false, color: "Speedy Blue" },
  { name: "Mahindra XUV300", year: 2020, km: "55,000", fuel: "Diesel", price: "₹10.2L", city: "Hyderabad", area: "Begumpet", transmission: "Manual", certified: true, color: "Midnight Black" },
  { name: "Honda City", year: 2022, km: "19,000", fuel: "Petrol", price: "₹12.0L", city: "Hyderabad", area: "Kondapur", transmission: "Automatic", certified: true, color: "Golden Brown" },
  { name: "Kia Seltos", year: 2021, km: "38,000", fuel: "Petrol", price: "₹14.5L", city: "Hyderabad", area: "Hi-Tech City", transmission: "Automatic", certified: true, color: "Glacier White Pearl" },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("All Brands");
  const [city, setCity] = useState("All Cities");
  const [fuel, setFuel] = useState("All Fuel Types");
  const [price, setPrice] = useState("Any Budget");
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filtered = CARS.filter((c) =>
    (brand === "All Brands" || c.name.includes(brand)) &&
    (city === "All Cities" || c.city === city) &&
    (fuel === "All Fuel Types" || c.fuel === fuel) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-emerald-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-emerald-300 mb-5">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/used-cars" className="hover:text-white">Used Cars</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Explore</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Explore Certified Used Cars</h1>
          <p className="text-emerald-200 text-sm mb-6">1,200+ verified pre-owned cars across India</p>

          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by make, model…" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 rounded-2xl text-gray-900 text-sm outline-none border-0 shadow-sm focus:ring-2 focus:ring-emerald-400 transition-all" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-emerald-400 transition-all">
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          {[
            { label: "Brand", val: brand, set: setBrand, opts: BRANDS },
            { label: "City", val: city, set: setCity, opts: CITIES },
            { label: "Fuel", val: fuel, set: setFuel, opts: FUELS },
            { label: "Budget", val: price, set: setPrice, opts: PRICE_RANGES },
          ].map(({ val, set, opts }) => (
            <select key={val} value={val} onChange={(e) => set(e.target.value)}
              className="h-9 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 outline-none appearance-none cursor-pointer hover:border-emerald-400 transition-all">
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          ))}
          <span className="ml-auto text-sm text-gray-500">{filtered.length} cars found</span>
        </div>

        {/* Car grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-3 text-center py-20">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-500">No cars match your filters</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          ) : filtered.map((c) => (
            <div key={c.name + c.year} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-44 bg-gradient-to-br from-emerald-50 to-slate-100 flex items-center justify-center">
                <Car className="w-14 h-14 text-slate-300" />
                {c.certified && (
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                    abSure Certified
                  </span>
                )}
                <button
                  onClick={() => setWishlist((w) => w.includes(c.name) ? w.filter((x) => x !== c.name) : [...w, c.name])}
                  className="absolute top-3 right-3 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform">
                  <Heart className={`w-4 h-4 ${wishlist.includes(c.name) ? "text-red-500 fill-red-500" : "text-gray-300"}`} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/30 to-transparent px-3 pb-2 pt-6">
                  <span className="text-white text-xs font-semibold">{c.color}</span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900 text-sm group-hover:text-emerald-700 transition-colors">{c.name}</h3>
                  <p className="text-base font-extrabold text-emerald-700 ml-2">{c.price}</p>
                </div>
                <p className="text-xs text-gray-400 mb-3">{c.year} · {c.km} km · {c.transmission}</p>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Fuel className="w-3 h-3 text-gray-400" /> {c.fuel}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Gauge className="w-3 h-3 text-gray-400" /> {c.km} km
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                    <MapPin className="w-3 h-3 text-gray-400" /> {c.area}
                  </div>
                </div>

                <Link href="/test-drive"
                  className="flex items-center justify-center gap-2 w-full h-10 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all">
                  Book Test Drive <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button className="h-11 px-8 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 font-bold text-sm rounded-xl transition-all">
            Load More Cars
          </button>
        </div>
      </div>
    </div>
  );
}
