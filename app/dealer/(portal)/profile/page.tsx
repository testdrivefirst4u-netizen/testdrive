"use client";
import { useEffect, useState, useTransition } from "react";
import { Phone, MapPin, User, Clock, Save, CheckCircle2, Loader2 } from "lucide-react";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

type BusinessHours = Record<string, { open: string; close: string; isOpen: boolean }>;

interface DealerProfile {
  id: string; name: string; code: string; email: string; phone: string;
  city: string; state: string; address?: string;
  managerName?: string; managerPhone?: string;
  businessHours?: BusinessHours;
}

const DEFAULT_HOURS: BusinessHours = Object.fromEntries(
  DAYS.map(d => [d, { open: "09:00", close: "18:00", isOpen: d !== "sunday" }])
);

export default function DealerProfilePage() {
  const [profile, setProfile]   = useState<DealerProfile | null>(null);
  const [hours, setHours]       = useState<BusinessHours>(DEFAULT_HOURS);
  const [saved,  setSaved]      = useState(false);
  const [isPending, start]      = useTransition();

  useEffect(() => {
    fetch("/api/dealer/profile")
      .then(r => r.json())
      .then(d => {
        setProfile(d);
        if (d.businessHours && Object.keys(d.businessHours).length > 0) {
          setHours(d.businessHours);
        }
      });
  }, []);

  function change(field: keyof DealerProfile, value: string) {
    setProfile(p => p ? { ...p, [field]: value } : p);
  }

  function toggleDay(day: string) {
    setHours(h => ({ ...h, [day]: { ...h[day], isOpen: !h[day].isOpen } }));
  }
  function setTime(day: string, key: "open" | "close", val: string) {
    setHours(h => ({ ...h, [day]: { ...h[day], [key]: val } }));
  }

  async function save() {
    if (!profile) return;
    start(async () => {
      await fetch("/api/dealer/profile", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          phone:        profile.phone,
          managerName:  profile.managerName,
          managerPhone: profile.managerPhone,
          address:      profile.address,
          businessHours: hours,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  }

  if (!profile) {
    return (
      <div className="p-6 flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">{profile.name} · {profile.code}</p>
      </div>

      {/* Read-only info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-700 mb-2">Dealership Info</h2>
        {[
          { icon: User,   label: "Name",  value: profile.name },
          { icon: MapPin, label: "City",  value: `${profile.city}, ${profile.state}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
              <p className="text-sm font-semibold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Editable fields */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">Contact Details</h2>
        {[
          { label: "Phone",          field: "phone"        as keyof DealerProfile },
          { label: "Manager Name",   field: "managerName"  as keyof DealerProfile },
          { label: "Manager Phone",  field: "managerPhone" as keyof DealerProfile },
          { label: "Address",        field: "address"      as keyof DealerProfile },
        ].map(({ label, field }) => (
          <div key={field}>
            <label className="block text-xs font-bold text-gray-600 mb-1">{label}</label>
            <input
              value={(profile[field] as string) ?? ""}
              onChange={e => change(field, e.target.value)}
              className="w-full px-3 h-9 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 outline-none text-sm"
            />
          </div>
        ))}
      </div>

      {/* Business Hours */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5">
        <h2 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> Business Hours
        </h2>
        <div className="space-y-2">
          {DAYS.map(day => {
            const h = hours[day] ?? { open: "09:00", close: "18:00", isOpen: true };
            return (
              <div key={day} className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day)}
                  className={`w-10 h-5 rounded-full transition-colors flex-shrink-0 relative ${h.isOpen ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${h.isOpen ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-xs font-semibold text-gray-600 w-20 capitalize">{day}</span>
                {h.isOpen ? (
                  <>
                    <input type="time" value={h.open}  onChange={e => setTime(day, "open",  e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400" />
                    <span className="text-xs text-gray-400">to</span>
                    <input type="time" value={h.close} onChange={e => setTime(day, "close", e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-blue-400" />
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={save}
        disabled={isPending}
        className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2">
        {isPending
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
          : saved
            ? <><CheckCircle2 className="w-4 h-4 text-green-200" /> Saved!</>
            : <><Save className="w-4 h-4" /> Save Changes</>
        }
      </button>
    </div>
  );
}
