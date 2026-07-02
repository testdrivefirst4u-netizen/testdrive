"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Loader2, Phone, Clock, MapPin, Navigation, Star,
  RefreshCw, Car, Gauge, PlayCircle, Flag, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

interface Lead {
  name: string;
  mobile: string;
  city: string | null;
  buyTime: string | null;
  preferredTime: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface CompletedTrip {
  id: string;
  vehicleName: string | null;
  tripStartAt: string | null;
  tripStartLat: number | null;
  tripStartLon: number | null;
  pickupAt: string | null;
  pickupLat: number | null;
  pickupLon: number | null;
  tripEndAt: string | null;
  tripEndLat: number | null;
  tripEndLon: number | null;
  tripDistanceKm: number | null;
  customerFeedback: string | null;
  customerRating: number | null;
  proofPhotos: string[];
  lead: Lead;
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function pinLink(lat: number | null, lon: number | null) {
  return lat != null && lon != null ? `https://maps.google.com/?q=${lat},${lon}` : null;
}

export default function DriverTripHistoryPage() {
  const [trips, setTrips] = useState<CompletedTrip[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/driver/trips/history");
      const data = await res.json();
      setTrips(Array.isArray(data.trips) ? data.trips : []);
    } catch {
      toast.error("Failed to load trip history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalKm = trips.reduce((s, t) => s + (t.tripDistanceKm ?? 0), 0);

  return (
    <div className="px-4 py-5 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Trip History</h1>
          <p className="text-xs text-gray-500 mt-0.5">{trips.length} completed · {Math.round(totalKm * 10) / 10} km total</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 rounded-xl border border-gray-200 text-gray-500">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center">
            <Car className="w-7 h-7 text-emerald-300" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900 text-sm">No completed trips yet</h3>
            <p className="text-xs text-gray-500 mt-1">Finished test drives will show up here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-gray-900">{trip.vehicleName ?? "Vehicle"}</p>
                {trip.tripDistanceKm != null && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Gauge className="w-3 h-3" /> {trip.tripDistanceKm} km
                  </span>
                )}
              </div>

              <p className="text-sm font-semibold text-gray-800">{trip.lead.name}</p>
              <a href={`tel:+91${trip.lead.mobile}`} className="flex items-center gap-2 text-xs text-gray-500">
                <Phone className="w-3 h-3 text-gray-400 shrink-0" /> +91 {trip.lead.mobile}
              </a>

              {/* End-to-end journey timeline */}
              <div className="space-y-2 pt-1">
                {trip.tripStartAt && (
                  <div className="flex items-start gap-2 text-xs">
                    <PlayCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-600">Started trip — {fmtTime(trip.tripStartAt)}</p>
                      {pinLink(trip.tripStartLat, trip.tripStartLon) && (
                        <a href={pinLink(trip.tripStartLat, trip.tripStartLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> View location
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {trip.pickupAt && (
                  <div className="flex items-start gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-600">Picked up customer — {fmtTime(trip.pickupAt)}</p>
                      {pinLink(trip.pickupLat, trip.pickupLon) && (
                        <a href={pinLink(trip.pickupLat, trip.pickupLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> View location
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {trip.tripEndAt && (
                  <div className="flex items-start gap-2 text-xs">
                    <Flag className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-gray-600">Ended trip — {fmtTime(trip.tripEndAt)}</p>
                      {pinLink(trip.tripEndLat, trip.tripEndLon) && (
                        <a href={pinLink(trip.tripEndLat, trip.tripEndLon)!} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold flex items-center gap-1">
                          <Navigation className="w-3 h-3" /> View location
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {trip.proofPhotos.length > 0 && (
                <div className="flex gap-2 flex-wrap pt-1">
                  {trip.proofPhotos.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt="Proof" className="w-14 h-14 object-cover rounded-xl border border-gray-100" />
                  ))}
                </div>
              )}

              {trip.customerFeedback && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  {trip.customerRating != null && (
                    <div className="flex items-center gap-0.5 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < trip.customerRating! ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-700">"{trip.customerFeedback}"</p>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 pt-1 border-t border-gray-50">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
