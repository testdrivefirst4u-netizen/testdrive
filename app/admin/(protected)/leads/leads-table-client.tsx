"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Phone, Mail, MapPin, Clock, Car,
  CheckSquare, Square, UserCheck, Trash2, X, Loader2, AlertCircle,
} from "lucide-react";
import { LeadStatusSelect } from "./lead-status-select";
import { LeadReassignSelect } from "./lead-reassign-select";

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  contact_form: { label: "Contact",     color: "bg-blue-50 text-blue-700"     },
  test_drive:   { label: "Test Drive",  color: "bg-purple-50 text-purple-700" },
  newsletter:   { label: "Newsletter",  color: "bg-teal-50 text-teal-700"     },
  offer_popup:  { label: "Offer Popup", color: "bg-orange-50 text-orange-700" },
  compare:      { label: "Compare",     color: "bg-pink-50 text-pink-700"     },
};

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost:      "bg-red-50 text-red-600 border-red-200",
};

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

interface Lead {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  city: string | null;
  vehicleName: string | null;
  source: string;
  status: string;
  createdAt: Date;
  dealerId: string | null;
  brandId: string | null;
  brand:  { id: string; name: string } | null;
  dealer: { id: string; name: string } | null;
}

interface Dealer { id: string; name: string; brandId: string | null; }

interface Props {
  leads: Lead[];
  allDealers: Dealer[];
}

export default function LeadsTableClient({ leads, allDealers }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, start] = useTransition();
  const [assignOpen, setAssignOpen] = useState(false);

  const leadIds = leads.map(l => l.id);
  const allSelected = selected.size === leadIds.length && leadIds.length > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(leadIds));
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function runBulk(body: object) {
    start(async () => {
      await fetch("/api/admin/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected], ...body }),
      });
      setSelected(new Set());
      setAssignOpen(false);
      router.refresh();
    });
  }

  if (leads.length === 0) return null;

  return (
    <div>
      {/* Bulk toolbar */}
      <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-gray-100 bg-slate-50/50">
        <button
          onClick={toggleAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors"
        >
          {allSelected
            ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
            : <Square className="w-3.5 h-3.5" />}
          {allSelected ? "Deselect All" : "Select All"}
        </button>

        {selected.size > 0 && (
          <>
            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              {selected.size} selected
            </span>

            {/* Assign to dealer */}
            <div className="relative">
              <button
                onClick={() => setAssignOpen(p => !p)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5" /> Assign to Dealer
              </button>
              {assignOpen && (
                <div className="absolute top-9 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[200px] max-h-64 overflow-y-auto">
                  {allDealers.map(d => (
                    <button
                      key={d.id}
                      onClick={() => runBulk({ action: "assign", dealerId: d.id })}
                      className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {d.name}
                    </button>
                  ))}
                  {allDealers.length === 0 && (
                    <p className="px-4 py-2 text-xs text-gray-400">No dealers available</p>
                  )}
                </div>
              )}
            </div>

            {/* Status buttons */}
            <div className="flex items-center gap-1">
              {(["contacted", "converted", "lost"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => runBulk({ action: "status", status: s })}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-gray-400 capitalize transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Delete */}
            <button
              onClick={() => {
                if (confirm(`Delete ${selected.size} leads? This cannot be undone.`)) {
                  runBulk({ action: "delete" });
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>

            <button
              onClick={() => setSelected(new Set())}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {isPending && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
          </>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-slate-50/60">
              <th className="px-4 py-3 w-8" />
              <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Contact</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Vehicle</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Brand</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden xl:table-cell">Dealer</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Time</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.map(lead => {
              const src = SOURCE_LABELS[lead.source] ?? { label: lead.source, color: "bg-gray-100 text-gray-600" };
              const brandDealers = allDealers.filter(d => d.brandId === lead.brandId);
              const isSelected = selected.has(lead.id);

              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-slate-50/60 transition-colors ${isSelected ? "bg-blue-50/40" : !lead.dealerId ? "bg-red-50/20" : ""}`}
                >
                  <td className="px-4 py-3.5 w-8">
                    <button
                      onClick={() => toggle(lead.id)}
                      className="shrink-0"
                      aria-label="Select lead"
                    >
                      {isSelected
                        ? <CheckSquare className="w-4 h-4 text-blue-600" />
                        : <Square className="w-4 h-4 text-gray-300 hover:text-gray-500" />}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-gray-800">{lead.name}</p>
                    {lead.city && (
                      <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-2.5 h-2.5" />{lead.city}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <a href={`tel:${lead.mobile}`} className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-blue-600">
                      <Phone className="w-3 h-3 text-green-500" />{lead.mobile}
                    </a>
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 truncate max-w-[180px]">
                        <Mail className="w-3 h-3" />{lead.email}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    {lead.vehicleName ? (
                      <p className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Car className="w-3 h-3 text-gray-400" />{lead.vehicleName}
                      </p>
                    ) : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    {lead.brand ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                        {lead.brand.name}
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <LeadReassignSelect
                      leadId={lead.id}
                      currentId={lead.dealerId ?? null}
                      dealers={brandDealers}
                    />
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <LeadStatusSelect leadId={lead.id} current={lead.status} colors={STATUS_COLORS} />
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <p className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />{timeAgo(new Date(lead.createdAt))}
                    </p>
                  </td>
                  <td className="px-3 py-3.5">
                    <Link href={`/admin/leads/${lead.id}`} className="text-[10px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
