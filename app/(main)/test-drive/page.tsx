"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car, CheckCircle2, MapPin, Calendar, Phone, User,
  Star, Zap, Shield, Clock, ArrowRight, Loader2, Tag, Navigation, Edit3,
} from "lucide-react";

const POPULAR_MODELS = [
  { brand: "Tata",     model: "Nexon",    price: "₹8.1 – 15.5L", badge: "Best Seller" },
  { brand: "Hyundai",  model: "Creta",    price: "₹11 – 20.2L",  badge: "Popular"     },
  { brand: "Maruti",   model: "Fronx",    price: "₹7.5 – 13.3L", badge: "New"         },
  { brand: "Mahindra", model: "XUV 3XO",  price: "₹7.5 – 15.5L", badge: "Trending"    },
  { brand: "Kia",      model: "Seltos",   price: "₹11 – 20.5L",  badge: ""            },
  { brand: "Honda",    model: "Elevate",  price: "₹11 – 15.9L",  badge: ""            },
];

const CITIES = [
  "Hyderabad", "Mumbai", "Delhi", "Bengaluru", "Chennai",
  "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Surat",
];

interface Brand { id: string; name: string; slug: string }

function matchBrand(brandName: string, brands: Brand[]): string {
  if (!brandName || !brands.length) return "";
  const q = brandName.toLowerCase().trim();
  const exact = brands.find(b => b.name.toLowerCase() === q);
  if (exact) return exact.id;
  const partial = brands.find(b =>
    b.name.toLowerCase().includes(q) || q.includes(b.name.toLowerCase())
  );
  return partial?.id ?? "";
}

