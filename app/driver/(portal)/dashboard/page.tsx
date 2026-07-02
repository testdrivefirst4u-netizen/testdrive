"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Loader2, Phone, Clock, MapPin, Navigation, Camera,
  RefreshCw, Star, Car, CheckCircle2, Gauge, Trophy, Radio, Bell,
} from "lucide-react";
import { toast } from "sonner";
import { startRingtone, stopRingtone, unlockAudio } from "@/lib/ringtone";
import { isPushSupported, getPushSubscriptionStatus, subscribeDriverToPush } from "@/lib/push-client";

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

interface Trip {
  id: string;
  vehicleName: string | null;
  status: "SCHEDULED" | "EN_ROUTE" | "ARRIVED";
  proofPhotos: string[];
  lead: Lead;
}

interface Stats {
  tripsCompleted: number;
  totalKm: number;
  avgRating: number | null;
  tripsToday: number;
}

const LOCATION_PING_INTERVAL_MS = 25_000;
const NEW_TRIP_POLL_MS = 15_000;

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition((pos) => resolve(pos), () => resolve(null), { timeout: 10000 });
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function DriverDashboardPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [feedbackTripId, setFeedbackTripId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [incomingTrip, setIncomingTrip] = useState<Trip | null>(null);
  const [pushStatus, setPushStatus] = useState<"granted" | "denied" | "default" | "unsupported" | null>(null);
  const [enablingPush, setEnablingPush] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const seenTripIds = useRef<Set<string> | null>(null); // null = not initialized yet

  useEffect(() => {
    if (isPushSupported()) getPushSubscriptionStatus().then(setPushStatus);
    else setPushStatus("unsupported");
  }, []);

  // Unlock the ringtone's AudioContext on the very first tap/click anywhere on this
  // page — browsers won't let audio actually play from a background poll otherwise.
  useEffect(() => {
    const unlock = () => unlockAudio();
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  async function enablePushAlerts() {
    setEnablingPush(true);
    try {
      const result = await subscribeDriverToPush();
      setPushStatus(await getPushSubscriptionStatus());

      if (result.ok) {
        toast.success("Trip alerts enabled — you'll get notified even if the app is closed");
        return;
      }

      switch (result.reason) {
        case "insecure_context":
          toast.error("Notifications need HTTPS. This won't work over plain http:// unless you're on localhost.");
          break;
        case "unsupported":
          toast.error("Your browser doesn't support push notifications.");
          break;
        case "missing_key":
          toast.error("Push isn't configured on the server yet — ask your admin.");
          break;
        case "permission_denied":
          toast.error("Notifications are blocked for this site. Open your browser's site settings and allow notifications, then try again.");
          break;
        case "permission_dismissed":
          toast.error("You dismissed the permission prompt. Tap Enable again to retry.");
          break;
        default:
          toast.error(result.detail ? `Couldn't enable notifications: ${result.detail}` : "Couldn't enable notifications.");
      }
    } finally {
      setEnablingPush(false);
    }
  }

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/driver/trips");
      const data = await res.json();
      const fetched: Trip[] = Array.isArray(data.trips) ? data.trips : [];
      setTrips(fetched);
      // First load — remember what's already assigned, don't ring for these
      seenTripIds.current = new Set(fetched.map((t) => t.id));
    } catch {
      toast.error("Failed to load trips");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/stats");
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => { loadTrips(); loadStats(); }, [loadTrips, loadStats]);

  // Poll for newly-assigned trips and ring like an incoming order (Zomato/Swiggy style)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/driver/trips");
        const data = await res.json();
        const fetched: Trip[] = Array.isArray(data.trips) ? data.trips : [];

        if (seenTripIds.current) {
          const brandNew = fetched.find((t) => t.status === "SCHEDULED" && !seenTripIds.current!.has(t.id));
          if (brandNew && !incomingTrip) {
            setIncomingTrip(brandNew);
            startRingtone();
          }
        }
        seenTripIds.current = new Set(fetched.map((t) => t.id));
        setTrips(fetched);
      } catch {}
    }, NEW_TRIP_POLL_MS);
    return () => clearInterval(interval);
  }, [incomingTrip]);

  function acknowledgeIncomingTrip() {
    stopRingtone();
    setIncomingTrip(null);
  }

  useEffect(() => () => stopRingtone(), []); // stop ringing if the page unmounts

  // Live location reporting — pings every ~25s for whichever trip is currently active
  const activeTrip = trips.find((t) => t.status === "EN_ROUTE" || t.status === "ARRIVED");
  useEffect(() => {
    if (!activeTrip) return;
    const tripId = activeTrip.id;

    async function ping() {
      const pos = await getCurrentPosition();
      if (!pos) return;
      fetch(`/api/driver/trips/${tripId}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      }).catch(() => {});
    }

    ping();
    const interval = setInterval(ping, LOCATION_PING_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeTrip?.id]);

  async function doAction(trip: Trip, action: "start" | "pickup" | "end", extra?: { customerFeedback?: string; customerRating?: number }) {
    setBusy(trip.id);
    try {
      const pos = await getCurrentPosition();
      const res = await fetch(`/api/driver/trips/${trip.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          latitude: pos?.coords.latitude,
          longitude: pos?.coords.longitude,
          ...extra,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Failed to update trip"); return; }

      if (action === "end") {
        setTrips((prev) => prev.filter((t) => t.id !== trip.id));
        setFeedbackTripId(null);
        setRating(0);
        setFeedback("");
        toast.success("Trip completed — thanks!");
        loadStats();
      } else {
        setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, status: data.trip.status } : t)));
        toast.success(action === "start" ? "Trip started" : "Customer picked up");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBusy(null);
    }
  }

  async function handlePhotoSelect(trip: Trip, file: File | undefined) {
    if (!file) return;
    setUploading(trip.id);
    try {
      const [base64, pos] = await Promise.all([fileToBase64(file), getCurrentPosition()]);
      const res = await fetch(`/api/driver/trips/${trip.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64, fileName: file.name, latitude: pos?.coords.latitude, longitude: pos?.coords.longitude }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Upload failed"); return; }
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, proofPhotos: data.trip.proofPhotos } : t)));
      toast.success("Photo uploaded");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setUploading(null);
    }
  }

  function formatDateTime(lead: Lead) {
    const parts = [lead.buyTime, lead.preferredTime].filter(Boolean);
    return parts.length ? parts.join(" at ") : "Not specified";
  }

  const feedbackTrip = trips.find((t) => t.id === feedbackTripId);

  return (
    <div className="px-4 py-5 space-y-5 max-w-md mx-auto">
      {pushStatus === "default" && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <Bell className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="flex-1 text-xs text-amber-800">Get notified instantly when a new trip is assigned — even if this app is closed.</p>
          <button onClick={enablePushAlerts} disabled={enablingPush}
            className="shrink-0 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-2 rounded-xl disabled:opacity-50">
            {enablingPush ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Enable"}
          </button>
        </div>
      )}

      {/* Stats header */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg shadow-emerald-900/10">
        <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wide mb-3">Your Performance</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <div className="flex items-center gap-1 text-emerald-200 mb-0.5">
              <Trophy className="w-3 h-3" />
              <span className="text-[10px] font-semibold">Trips</span>
            </div>
            <p className="text-2xl font-extrabold leading-none">{stats?.tripsCompleted ?? "—"}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-emerald-200 mb-0.5">
              <Gauge className="w-3 h-3" />
              <span className="text-[10px] font-semibold">KM Driven</span>
            </div>
            <p className="text-2xl font-extrabold leading-none">{stats?.totalKm ?? "—"}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-emerald-200 mb-0.5">
              <Star className="w-3 h-3" />
              <span className="text-[10px] font-semibold">Rating</span>
            </div>
            <p className="text-2xl font-extrabold leading-none">{stats?.avgRating ?? "—"}</p>
          </div>
        </div>
        {stats && stats.tripsToday > 0 && (
          <p className="text-[11px] text-emerald-100 mt-3 pt-3 border-t border-white/15">
            {stats.tripsToday} trip{stats.tripsToday > 1 ? "s" : ""} completed today
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">My Trips</h1>
        <button onClick={() => { loadTrips(); loadStats(); }} disabled={loading} className="p-2 rounded-xl border border-gray-200 text-gray-500">
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
            <h3 className="font-bold text-gray-900 text-sm">No trips assigned</h3>
            <p className="text-xs text-gray-500 mt-1">Check back later or contact your dealer.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            const mapsUrl = trip.lead.latitude != null && trip.lead.longitude != null
              ? `https://maps.google.com/?q=${trip.lead.latitude},${trip.lead.longitude}` : null;
            const isLive = trip.status === "EN_ROUTE" || trip.status === "ARRIVED";

            return (
              <div key={trip.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-gray-900">{trip.vehicleName ?? "Vehicle"}</p>
                  <div className="flex items-center gap-1.5">
                    {isLive && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-red-500">
                        <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      trip.status === "SCHEDULED" ? "bg-slate-100 text-slate-600" :
                      trip.status === "EN_ROUTE" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                    }`}>
                      {trip.status.replace("_", " ")}
                    </span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-gray-800">{trip.lead.name}</p>

                <div className="space-y-1.5 text-sm text-gray-600">
                  <a href={`tel:+91${trip.lead.mobile}`} className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" /> +91 {trip.lead.mobile}
                  </a>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {formatDateTime(trip.lead)}
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate flex-1">{trip.lead.address ?? trip.lead.city ?? "Not shared"}</span>
                    {mapsUrl && (
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-semibold shrink-0 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {trip.proofPhotos.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {trip.proofPhotos.map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="Proof" className="w-14 h-14 object-cover rounded-xl border border-gray-100" />
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 pt-2 border-t border-gray-50">
                  {trip.status === "SCHEDULED" && (
                    <button
                      onClick={() => doAction(trip, "start")}
                      disabled={busy === trip.id}
                      className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {busy === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                      Start Trip
                    </button>
                  )}
                  {trip.status === "EN_ROUTE" && (
                    <button
                      onClick={() => doAction(trip, "pickup")}
                      disabled={busy === trip.id}
                      className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {busy === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      Picked Up Customer
                    </button>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRefs.current[trip.id]?.click()}
                      disabled={uploading === trip.id}
                      className="flex-1 h-11 border border-indigo-200 text-indigo-600 font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {uploading === trip.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      Photo
                    </button>
                    <input
                      ref={(el) => { fileInputRefs.current[trip.id] = el; }}
                      type="file" accept="image/*" capture="environment" className="hidden"
                      onChange={(e) => handlePhotoSelect(trip, e.target.files?.[0])}
                    />

                    {trip.status === "ARRIVED" && (
                      <button
                        onClick={() => { setFeedbackTripId(trip.id); setRating(0); setFeedback(""); }}
                        className="flex-1 h-11 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm"
                      >
                        End Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* End-trip feedback sheet */}
      {feedbackTrip && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFeedbackTripId(null)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 space-y-4">
            <div>
              <p className="font-bold text-gray-900">End Test Drive</p>
              <p className="text-xs text-gray-500 mt-0.5">{feedbackTrip.lead.name} — {feedbackTrip.vehicleName}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-2">Customer Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setRating(n)} className="p-1">
                    <Star className={`w-8 h-8 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">What did the customer say?</label>
              <textarea
                rows={3}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="e.g. Liked the mileage, will decide in a week…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setFeedbackTripId(null)} className="flex-1 h-11 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600">
                Cancel
              </button>
              <button
                onClick={() => doAction(feedbackTrip, "end", { customerFeedback: feedback, customerRating: rating })}
                disabled={!rating || !feedback.trim() || busy === feedbackTrip.id}
                className="flex-1 h-11 bg-emerald-600 text-white rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {busy === feedbackTrip.id && <Loader2 className="w-4 h-4 animate-spin" />}
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Incoming trip alert — Zomato/Swiggy style ringing overlay */}
      {incomingTrip && (
        <div className="fixed inset-0 z-[60] bg-emerald-700 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-24 h-24 rounded-full bg-white/15 flex items-center justify-center mb-6 animate-pulse">
            <Bell className="w-12 h-12 text-white" />
          </div>
          <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest mb-2">New Test Drive Assigned</p>
          <h2 className="text-2xl font-extrabold text-white mb-4">{incomingTrip.vehicleName ?? "Vehicle"}</h2>

          <div className="bg-white/10 rounded-2xl px-5 py-4 w-full max-w-xs space-y-2 mb-8">
            <p className="text-white font-semibold">{incomingTrip.lead.name}</p>
            <p className="text-emerald-100 text-sm flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {[incomingTrip.lead.buyTime, incomingTrip.lead.preferredTime].filter(Boolean).join(" at ") || "Time not specified"}
            </p>
            <p className="text-emerald-100 text-sm flex items-center justify-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{incomingTrip.lead.address ?? incomingTrip.lead.city ?? "Location not shared"}</span>
            </p>
          </div>

          <button
            onClick={acknowledgeIncomingTrip}
            className="w-full max-w-xs h-14 bg-white text-emerald-700 font-extrabold rounded-2xl text-base shadow-lg active:scale-95 transition-transform"
          >
            OK, Got It
          </button>
        </div>
      )}
    </div>
  );
}
