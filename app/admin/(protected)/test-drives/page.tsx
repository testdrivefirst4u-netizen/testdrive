"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, MapPin, Navigation, AlertTriangle, RefreshCw, Camera, Star } from "lucide-react";

interface Visit {
  id: string;
  vehicleName: string | null;
  status: string;
  scheduledAt: string | null;
  proofPhotos: string[];
  distanceFromCustomerM: number | null;
  createdAt: string;
  tripStartAt: string | null;
  tripStartLat: number | null;
  tripStartLon: number | null;
  pickupAt: string | null;
  pickupLat: number | null;
  pickupLon: number | null;
  tripEndAt: string | null;
  tripEndLat: number | null;
  tripEndLon: number | null;
  customerFeedback: string | null;
  customerRating: number | null;
  driverLastLat: number | null;
  driverLastLon: number | null;
  driverLastLocationAt: string | null;
  tripDistanceKm: number | null;
  lead: {
    name: string; mobile: string; city: string | null; buyTime: string | null;
    preferredTime: string | null; address: string | null;
    latitude: number | null; longitude: number | null;
  };
  dealer: { name: string; code: string; brand: { name: string } };
  assignedDriver: { id: string; name: string } | null;
}

function fmtTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function pinLink(lat: number | null, lon: number | null) {
  return lat != null && lon != null ? `https://maps.google.com/?q=${lat},${lon}` : null;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: "bg-slate-100 text-slate-600",
  EN_ROUTE: "bg-amber-50 text-amber-700",
  ARRIVED: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default function AdminTestDrivesPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/test-drives${status ? `?status=${status}` : ""}`);
      const data = await res.json();
      setVisits(Array.isArray(data.visits) ? data.visits : []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Drives</h1>
          <p className="text-sm text-gray-500 mt-0.5">All test-drive bookings across dealers, with visit proof</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white"
          >
            <option value="">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="ARRIVED">Arrived</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
        </div>
      ) : visits.length === 0 ? (
        <div className="text-center py-24 text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
          No test drives found.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Dealer</th>
                <th className="px-4 py-3">Scheduled</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Driver &amp; Journey</th>
                <th className="px-4 py-3">Feedback</th>
                <th className="px-4 py-3">Proof</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => {
                const mapsUrl = v.lead.latitude != null && v.lead.longitude != null
                  ? `https://maps.google.com/?q=${v.lead.latitude},${v.lead.longitude}` : null;
                const flagged = v.distanceFromCustomerM != null && v.distanceFromCustomerM > 2000;
                return (
                  <tr key={v.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{v.lead.name}</p>
                      <p className="text-xs text-gray-400">+91 {v.lead.mobile}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{v.vehicleName ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700">{v.dealer.name}</p>
                      <p className="text-xs text-gray-400">{v.dealer.brand.name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {[v.lead.buyTime, v.lead.preferredTime].filter(Boolean).join(" at ") || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{v.lead.address ?? v.lead.city ?? "—"}</span>
                        {mapsUrl && (
                          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 shrink-0">
                            <Navigation className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      {flagged && (
                        <p className="flex items-center gap-1 text-[10px] text-amber-700 mt-1">
                          <AlertTriangle className="w-3 h-3" />
                          {(v.distanceFromCustomerM! / 1000).toFixed(1)} km away
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[v.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {v.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      <p className="text-gray-700 font-semibold">{v.assignedDriver?.name ?? <span className="text-gray-300 font-normal">Unassigned</span>}</p>
                      {(v.status === "EN_ROUTE" || v.status === "ARRIVED") && v.driverLastLocationAt && (
                        <p className="flex items-center gap-1 text-[10px] text-red-600 font-semibold mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                          Live — {timeAgo(v.driverLastLocationAt)}
                          {pinLink(v.driverLastLat, v.driverLastLon) && (
                            <a href={pinLink(v.driverLastLat, v.driverLastLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-500 ml-0.5">(map)</a>
                          )}
                        </p>
                      )}
                      {v.status === "COMPLETED" && v.tripDistanceKm != null && (
                        <p className="text-[10px] text-gray-500 mt-0.5">{v.tripDistanceKm} km driven</p>
                      )}
                      <div className="text-[10px] text-gray-400 mt-1 space-y-0.5">
                        {v.tripStartAt && (
                          <p>Start: {fmtTime(v.tripStartAt)}{pinLink(v.tripStartLat, v.tripStartLon) && (
                            <a href={pinLink(v.tripStartLat, v.tripStartLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-500 ml-1">(map)</a>
                          )}</p>
                        )}
                        {v.pickupAt && (
                          <p>Pickup: {fmtTime(v.pickupAt)}{pinLink(v.pickupLat, v.pickupLon) && (
                            <a href={pinLink(v.pickupLat, v.pickupLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-500 ml-1">(map)</a>
                          )}</p>
                        )}
                        {v.tripEndAt && (
                          <p>End: {fmtTime(v.tripEndAt)}{pinLink(v.tripEndLat, v.tripEndLon) && (
                            <a href={pinLink(v.tripEndLat, v.tripEndLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-500 ml-1">(map)</a>
                          )}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                      {v.customerFeedback ? (
                        <>
                          {v.customerRating != null && (
                            <div className="flex items-center gap-0.5 mb-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < v.customerRating! ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                              ))}
                            </div>
                          )}
                          <p className="text-xs text-gray-600 line-clamp-2">"{v.customerFeedback}"</p>
                        </>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {v.proofPhotos.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <Camera className="w-3.5 h-3.5 text-emerald-500" />
                          <div className="flex -space-x-2">
                            {v.proofPhotos.slice(0, 3).map((url, i) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={i} src={url} alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">None</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
