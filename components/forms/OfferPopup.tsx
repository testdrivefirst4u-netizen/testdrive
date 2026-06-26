"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Phone, User, CheckCircle, Loader2 } from "lucide-react";

interface OfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  carName?: string;
  vehicleType?: string;
  brandId?: string;
}

type BuyTime = "Within 15 Days" | "16-30 Days" | "After 30 days" | "Not Decided" | "";
type SellCar = "Yes" | "No" | "";

export default function OfferPopup({
  isOpen,
  onClose,
  carName = "this vehicle",
  vehicleType = "",
  brandId = "",
}: OfferPopupProps) {
  const [buyTime,  setBuyTime]  = useState<BuyTime>("");
  const [sellCar,  setSellCar]  = useState<SellCar>("");
  const [mobile,   setMobile]   = useState("");
  const [name,     setName]     = useState("");
  const [city,     setCity]     = useState("Detecting location...");
  const [visible,  setVisible]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const overlayRef = useRef<HTMLDivElement>(null);

  /* Location detect */
  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem("city");
    if (saved) { setCity(saved); return; }

    if ((window as any).__userCity) { setCity((window as any).__userCity); return; }

    if (!navigator.geolocation) { setCity("Location unavailable"); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const detected = data.address?.city || data.address?.town || data.address?.village || "Unknown";
          setCity(detected);
          localStorage.setItem("city", detected);
        } catch {
          setCity("Location unavailable");
        }
      },
      () => setCity("Location unavailable")
    );
  }, [isOpen]);

  /* Animation */
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError("");
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* Submit */
  async function handleSubmit() {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^\d{10}$/.test(mobile)) { setError("Please enter a valid 10-digit mobile number."); return; }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carName, name: name.trim(), mobile, city, buyTime, sellCar, vehicleType, brandId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }
      setSuccess(true);
      setTimeout(() => { onClose(); setSuccess(false); setName(""); setMobile(""); setBuyTime(""); setSellCar(""); }, 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"}`}
    >
      <div className={`bg-white w-full max-w-lg rounded-2xl p-6 relative transition-all shadow-2xl ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>

        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center">
          <X size={16} />
        </button>

        {/* Success Screen */}
        {success ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">You&apos;re All Set!</h2>
            <p className="text-gray-500 text-sm">
              Thank you, <span className="font-semibold text-gray-800">{name}</span>!<br />
              Our team will contact you shortly with the best offers on{" "}
              <span className="font-semibold text-blue-700">{carName}</span>.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5">
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">Limited Offer</span>
              <h2 className="text-xl font-bold mt-2">Get Best Offers on {carName}</h2>
              <p className="text-gray-500 text-sm">Your details are safe with us</p>
            </div>

            {/* Car Model */}
            <div className="bg-gray-50 border rounded-xl p-3 mb-3">
              <p className="text-sm text-gray-500">Vehicle Model</p>
              <p className="font-semibold">{carName}</p>
            </div>

            {/* Location */}
            <div className="bg-gray-50 border rounded-xl p-3 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin size={14} className="text-blue-600" />
                Your City
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-semibold">{city}</span>
                <button
                  onClick={() => navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`);
                      const data = await res.json();
                      const c = data.address?.city || data.address?.town || data.address?.village || "Unknown";
                      setCity(c); localStorage.setItem("city", c);
                    },
                    () => {}
                  )}
                  className="text-blue-600 text-sm font-medium">
                  Allow
                </button>
              </div>
            </div>

            {/* Mobile */}
            <div className="mb-3">
              <div className="bg-gray-50 border rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone size={14} className="text-blue-600" />
                  Mobile Number <span className="text-red-500">*</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className="font-semibold">+91</span>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                    className="w-full outline-none bg-transparent font-semibold"
                    placeholder="Enter mobile"
                  />
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-3">
              <div className="bg-gray-50 border rounded-xl p-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User size={14} className="text-blue-600" />
                  Full Name <span className="text-red-500">*</span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                  className="w-full outline-none bg-transparent font-semibold mt-1"
                  placeholder="Enter Name"
                />
              </div>
            </div>

            {/* Buy Time */}
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-500 mb-2">Planning to buy?</p>
              <div className="flex flex-wrap gap-2">
                {(["Within 15 Days", "16-30 Days", "After 30 days", "Not Decided"] as BuyTime[]).map(t => (
                  <button key={t} onClick={() => setBuyTime(buyTime === t ? "" : t)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${buyTime === t ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Sell Car */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">Do you have a car to sell/exchange?</p>
              <div className="flex gap-2">
                {(["Yes", "No"] as SellCar[]).map(v => (
                  <button key={v} onClick={() => setSellCar(sellCar === v ? "" : v)}
                    className={`text-xs px-4 py-1.5 rounded-full border font-medium transition-all ${sellCar === v ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting..." : "Get Offers"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
