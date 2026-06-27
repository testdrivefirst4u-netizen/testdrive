"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus, Trash2, Loader2, Tag, ToggleLeft, ToggleRight,
  X, Save, Search, IndianRupee, Calendar, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface Vehicle {
  id: string;
  name: string;
  slug: string;
  featuredImage: string | null;
}

interface Offer {
  id: string;
  vehicleId: string;
  variantName: string | null;
  offerPrice: number | null;
  discount: number | null;
  discountType: string | null;
  priceDisplay: string | null;
  validFrom: string | null;
  validUntil: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vehicle: Vehicle;
}

const EMPTY_FORM = {
  vehicleId: "",
  variantName: "",
  offerPrice: "",
  discount: "",
  discountType: "fixed",
  priceDisplay: "",
  validFrom: "",
  validUntil: "",
  notes: "",
  isActive: true,
};

function toDateInput(iso: string | null) {
  return iso ? iso.slice(0, 10) : "";
}

function formatPrice(n: number | null) {
  if (n == null) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function DealerOffersPage() {
  const [offers, setOffers]       = useState<Offer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [search, setSearch]       = useState("");

  // Vehicle search for the form
  const [vehicleQuery, setVehicleQuery]   = useState("");
  const [vehicleResults, setVehicleResults] = useState<Vehicle[]>([]);
  const [vehicleSearching, setVehicleSearching] = useState(false);
  const [selectedVehicle, setSelectedVehicle]   = useState<Vehicle | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dealer/offers");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setOffers(Array.isArray(data.offers) ? data.offers : []);
    } catch {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Debounced vehicle search
  useEffect(() => {
    if (!vehicleQuery.trim() || vehicleQuery.length < 2) {
      setVehicleResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setVehicleSearching(true);
      try {
        const res = await fetch(`/api/vehicles/search?q=${encodeURIComponent(vehicleQuery)}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setVehicleResults(Array.isArray(data.vehicles) ? data.vehicles : []);
        }
      } catch {}
      setVehicleSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [vehicleQuery]);

  const f = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setSelectedVehicle(null);
    setVehicleQuery("");
    setVehicleResults([]);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(offer: Offer) {
    setForm({
      vehicleId:    offer.vehicleId,
      variantName:  offer.variantName  ?? "",
      offerPrice:   offer.offerPrice   != null ? String(offer.offerPrice) : "",
      discount:     offer.discount     != null ? String(offer.discount)   : "",
      discountType: offer.discountType ?? "fixed",
      priceDisplay: offer.priceDisplay ?? "",
      validFrom:    toDateInput(offer.validFrom),
      validUntil:   toDateInput(offer.validUntil),
      notes:        offer.notes        ?? "",
      isActive:     offer.isActive,
    });
    setSelectedVehicle(offer.vehicle);
    setVehicleQuery(offer.vehicle.name);
    setVehicleResults([]);
    setEditingId(offer.id);
    setFormError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setSelectedVehicle(null);
    setVehicleQuery("");
    setVehicleResults([]);
    setFormError("");
    setForm(EMPTY_FORM);
  }

  function selectVehicle(v: Vehicle) {
    setSelectedVehicle(v);
    setVehicleQuery(v.name);
    setVehicleResults([]);
    f("vehicleId", v.id);
  }

  async function handleSave() {
    if (!form.vehicleId) {
      setFormError("Please select a vehicle.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      vehicleId:    form.vehicleId,
      variantName:  form.variantName  || null,
      offerPrice:   form.offerPrice   ? parseFloat(form.offerPrice)  : null,
      discount:     form.discount     ? parseFloat(form.discount)    : null,
      discountType: form.discountType || null,
      priceDisplay: form.priceDisplay || null,
      validFrom:    form.validFrom    || null,
      validUntil:   form.validUntil   || null,
      notes:        form.notes        || null,
      isActive:     form.isActive,
    };

    let res: Response;
    if (editingId) {
      res = await fetch(`/api/dealer/offers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/dealer/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setSaving(false);

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setFormError(err.error ?? "Failed to save offer.");
      return;
    }

    const saved: Offer = await res.json();
    if (editingId) {
      setOffers((prev) => prev.map((o) => (o.id === editingId ? saved : o)));
      toast.success("Offer updated");
    } else {
      setOffers((prev) => [saved, ...prev]);
      toast.success("Offer created");
    }
    cancelForm();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this offer? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/dealer/offers/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) { toast.error("Failed to delete"); return; }
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success("Offer deleted");
  }

  async function handleToggle(offer: Offer) {
    setToggling(offer.id);
    const res = await fetch(`/api/dealer/offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !offer.isActive }),
    });
    setToggling(null);
    if (!res.ok) { toast.error("Failed to update"); return; }
    const updated: Offer = await res.json();
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
  }

  const q = search.toLowerCase();
  const filtered = offers.filter(
    (o) =>
      !q ||
      o.vehicle.name.toLowerCase().includes(q) ||
      (o.variantName ?? "").toLowerCase().includes(q) ||
      (o.priceDisplay ?? "").toLowerCase().includes(q)
  );

  const activeCount = offers.filter((o) => o.isActive).length;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage vehicle offer prices visible to customers
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-gray-300 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={showForm ? cancelForm : openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "Add Offer"}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{offers.length}</p>
          <p className="text-xs text-gray-400">offers</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1">{activeCount}</p>
          <p className="text-xs text-indigo-400">live</p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inactive</p>
          <p className="text-2xl font-extrabold text-gray-400 mt-1">{offers.length - activeCount}</p>
          <p className="text-xs text-gray-400">hidden</p>
        </div>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-sm font-bold text-gray-800">
            {editingId ? "Edit Offer" : "New Offer"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Vehicle search */}
            <div className="sm:col-span-2 relative">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Vehicle <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  value={vehicleQuery}
                  onChange={(e) => {
                    setVehicleQuery(e.target.value);
                    if (selectedVehicle && e.target.value !== selectedVehicle.name) {
                      setSelectedVehicle(null);
                      f("vehicleId", "");
                    }
                  }}
                  placeholder="Search for a vehicle…"
                  className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                {vehicleSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              {vehicleResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {vehicleResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => selectVehicle(v)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-indigo-50 text-left transition-colors"
                    >
                      {v.featuredImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.featuredImage} alt="" className="w-8 h-6 object-cover rounded-lg shrink-0" />
                      )}
                      <span className="text-sm font-medium text-gray-800">{v.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {selectedVehicle && (
                <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Selected: {selectedVehicle.name}
                </p>
              )}
            </div>

            {/* Variant name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Variant <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={form.variantName}
                onChange={(e) => f("variantName", e.target.value)}
                placeholder="e.g. ZX+ Turbo"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Offer price */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Offer Price (₹)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.offerPrice}
                onChange={(e) => f("offerPrice", e.target.value)}
                placeholder="e.g. 850000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Discount + type */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Discount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={form.discount}
                  onChange={(e) => f("discount", e.target.value)}
                  placeholder="Amount or %"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <select
                  value={form.discountType}
                  onChange={(e) => f("discountType", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white"
                >
                  <option value="fixed">₹ Fixed</option>
                  <option value="percentage">% Percent</option>
                </select>
              </div>
            </div>

            {/* Price display */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Price Label <span className="text-gray-400">(shown to customers)</span>
              </label>
              <input
                value={form.priceDisplay}
                onChange={(e) => f("priceDisplay", e.target.value)}
                placeholder="e.g. ₹8.50 Lakh onwards"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Valid from */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => f("validFrom", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Valid until */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => f("validUntil", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => f("notes", e.target.value)}
                placeholder="Any additional notes about this offer…"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => f("isActive", !form.isActive)} className="shrink-0">
                {form.isActive ? (
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-300" />
                )}
              </button>
              <label className="text-sm font-medium text-gray-700">
                {form.isActive ? "Active — visible to customers" : "Inactive — hidden"}
              </label>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{formError}</p>
          )}

          <div className="flex gap-3 justify-end pt-1">
            <button
              onClick={cancelForm}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {editingId ? "Save Changes" : "Create Offer"}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {!showForm && offers.length > 0 && (
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search offers…"
            className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Offers list */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading offers…
        </div>
      ) : offers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <Tag className="w-8 h-8 text-indigo-200" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-gray-900">No offers yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Add your first offer to attract more customers.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Add First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((offer) => (
            <div
              key={offer.id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${
                offer.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              {/* Vehicle thumbnail */}
              <div className="relative h-32 bg-gray-50">
                {offer.vehicle.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={offer.vehicle.featuredImage}
                    alt={offer.vehicle.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200">
                    <IndianRupee className="w-10 h-10" />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-2 right-2">
                  {offer.isActive ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                      Off
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="font-extrabold text-gray-900 leading-tight">{offer.vehicle.name}</p>
                  {offer.variantName && (
                    <p className="text-xs text-gray-400 mt-0.5">{offer.variantName}</p>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-extrabold text-indigo-700">
                    {offer.priceDisplay ?? formatPrice(offer.offerPrice)}
                  </span>
                  {offer.discount != null && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      -{offer.discount}{offer.discountType === "percentage" ? "%" : " ₹"}
                    </span>
                  )}
                </div>

                {/* Validity */}
                {(offer.validFrom || offer.validUntil) && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {offer.validFrom && <span>From {formatDate(offer.validFrom)}</span>}
                    {offer.validFrom && offer.validUntil && <span>·</span>}
                    {offer.validUntil && <span>Until {formatDate(offer.validUntil)}</span>}
                  </div>
                )}

                {offer.notes && (
                  <p className="text-xs text-gray-400 line-clamp-2">{offer.notes}</p>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(offer)}
                      disabled={toggling === offer.id}
                      className="disabled:opacity-40"
                    >
                      {toggling === offer.id ? (
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      ) : offer.isActive ? (
                        <ToggleRight className="w-6 h-6 text-emerald-500" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-300" />
                      )}
                    </button>
                    <span className="text-xs text-gray-400">
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(offer)}
                      className="px-3 py-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      disabled={deleting === offer.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-40"
                    >
                      {deleting === offer.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
