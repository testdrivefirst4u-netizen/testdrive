"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Square, UserCheck, Tag, Trash2, X, Loader2 } from "lucide-react";

interface Dealer { id: string; name: string; }

interface Props {
  leadIds: string[];
  dealers: Dealer[];
}

export default function LeadBulkActions({ leadIds, dealers }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, start] = useTransition();
  const [actionOpen, setActionOpen] = useState(false);

  const allSelected = selected.size === leadIds.length && leadIds.length > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(leadIds));
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function runBulk(body: object) {
    start(async () => {
      await fetch("/api/admin/leads/bulk", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ids: [...selected], ...body }),
      });
      setSelected(new Set());
      setActionOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Select-all checkbox */}
      <button onClick={toggleAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-blue-300 hover:text-blue-700 transition-colors">
        {allSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
        {allSelected ? "Deselect All" : "Select All"}
      </button>

      {selected.size > 0 && (
        <>
          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            {selected.size} selected
          </span>

          {/* Assign */}
          <div className="relative">
            <button
              onClick={() => setActionOpen((p) => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" /> Assign to Dealer
            </button>
            {actionOpen && (
              <div className="absolute top-9 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[200px] max-h-64 overflow-y-auto">
                {dealers.map((d) => (
                  <button key={d.id} onClick={() => runBulk({ action: "assign", dealerId: d.id })}
                    className="flex items-center w-full px-4 py-2 text-xs text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors">
                    {d.name}
                  </button>
                ))}
                {dealers.length === 0 && <p className="px-4 py-2 text-xs text-gray-400">No dealers available</p>}
              </div>
            )}
          </div>

          {/* Mark status */}
          <div className="flex items-center gap-1">
            {(["contacted", "converted", "lost"] as const).map((s) => (
              <button key={s} onClick={() => runBulk({ action: "status", status: s })}
                className="px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:border-gray-400 capitalize transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* Delete */}
          <button onClick={() => { if (confirm(`Delete ${selected.size} leads? This cannot be undone.`)) runBulk({ action: "delete" }); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>

          {/* Clear */}
          <button onClick={() => setSelected(new Set())} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>

          {isPending && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
        </>
      )}

      {/* Expose toggle fn to table rows via data-attr trick — use a hidden list */}
      <div className="hidden" id="bulk-lead-state" data-selected={[...selected].join(",")} />
      <script dangerouslySetInnerHTML={{ __html: `
        window.__toggleLead = function(id) {
          document.dispatchEvent(new CustomEvent('toggle-lead', { detail: id }));
        };
      `}} />
    </div>
  );
}

export function LeadRowCheckbox({ id }: { id: string }) {
  const [checked, setChecked] = useState(false);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setChecked((p) => !p); }}
      className="shrink-0"
      aria-label="Select lead"
    >
      {checked ? (
        <CheckSquare className="w-4 h-4 text-blue-600" />
      ) : (
        <Square className="w-4 h-4 text-gray-300 hover:text-gray-500" />
      )}
    </button>
  );
}
