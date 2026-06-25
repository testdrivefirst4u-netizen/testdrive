"use client";

import { useState, useEffect, useRef } from "react";
import { X, MapPin, Phone, User } from "lucide-react";

interface OfferPopupProps {
  isOpen: boolean;
  onClose: () => void;
  carName?: string;
}

type BuyTime =
  | "Within 15 Days"
  | "16-30 Days"
  | "After 30 days"
  | "Not Decided"
  | "";

type SellCar = "Yes" | "No" | "";

export default function OfferPopup({
  isOpen,
  onClose,
  carName = "this car",
}: OfferPopupProps) {
  const [buyTime, setBuyTime] = useState<BuyTime>("");
  const [sellCar, setSellCar] = useState<SellCar>("");
  const [mobile, setMobile] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("Detecting location...");
  const [visible, setVisible] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  /* Location detect */
  useEffect(() => {
    if (!isOpen) return;

    const saved = localStorage.getItem("city");

    if (saved) {
      setCity(saved);
      return;
    }

    if ((window as any).__userCity) {
      setCity((window as any).__userCity);
      return;
    }

    if (!navigator.geolocation) {
      setCity("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();

          const detected =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "Unknown Location";

          setCity(detected);
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
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  /* Submit */
  async function handleSubmit() {
    const data = {
      carName,
      name,
      mobile,
      city,
      buyTime,
      sellCar,
    };

    console.log("Submit Data", data);

    await fetch("/api/form", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    onClose();
  }

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4
      ${visible ? "bg-black/60 backdrop-blur-sm" : "bg-black/0"}
      transition-all`}
    >
      <div
        className={`bg-white w-full max-w-lg rounded-2xl p-6 relative
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        transition-all shadow-2xl`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="mb-5">
          <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
            Limited Offer
          </span>

          <h2 className="text-xl font-bold mt-2">
            Get Best Offers on {carName}
          </h2>

          <p className="text-gray-500 text-sm">
            Your details are safe with us
          </p>
        </div>

        {/* Car Model */}
        <div className="bg-gray-50 border rounded-xl p-3 mb-3">
          <p className="text-sm text-gray-500">Car Model</p>
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
              onClick={() =>
                navigator.geolocation.getCurrentPosition(() => {})
              }
              className="text-blue-600 text-sm"
            >
              Allow
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="mb-3">
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Phone size={14} className="text-blue-600" />
              Mobile Number
            </div>

            <div className="flex gap-2 mt-1">
              <span className="font-semibold">+91</span>

              <input
                type="tel"
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="w-full outline-none bg-transparent font-semibold"
                placeholder="Enter mobile"
              />
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="mb-4">
          <div className="bg-gray-50 border rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <User size={14} className="text-blue-600" />
              Full Name
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full outline-none bg-transparent font-semibold mt-1"
              placeholder="Enter Name"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold transition-colors"
        >
          Get Offers
        </button>
      </div>
    </div>
  );
}