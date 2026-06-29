"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, MapPin, Phone, User, CheckCircle, Loader2, Navigation,
  Lock, Zap, ThumbsUp, MessageCircle,
} from "lucide-react";

interface OfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  carName?: string;
  vehicleType?: string;
  brandId?: string;
}

type BuyTime = "Within 15 Days" | "16-30 Days" | "After 30 days" | "Not Decided" | "";
type SellCar = "Yes" | "No" | "";
type LocationState = "idle" | "detecting" | "done" | "denied" | "error";

// Top cities — Telangana first, then major metros
const ALL_CITIES = [
  "Hyderabad", "Secunderabad", "Warangal", "Karimnagar", "Nizamabad",
  "Khammam", "Nalgonda", "Mahbubnagar", "Adilabad", "Siddipet",
  "Bangalore", "Chennai", "Mumbai", "Delhi", "Pune", "Kolkata",
  "Ahmedabad", "Jaipur", "Lucknow", "Kochi", "Coimbatore",
  "Visakhapatnam", "Vijayawada", "Nagpur", "Indore", "Surat",
  "Bhubaneswar", "Chandigarh", "Guwahati", "Mysuru", "Madurai",
];
const QUICK_CITIES = ["Hyderabad", "Secunderabad", "Warangal", "Karimnagar", "Nizamabad"];

async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.county ||
    data.address?.state_district ||
    data.address?.village ||
    ""
  );
}