export default function TestDrivePage() {
  const [step,     setStep]    = useState<1 | 2 | 3 | 4>(1);
  const [selected, setSelected] = useState("");
  const [brandId,  setBrandId] = useState("");
  const [brands,   setBrands]  = useState<Brand[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", city: "", date: "", time: "" });
  const [loading,  setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [address, setAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  function detectLocation() {
    if (!navigator.geolocation) { setLocError(true); setManualEntry(true); return; }
    setLocating(true);
    setLocError(false);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          const detected = data.display_name ||
            data.address?.city || data.address?.town || data.address?.county ||
            data.address?.state_district || data.address?.village || "";
          if (detected) {
            setAddress(detected);
            const cityGuess = data.address?.city || data.address?.town || data.address?.village || "";
            if (cityGuess && CITIES.includes(cityGuess)) setForm((f) => ({ ...f, city: cityGuess }));
          }
        } catch {}
        setLocating(false);
      },
      () => { setLocating(false); setLocError(true); setManualEntry(true); },
      { timeout: 10000 }
    );
  }

  // Auto-trigger location detection the moment the location step opens — Swiggy/Zomato style
  useEffect(() => {
    if (step === 2 && !coords && !locError && !locating) {
      detectLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  useEffect(() => {
    fetch("/api/brands")
      .then(r => r.json())
      .then(d => setBrands(Array.isArray(d) ? d : (d.brands ?? [])))
      .catch(() => {});
  }, []);

  function selectModel(brand: string, model: string) {
    setSelected(`${brand} ${model}`);
    setBrandId(matchBrand(brand, brands));
  }

  function handleModelType(val: string) {
    setSelected(val);
    const firstWord = val.trim().split(/\s+/)[0] ?? "";
    setBrandId(firstWord ? matchBrand(firstWord, brands) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("/api/test-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, phone: form.phone,
          city: form.city, date: form.date, time: form.time,
          latitude: coords?.lat, longitude: coords?.lon, address: address || undefined,
          model: selected, brandId,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || "Something went wrong."); return; }
      setStep(4);
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const STEPS = [
    { n: 1, label: "Vehicle"  },
    { n: 2, label: "Location" },
    { n: 3, label: "Details"  },
    { n: 4, label: "Confirm"  },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 text-white py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 rounded-full px-3.5 py-1.5 text-xs font-semibold text-blue-200 mb-5">
            <Zap className="w-3 h-3 text-amber-400" />
            Free · No obligation · At your doorstep
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
            Book a <span className="text-blue-400">Test Drive</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience your dream car firsthand. Our experts bring the vehicle to your doorstep or arrange a dealership visit — your choice.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-7">
            {[
              { Icon: Shield, text: "Verified Dealers" },
              { Icon: Clock,  text: "24h Confirmation" },
              { Icon: Star,   text: "4.8★ Experience"  },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-xs text-slate-300">
                <Icon className="w-3.5 h-3.5 text-blue-400" /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="sticky top-14 sm:top-16 z-10 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                step > s.n ? "bg-green-500 text-white" : step === s.n ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {step > s.n ? <CheckCircle2 className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${step === s.n ? "text-blue-700" : "text-gray-400"}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 mx-1 hidden sm:block" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Step 1 — choose model */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Which car would you like to test drive?</h2>
            <p className="text-sm text-gray-500 mb-6">Select from popular models or type any model below</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {POPULAR_MODELS.map((m) => {
                const key = `${m.brand} ${m.model}`;
                return (
                  <button key={m.model} onClick={() => selectModel(m.brand, m.model)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      selected === key
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                    }`}>
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-blue-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 font-medium">{m.brand}</p>
                      <p className="font-bold text-gray-900 text-sm">{m.model}</p>
                      <p className="text-xs text-blue-600 font-semibold">{m.price}</p>
                    </div>
                    {m.badge && (
                      <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">{m.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Or type any model</label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="e.g. Tata Harrier, Honda City..."
                  value={selected} onChange={(e) => handleModelType(e.target.value)}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
              </div>
            </div>

            {/* Brand selector — auto-filled, user can override */}
            {brands.length > 0 && (
              <div className="mb-6">
                <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  Brand
                  {brandId && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full ml-1">Auto-detected</span>}
                </label>
                <select value={brandId} onChange={(e) => setBrandId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm bg-white appearance-none">
                  <option value="">Select brand (optional)</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button onClick={() => selected && setStep(2)} disabled={!selected}
              className="w-full h-12 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — location (Swiggy/Zomato style, prominent + auto-detected) */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Where should we bring the car?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Booking for: <strong className="text-blue-700">{selected}</strong>
              <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-blue-600 ml-2 underline">change</button>
            </p>

            <div className={`rounded-3xl border-2 p-6 text-center transition-all ${
              coords ? "border-green-200 bg-green-50" : "border-blue-100 bg-blue-50"
            }`}>
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                coords ? "bg-green-100" : "bg-blue-100"
              }`}>
                {locating ? (
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                ) : coords ? (
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                ) : (
                  <MapPin className="w-8 h-8 text-blue-600" />
                )}
              </div>

              {locating && <p className="font-bold text-gray-900">Detecting your location…</p>}

              {!locating && coords && (
                <>
                  <p className="font-bold text-gray-900">Location shared</p>
                  <p className="text-sm text-gray-600 mt-1.5 max-w-sm mx-auto line-clamp-2">{address || "Current location"}</p>
                  <button type="button" onClick={detectLocation}
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline">
                    <Navigation className="w-3.5 h-3.5" /> Re-detect location
                  </button>
                </>
              )}

              {!locating && !coords && (
                <>
                  <p className="font-bold text-gray-900">
                    {locError ? "Couldn't detect your location" : "Share your location"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                    This helps our driver find you precisely for the test drive — just like a delivery app.
                  </p>
                  <button type="button" onClick={detectLocation}
                    className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 h-11 px-6 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all">
                    <Navigation className="w-4 h-4" /> Use My Current Location
                  </button>
                </>
              )}

              <button type="button" onClick={() => setManualEntry((v) => !v)}
                className="mt-4 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mx-auto">
                <Edit3 className="w-3 h-3" /> {manualEntry ? "Hide manual entry" : "Enter city manually instead"}
              </button>
            </div>

            {manualEntry && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your City</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all appearance-none bg-white">
                    <option value="">Select city</option>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            )}

            <button onClick={() => setStep(3)} disabled={!coords && !form.city}
              className="w-full h-12 mt-6 bg-blue-700 hover:bg-blue-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3 — your details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Your Details</h2>
              <p className="text-sm text-gray-500 mb-6">
                Booking for: <strong className="text-blue-700">{selected}</strong>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-blue-600 ml-2 underline">change</button>
              </p>
            </div>

            <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm">
              <MapPin className="w-4 h-4 text-green-600 shrink-0" />
              <span className="text-gray-700 truncate flex-1">{address || form.city || "Location shared"}</span>
              <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-green-700 hover:underline shrink-0">Change</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="text" placeholder="Rahul Sharma" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="tel" pattern="[0-9]{10}" placeholder="9876543210" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={form.date} min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Preferred Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="time" value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              By submitting, you agree to our <Link href="/privacy" className="underline hover:text-blue-600">Privacy Policy</Link>. We will contact you within 2 hours.
            </p>

            {apiError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{apiError}</p>
            )}

            <button type="submit" disabled={loading}
              className="w-full h-12 bg-blue-700 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? "Confirming…" : "Confirm Booking"}
            </button>
          </form>
        )}

        {/* Step 4 — Success */}
        {step === 4 && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-50 border-2 border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Drive Booked!</h2>
            <p className="text-gray-500 text-sm mb-2">
              Your test drive for <strong className="text-blue-700">{selected}</strong> has been confirmed.
            </p>
            <p className="text-gray-500 text-sm mb-8">Our team will call you within 2 hours to finalise the schedule.</p>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-left max-w-sm mx-auto mb-8">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Booking Summary</p>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between"><span>Vehicle</span><span className="font-semibold">{selected}</span></div>
                {(address || form.city) && <div className="flex justify-between gap-3"><span>Location</span><span className="font-semibold text-right truncate">{address || form.city}</span></div>}
                {form.date && <div className="flex justify-between"><span>Date</span><span className="font-semibold">{new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>}
                {form.time && <div className="flex justify-between"><span>Time</span><span className="font-semibold">{form.time}</span></div>}
                {form.phone && <div className="flex justify-between"><span>Contact</span><span className="font-semibold">{form.phone}</span></div>}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/cars" className="flex items-center justify-center gap-2 h-11 px-6 bg-blue-700 hover:bg-blue-600 text-white font-bold text-sm rounded-xl transition-all">
                Browse More Cars
              </Link>
              <Link href="/" className="flex items-center justify-center gap-2 h-11 px-6 border border-gray-200 hover:border-blue-300 text-gray-700 font-semibold text-sm rounded-xl transition-all">
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
