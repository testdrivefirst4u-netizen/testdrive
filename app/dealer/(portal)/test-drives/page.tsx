"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2, Car, Phone, Clock, MapPin, Mail, Camera,
  RefreshCw, Navigation, CheckCircle2, XCircle, AlertTriangle, Radio, Gauge,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  name: string;
  mobile: string;
  email: string | null;
  city: string | null;
  buyTime: string | null;
  preferredTime: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface Driver {
  id: string;
  name: string;
}

interface Visit {
  id: string;
  vehicleName: string | null;
  status: "SCHEDULED" | "EN_ROUTE" | "ARRIVED" | "COMPLETED" | "CANCELLED";
  scheduledAt: string | null;
  enRouteAt: string | null;
  arrivedAt: string | null;
  completedAt: string | null;
  proofPhotos: string[];
  visitLatitude: number | null;
  visitLongitude: number | null;
  distanceFromCustomerM: number | null;
  notes: string | null;
  createdAt: string;
  lead: Lead;
  assignedDriver: Driver | null;
  customerFeedback?: string | null;
  customerRating?: number | null;
  driverLastLat?: number | null;
  driverLastLon?: number | null;
  driverLastLocationAt?: string | null;
  tripDistanceKm?: number | null;
}

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

const STATUS_STYLES: Record<Visit["status"], string> = {
  SCHEDULED: "bg-slate-100 text-slate-600 border-slate-200",
  EN_ROUTE: "bg-amber-50 text-amber-700 border-amber-200",
  ARRIVED: "bg-blue-50 text-blue-700 border-blue-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-600 border-red-200",
};

const NEXT_STATUS: Partial<Record<Visit["status"], { label: string; next: Visit["status"] }>> = {
  SCHEDULED: { label: "Mark En Route", next: "EN_ROUTE" },
  EN_ROUTE: { label: "Mark Arrived", next: "ARRIVED" },
  ARRIVED: { label: "Mark Completed", next: "COMPLETED" },
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { timeout: 10000 }
    );
  });
}

