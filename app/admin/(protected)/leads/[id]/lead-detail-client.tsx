"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

const STATUSES = [
  { value: "new",       label: "New",       color: "bg-amber-50 text-amber-700 border-amber-200"     },
  { value: "contacted", label: "Contacted", color: "bg-blue-50 text-blue-700 border-blue-200"        },
  { value: "converted", label: "Converted", color: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  { value: "lost",      label: "Lost",      color: "bg-red-50 text-red-600 border-red-200"            },
];

interface Props {
  lead: { id: string; status: string; notes: string };
  statusColors: Record<string, string>;
}

export function LeadDetailClient({ lead, statusColors }: Props) {
  const [status, setStatus]   = useState(lead.status);
  const [notes, setNotes]     = useState(lead.notes);
  const [saved, setSaved]     = useState(false);
  const [isPending, start]    = useTransition();

  async function save(overrides?: { status?: string; notes?: string }) {
    const payload = { status: overrides?.status ?? status, notes: overrides?.notes ?? notes };
    start(async () => {
      await fetch(`/api/admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function changeStatus(next: string) {
    setStatus(next);
    await save({ status: next });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-5">
      <div>
        <h2 className="font-bold text-gray-900 text-sm mb-3">Update Status</h2>
        <div className="grid grid-cols-2 gap-2">
          {STATUSES.map((s) => (
            <button key={s.value} onClick={() => changeStatus(s.value)}
              disabled={isPending}
              className={`h-9 rounded-xl border text-xs font-bold transition-all disabled:opacity-60 ${
                status === s.value
                  ? `${s.color} ring-2 ring-offset-1 ring-current`
                  : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 mb-2">Internal Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Add notes about this lead — call outcome, follow-up date, customer interest..."
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm text-gray-700 resize-none transition-all"
        />
        <button
          onClick={() => save()}
          disabled={isPending}
          className="mt-2 w-full h-9 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2">
          {isPending
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
            : saved
              ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> Saved!</>
              : "Save Notes"
          }
        </button>
      </div>
    </div>
  );
}