export default function OfferPopup({
  isOpen,
  onClose,
  carName = "this vehicle",
  vehicleType = "",
  brandId = "",
}: OfferPopupProps) {
  const [step,         setStep]         = useState<1 | 2>(1);
  const [name,         setName]         = useState("");
  const [mobile,       setMobile]       = useState("");
  const [city,         setCity]         = useState("");
  const [locState,     setLocState]     = useState<LocationState>("idle");
  const [cityInput,    setCityInput]    = useState("");
  const [citySuggestions, setSuggestions] = useState<string[]>([]);
  const [cityEditing,  setCityEditing]  = useState(false);
  const [whatsapp,     setWhatsapp]     = useState(true);
  const [buyTime,      setBuyTime]      = useState<BuyTime>("");
  const [sellCar,      setSellCar]      = useState<SellCar>("");
  const [visible,      setVisible]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState("");

  const overlayRef   = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  /* ── Helpers ── */
  function saveCity(c: string) {
    const trimmed = c.trim();
    if (!trimmed) return;
    setCity(trimmed);
    setLocState("done");
    setCityEditing(false);
    setSuggestions([]);
    setCityInput("");
    if (trimmed.length > 1) {
      localStorage.setItem("walley_city", trimmed);
      (window as any).__userCity = trimmed;
    }
  }

  async function detectLocation() {
    if (!navigator.geolocation) { setLocState("error"); return; }
    setLocState("detecting");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const detected = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          detected ? saveCity(detected) : setLocState("error");
        } catch { setLocState("error"); }
      },
      (err) => setLocState(err.code === 1 ? "denied" : "error"),
      { timeout: 10000 }
    );
  }

  function onCityInputChange(val: string) {
    setCityInput(val);
    if (val.length < 2) { setSuggestions([]); return; }
    const matches = ALL_CITIES.filter((c) =>
      c.toLowerCase().startsWith(val.toLowerCase())
    ).slice(0, 5);
    setSuggestions(matches);
  }

  /* ── Effects ── */
  useEffect(() => {
    if (!isOpen) return;
    const cached = localStorage.getItem("walley_city") || (window as any).__userCity;
    if (cached && typeof cached === "string" && cached.length > 1) {
      setCity(cached); setLocState("done");
    } else {
      detectLocation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false); setError(""); setStep(1);
      requestAnimationFrame(() => setVisible(true));
      setTimeout(() => nameInputRef.current?.focus(), 200);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (cityEditing) {
      setCityInput(city);
      setTimeout(() => cityInputRef.current?.focus(), 50);
    }
  }, [cityEditing, city]);

  if (!isOpen) return null;

  /* ── Step 1 validation → go to step 2 ── */
  function goStep2() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^\d{10}$/.test(mobile)) { setError("Enter a valid 10-digit mobile number."); return; }
    setError(""); setStep(2);
  }

  /* ── Submit ── */
  async function handleSubmit() {
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carName,
          name:        name.trim(),
          mobile,
          city:        city || null,
          buyTime,
          sellCar,
          vehicleType,
          brandId,
          source:      whatsapp ? "offer_popup_wa" : "offer_popup",
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setName(""); setMobile(""); setBuyTime(""); setSellCar(""); setStep(1);
      }, 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── City row ── */
  function CityRow() {
    if (locState === "detecting") {
      return (
        <div className="flex items-center gap-2 mt-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500 shrink-0" />
          <span className="text-sm text-gray-500">Detecting your city…</span>
        </div>
      );
    }
    if (locState === "done" && !cityEditing) {
      return (
        <div className="flex items-center justify-between mt-1.5">
          <span className="font-semibold text-gray-900">{city}</span>
          <button type="button" onClick={() => setCityEditing(true)}
            className="text-xs text-blue-600 font-medium hover:underline">
            Change
          </button>
        </div>
      );
    }
    /* editing or denied/error */
    return (
      <div className="mt-1.5 space-y-2">
        <div className="relative">
          <input
            ref={cityInputRef}
            type="text"
            value={cityInput}
            onChange={(e) => onCityInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && cityInput.trim()) saveCity(cityInput);
              if (e.key === "Escape") { setCityEditing(false); setSuggestions([]); }
            }}
            placeholder="Type your city…"
            className="w-full outline-none bg-transparent font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400 text-sm"
          />
          {/* Autocomplete dropdown */}
          {citySuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {citySuggestions.map((c) => (
                <button
                  key={c} type="button"
                  onClick={() => saveCity(c)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <MapPin className="w-3 h-3 inline mr-1.5 text-gray-400" />{c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick-pick chips */}
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CITIES.map((c) => (
            <button
              key={c} type="button"
              onClick={() => saveCity(c)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium hover:bg-blue-100 transition-colors"
            >
              {c}
            </button>
          ))}
        </div>

        {(locState === "denied" || locState === "error") && (
          <button type="button" onClick={detectLocation}
            className="flex items-center gap-1 text-[11px] text-blue-600 font-semibold hover:underline">
            <Navigation className="w-3 h-3" />
            {locState === "denied" ? "Re-enable & detect location" : "Try detecting again"}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 transition-all duration-300 ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0 pointer-events-none"}`}
    >
      <div className={`bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl relative shadow-2xl flex flex-col max-h-[95vh] transition-all duration-300 ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 sm:scale-95"}`}>

        {/* ── Gradient Header ── */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-700 rounded-t-3xl sm:rounded-t-2xl px-5 pt-5 pb-4 shrink-0">
          <button onClick={onClose}
            className="absolute right-4 top-4 bg-white/20 hover:bg-white/30 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
            <X size={15} className="text-white" />
          </button>

          <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Limited Offer
          </span>
          <h2 className="text-lg font-extrabold text-white mt-2 leading-tight pr-10">
            Get Best Price on<br />
            <span className="text-blue-200">{carName}</span>
          </h2>

          {/* Trust strip */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
            {[
              { icon: Lock,      label: "100% Private" },
              { icon: Zap,       label: "Instant Response" },
              { icon: ThumbsUp,  label: "No Spam Calls" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1 text-[10px] text-blue-100 font-medium">
                <Icon className="w-3 h-3 text-blue-300 shrink-0" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Body (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {success ? (
            /* ── Success ── */
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-1">Request Sent!</h3>
              <p className="text-gray-500 text-sm mb-4">
                Hi <span className="font-semibold text-gray-800">{name}</span>, our team will
                contact you{whatsapp ? " on WhatsApp" : ""} within{" "}
                <span className="font-semibold text-blue-700">30 minutes</span> with exclusive
                offers on <span className="font-semibold">{carName}</span>.
              </p>
              {whatsapp && (
                <a
                  href={`https://wa.me/918888888888?text=${encodeURIComponent(`Hi, I'm ${name}. I'm interested in ${carName} offers.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bc5a] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                </a>
              )}
            </div>

          ) : step === 1 ? (
            /* ── Step 1: Contact details ── */
            <div className="space-y-3">

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1.5">
                  <div className="w-6 h-1.5 rounded-full bg-blue-600" />
                  <div className="w-6 h-1.5 rounded-full bg-gray-200" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Step 1 of 2 — Your details</span>
              </div>

              {/* Name */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-blue-400 focus-within:bg-white transition-colors">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Full Name <span className="text-red-400">*</span>
                </p>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") goStep2(); }}
                  placeholder="Enter your full name"
                  className="w-full outline-none bg-transparent font-semibold text-gray-800 mt-1 placeholder:font-normal placeholder:text-gray-400 text-sm"
                />
              </div>

              {/* Mobile */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-blue-400 focus-within:bg-white transition-colors">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Mobile Number <span className="text-red-400">*</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold text-gray-700 text-sm">+91</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={mobile}
                    onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") goStep2(); }}
                    placeholder="10-digit number"
                    className="flex-1 outline-none bg-transparent font-semibold text-gray-800 placeholder:font-normal placeholder:text-gray-400 text-sm"
                  />
                  <span className={`text-[10px] font-bold shrink-0 ${mobile.length === 10 ? "text-green-600" : "text-gray-300"}`}>
                    {mobile.length}/10
                  </span>
                </div>
              </div>

              {/* City */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-3 focus-within:border-blue-400 focus-within:bg-white transition-colors relative">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  <MapPin className={`w-3 h-3 ${locState === "detecting" ? "text-blue-400 animate-pulse" : ""}`} />
                  Your City
                </p>
                <CityRow />
              </div>

              {/* WhatsApp preference */}
              <button
                type="button"
                onClick={() => setWhatsapp((p) => !p)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${whatsapp ? "bg-[#f0fdf4] border-[#86efac]" : "bg-gray-50 border-gray-200"}`}
              >
                <div className={`w-9 h-5 rounded-full flex items-center transition-all relative ${whatsapp ? "bg-[#25D366]" : "bg-gray-300"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full shadow absolute transition-all ${whatsapp ? "left-[18px]" : "left-[2px]"}`} />
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <MessageCircle className={`w-4 h-4 ${whatsapp ? "text-[#25D366]" : "text-gray-400"}`} />
                  <span className={`font-semibold ${whatsapp ? "text-gray-800" : "text-gray-500"}`}>
                    Get updates on WhatsApp
                  </span>
                </div>
              </button>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={goStep2}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3.5 rounded-xl font-bold text-sm transition-colors"
              >
                Next →
              </button>
            </div>

          ) : (
            /* ── Step 2: Preferences ── */
            <div className="space-y-4">

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1.5">
                  <div className="w-6 h-1.5 rounded-full bg-blue-600" />
                  <div className="w-6 h-1.5 rounded-full bg-blue-600" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">Step 2 of 2 — Preferences</span>
              </div>

              {/* Summary chip */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-blue-500 font-semibold uppercase tracking-wide">Submitting as</p>
                  <p className="text-sm font-bold text-blue-800">{name} · +91 {mobile}</p>
                </div>
                <button type="button" onClick={() => { setStep(1); setError(""); }}
                  className="text-[10px] text-blue-600 font-semibold underline">
                  Edit
                </button>
              </div>

              {/* Buy Time */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">When are you planning to buy?</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["Within 15 Days", "16-30 Days", "After 30 days", "Not Decided"] as BuyTime[]).map((t) => (
                    <button key={t} type="button" onClick={() => setBuyTime(buyTime === t ? "" : t)}
                      className={`text-xs px-3 py-2.5 rounded-xl border font-semibold transition-all text-left ${
                        buyTime === t
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sell Car */}
              <div>
                <p className="text-xs font-bold text-gray-600 mb-2">Do you have a car to sell / exchange?</p>
                <div className="flex gap-2">
                  {(["Yes", "No"] as SellCar[]).map((v) => (
                    <button key={v} type="button" onClick={() => setSellCar(sellCar === v ? "" : v)}
                      className={`flex-1 text-sm py-2.5 rounded-xl border font-bold transition-all ${
                        sellCar === v
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}>
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : `Get Best Offers on ${carName.length > 20 ? "this vehicle" : carName}`
                }
              </button>

              <p className="text-center text-[10px] text-gray-400">
                By submitting you agree to be contacted by our team. No spam.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
