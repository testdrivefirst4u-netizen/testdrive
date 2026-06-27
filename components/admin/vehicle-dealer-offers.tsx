"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Tag, ToggleLeft, ToggleRight, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

interface Dealer {
  id: string;
  name: string;
  city: string;
  brandId: string;
}

interface Offer {
  id: string;
  dealerId: string;
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
  dealer: { id: string; name: string; city: string; phone: string };
}

interface Props {
  vehicleId: string;
  vehicleName: string;
  initialOffers: Offer[];
  dealers: Dealer[];
}

const EMPTY_FORM = {
  dealerId: "",
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

function toDateInputValue(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function VehicleDealerOffers({ vehicleId, vehicleName, initialOffers, dealers }: Props) {
  const [offers, setOffers]       = useState<Offer[]>(initialOffers);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const f = (k: keyof typeof EMPTY_FORM, v: string | boolean) =>
    setForm((p) => ({ ...p, [k]: v }));

  function openCreate() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormError("");
    setShowForm(true);
  }

  function openEdit(offer: Offer) {
    setForm({
      dealerId:     offer.dealerId,
      variantName:  offer.variantName  ?? "",
      offerPrice:   offer.offerPrice   != null ? String(offer.offerPrice)  : "",
      discount:     offer.discount     != null ? String(offer.discount)    : "",
      discountType: offer.discountType ?? "fixed",
      priceDisplay: offer.priceDisplay ?? "",
      validFrom:    toDateInputValue(offer.validFrom),
      validUntil:   toDateInputValue(offer.validUntil),
      notes:        offer.notes        ?? "",
      isActive:     offer.isActive,
    });
    setEditingId(offer.id);
    setFormError("");
    setShowForm(true);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormError("");
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.dealerId) {
      setFormError("Please select a dealer.");
      return;
    }
    setSaving(true);
    setFormError("");

    const payload = {
      dealerId:     form.dealerId,
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
      res = await fetch(`/api/admin/dealer-offers/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch(`/api/admin/vehicles/${vehicleId}/dealer-offers`, {
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
    const res = await fetch(`/api/admin/dealer-offers/${id}`, { method: "DELETE" });
    setDeleting(null);
    if (!res.ok) {
      toast.error("Failed to delete offer");
      return;
    }
    setOffers((prev) => prev.filter((o) => o.id !== id));
    toast.success("Offer deleted");
  }

  async function handleToggleActive(offer: Offer) {
    setToggling(offer.id);
    const res = await fetch(`/api/admin/dealer-offers/${offer.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !offer.isActive }),
    });
    setToggling(null);
    if (!res.ok) {
      toast.error("Failed to update offer");
      return;
    }
    const updated: Offer = await res.json();
    setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
  }

  const formatPrice = (price: number | null) =>
    price != null ? `₹${price.toLocaleString("en-IN")}` : "—";

  const formatDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-IN") : "—";

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-gray-500">
            {offers.length} offer{offers.length !== 1 ? "s" : ""} for{" "}
            <span className="font-semibold text-gray-700">{vehicleName}</span>
          </p>
        </div>
        <button
          onClick={showForm ? cancelForm : openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors"
        >
          {showForm && !editingId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm && !editingId ? "Cancel" : "Add Offer"}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-sm font-bold text-gray-800">
            {editingId ? "Edit Offer" : "New Offer"}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Dealer */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Dealer <span className="text-red-500">*</span>
              </label>
              <select
                value={form.dealerId}
                onChange={(e) => f("dealerId", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select dealer…</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} — {d.city}
                  </option>
                ))}
              </select>
            </div>

            {/* Variant name */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Variant Name <span className="text-gray-400">(optional)</span>
              </label>
              <input
                value={form.variantName}
                onChange={(e) => f("variantName", e.target.value)}
                placeholder="e.g. ZX+ Turbo"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Offer price */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Offer Price (₹)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={form.offerPrice}
                onChange={(e) => f("offerPrice", e.target.value)}
                placeholder="e.g. 850000"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Discount + Discount type side by side */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Discount</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.discount}
                  onChange={(e) => f("discount", e.target.value)}
                  placeholder="Amount or %"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={form.discountType}
                  onChange={(e) => f("discountType", e.target.value)}
                  className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="fixed">₹ Fixed</option>
                  <option value="percentage">% Percent</option>
                </select>
              </div>
            </div>

            {/* Price display */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">
                Price Display <span className="text-gray-400">(label shown to user)</span>
              </label>
              <input
                value={form.priceDisplay}
                onChange={(e) => f("priceDisplay", e.target.value)}
                placeholder="e.g. ₹8.50 Lakh onwards"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valid from */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => f("validFrom", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Valid until */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => f("validUntil", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Is active */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => f("isActive", !form.isActive)}
                className="shrink-0"
              >
                {form.isActive ? (
                  <ToggleRight className="w-6 h-6 text-emerald-500" />
                ) : (
                  <ToggleLeft className="w-6 h-6 text-gray-300" />
                )}
              </button>
              <label className="text-sm font-medium text-gray-700">Active</label>
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
              className="px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {editingId ? "Save Changes" : "Create Offer"}
            </button>
          </div>
        </div>
      )}

      {/* Offers table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {offers.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No dealer offers yet</p>
            <button
              onClick={openCreate}
              className="mt-3 text-blue-600 text-sm font-semibold hover:underline"
            >
              Add the first offer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Dealer
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Variant
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Offer Price
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    Discount
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    Valid Until
                  </th>
                  <th className="text-center px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Active
                  </th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-gray-900">{offer.dealer.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{offer.dealer.city}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-gray-600">
                        {offer.variantName ?? <span className="text-gray-300 italic">All variants</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-bold text-gray-900">
                        {offer.priceDisplay ?? formatPrice(offer.offerPrice)}
                      </p>
                      {offer.priceDisplay && offer.offerPrice != null && (
                        <p className="text-[10px] text-gray-400">{formatPrice(offer.offerPrice)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      {offer.discount != null ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          -{offer.discount}
                          {offer.discountType === "percentage" ? "%" : " ₹"}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-gray-600">{formatDate(offer.validUntil)}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => handleToggleActive(offer)}
                        disabled={toggling === offer.id}
                        className="disabled:opacity-40"
                      >
                        {toggling === offer.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400 mx-auto" />
                        ) : offer.isActive ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(offer)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 text-xs font-bold"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          disabled={deleting === offer.id}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 disabled:opacity-40"
                          title="Delete"
                        >
                          {deleting === offer.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