export default function DealerTestDrivesPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Visit["status"] | "ALL">("ALL");
  const [updating, setUpdating] = useState<string | null>(null);
  const [notifying, setNotifying] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dealer/test-drives");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVisits(Array.isArray(data.visits) ? data.visits : []);
    } catch {
      toast.error("Failed to load test drives");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    fetch("/api/dealer/drivers")
      .then((r) => r.json())
      .then((d) => setDrivers(Array.isArray(d.drivers) ? d.drivers : []))
      .catch(() => {});
  }, [load]);

  // Silently refresh in the background so "live" driver locations stay current
  useEffect(() => {
    const hasLiveTrip = visits.some((v) => v.status === "EN_ROUTE" || v.status === "ARRIVED");
    if (!hasLiveTrip) return;
    const interval = setInterval(() => {
      fetch("/api/dealer/test-drives")
        .then((r) => r.json())
        .then((d) => { if (Array.isArray(d.visits)) setVisits(d.visits); })
        .catch(() => {});
    }, 20_000);
    return () => clearInterval(interval);
  }, [visits]);

  async function assignDriver(visit: Visit, driverId: string) {
    setAssigning(visit.id);
    try {
      const res = await fetch(`/api/dealer/test-drives/${visit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: driverId || null }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const assignedDriver = driverId ? drivers.find((d) => d.id === driverId) ?? null : null;
      setVisits((prev) => prev.map((v) => (v.id === visit.id ? { ...v, ...data.visit, assignedDriver } : v)));
      toast.success(driverId ? "Driver assigned" : "Driver unassigned");
    } catch {
      toast.error("Failed to assign driver");
    } finally {
      setAssigning(null);
    }
  }

  async function updateStatus(visit: Visit, status: Visit["status"]) {
    setUpdating(visit.id);
    try {
      const res = await fetch(`/api/dealer/test-drives/${visit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVisits((prev) => prev.map((v) => (v.id === visit.id ? { ...v, ...data.visit } : v)));
      toast.success(`Marked as ${status.replace("_", " ").toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  }

  async function resendNotification(visit: Visit) {
    setNotifying(visit.id);
    try {
      const res = await fetch(`/api/dealer/test-drives/${visit.id}/notify`, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success("Notification email sent");
    } catch {
      toast.error("Failed to send email");
    } finally {
      setNotifying(null);
    }
  }

  async function handlePhotoSelect(visit: Visit, file: File | undefined) {
    if (!file) return;
    setUploading(visit.id);
    try {
      const [base64, pos] = await Promise.all([fileToBase64(file), getCurrentPosition()]);
      const res = await fetch(`/api/dealer/test-drives/${visit.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          latitude: pos?.coords.latitude,
          longitude: pos?.coords.longitude,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setVisits((prev) => prev.map((v) => (v.id === visit.id ? { ...v, ...data.visit } : v)));
      toast.success(pos ? "Proof photo uploaded with location" : "Photo uploaded (location unavailable)");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(null);
    }
  }

  function formatDateTime(v: Visit) {
    const datePart = v.lead.buyTime;
    const timePart = v.lead.preferredTime;
    if (!datePart && !timePart) return "Not specified";
    return [datePart, timePart].filter(Boolean).join(" at ");
  }

  const filtered = filter === "ALL" ? visits : visits.filter((v) => v.status === filter);
  const counts = visits.reduce<Record<string, number>>((acc, v) => {
    acc[v.status] = (acc[v.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Drives</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bookings for your brand — track visits and upload arrival proof photos
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-300 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(["ALL", "SCHEDULED", "EN_ROUTE", "ARRIVED", "COMPLETED", "CANCELLED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
              filter === s
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
            }`}
          >
            {s === "ALL" ? "All" : s.replace("_", " ")}
            {s !== "ALL" && counts[s] ? ` (${counts[s]})` : ""}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading test drives…
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Car className="w-8 h-8 text-indigo-200" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900">No test drives</h3>
            <p className="text-sm text-gray-500 mt-1">Bookings will show up here as customers schedule them.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((visit) => {
            const mapsUrl =
              visit.lead.latitude != null && visit.lead.longitude != null
                ? `https://maps.google.com/?q=${visit.lead.latitude},${visit.lead.longitude}`
                : null;
            const flagDistance = visit.distanceFromCustomerM != null && visit.distanceFromCustomerM > 2000;
            const nextAction = NEXT_STATUS[visit.status];

            return (
              <div key={visit.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-extrabold text-gray-900">{visit.vehicleName ?? "Vehicle"}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[visit.status]}`}>
                        {visit.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-semibold mt-1">{visit.lead.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <a href={`tel:+91${visit.lead.mobile}`} className="hover:text-indigo-600">+91 {visit.lead.mobile}</a>
                  </div>
                  {visit.lead.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{visit.lead.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {formatDateTime(visit)}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{visit.lead.address ?? visit.lead.city ?? "Not shared"}</span>
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold shrink-0 flex items-center gap-1 hover:underline">
                        <Navigation className="w-3 h-3" /> Navigate
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-500 shrink-0">Driver</label>
                  <select
                    value={visit.assignedDriver?.id ?? ""}
                    onChange={(e) => assignDriver(visit, e.target.value)}
                    disabled={assigning === visit.id || drivers.length === 0}
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white disabled:opacity-50"
                  >
                    <option value="">{drivers.length === 0 ? "No drivers added" : "Unassigned"}</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {assigning === visit.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />}
                </div>

                {(visit.status === "EN_ROUTE" || visit.status === "ARRIVED") && visit.driverLastLocationAt && (
                  <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse shrink-0" />
                    <span className="text-red-700 font-semibold">Driver live</span>
                    <span className="text-gray-500">— last seen {timeAgo(visit.driverLastLocationAt)}</span>
                    {visit.driverLastLat != null && visit.driverLastLon != null && (
                      <a href={`https://maps.google.com/?q=${visit.driverLastLat},${visit.driverLastLon}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold ml-auto shrink-0 hover:underline">
                        View on map
                      </a>
                    )}
                  </div>
                )}

                {visit.status === "COMPLETED" && visit.tripDistanceKm != null && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Gauge className="w-3.5 h-3.5 text-gray-400" />
                    Trip distance: <span className="font-semibold text-gray-700">{visit.tripDistanceKm} km</span>
                  </div>
                )}

                {visit.customerFeedback && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5 text-xs text-gray-700">
                    {visit.customerRating != null && (
                      <p className="font-bold text-amber-500 mb-1">{"★".repeat(visit.customerRating)}{"☆".repeat(5 - visit.customerRating)}</p>
                    )}
                    "{visit.customerFeedback}"
                  </div>
                )}

                {flagDistance && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Proof photo location is {(visit.distanceFromCustomerM! / 1000).toFixed(1)} km from the customer's shared location — please verify.
                  </div>
                )}

                {visit.proofPhotos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {visit.proofPhotos.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="Proof" className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-50">
                  {nextAction && visit.status !== "CANCELLED" && (
                    <button
                      onClick={() => updateStatus(visit, nextAction.next)}
                      disabled={updating === visit.id}
                      className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl disabled:opacity-50"
                    >
                      {updating === visit.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {nextAction.label}
                    </button>
                  )}

                  <button
                    onClick={() => fileInputRefs.current[visit.id]?.click()}
                    disabled={uploading === visit.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 px-3 py-2 rounded-xl disabled:opacity-50"
                  >
                    {uploading === visit.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                    Upload Proof Photo
                  </button>
                  <input
                    ref={(el) => { fileInputRefs.current[visit.id] = el; }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handlePhotoSelect(visit, e.target.files?.[0])}
                  />

                  <button
                    onClick={() => resendNotification(visit)}
                    disabled={notifying === visit.id}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-2 rounded-xl disabled:opacity-50"
                  >
                    {notifying === visit.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    Resend Email
                  </button>

                  {visit.status !== "CANCELLED" && visit.status !== "COMPLETED" && (
                    <button
                      onClick={() => updateStatus(visit, "CANCELLED")}
                      disabled={updating === visit.id}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-2 rounded-xl disabled:opacity-50 ml-auto"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
