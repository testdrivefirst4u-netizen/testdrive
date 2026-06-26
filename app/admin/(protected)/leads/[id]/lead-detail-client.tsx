"use client";

import { useState, useTransition, useEffect } from "react";
import { CheckCircle2, Loader2, Clock, User, RefreshCw, MessageSquare, GitBranch, UserCheck } from "lucide-react";

const STATUSES = [
  { value: "new",       label: "New",       color: "bg-amber-50 text-amber-700 border-amber-200"     },
  { value: "contacted", label: "Contacted", color: "bg-blue-50 text-blue-700 border-blue-200"        },
  { value: "converted", label: "Converted", color: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  { value: "lost",      label: "Lost",      color: "bg-red-50 text-red-600 border-red-200"            },
];

const ACTIVITY_ICONS: Record<string, any> = {
  status_change: RefreshCw,
  note:          MessageSquare,
  assignment:    GitBranch,
  created:       User,
};

interface Dealer  { id: string; name: string }
interface Activity { id: string; type: string; content: string; userName?: string; createdAt: string }

interface Props {
  lead: { id: string; status: string; notes: string; dealerId?: string | null };
  statusColors: Record<string, string>;
  dealers?: Dealer[];
}

export function LeadDetailClient({ lead, statusColors, dealers = [] }: Props) {
  const [status,    setStatus]    = useState(lead.status);
  const [notes,     setNotes]     = useState(lead.notes);
  const [newNote,   setNewNote]   = useState("");
  const [dealerId,  setDealerId]  = useState(lead.dealerId ?? "");
  const [saved,     setSaved]     = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isPending,  start]         = useTransition();
  const [notesPending, startNotes]  = useTransition();
  const [dealerPending, startDealer] = useTransition();

  useEffect(() => {
    fetchActivities();
  }, []);

  async function fetchActivities() {
    const res = await fetch(`/api/admin/leads/${lead.id}/activities`);
    if (res.ok) setActivities(await res.json());
  }

  async function save(overrides?: { status?: string; notes?: string }) {
    const payload = { status: overrides?.status ?? status, notes: overrides?.notes ?? notes };
    start(async () => {
      await fetch(`/api/admin/leads/${lead.id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });
      setSaved(true);
      await fetchActivities();
      setTimeout(() => setSaved(false), 2000);
    });
  }

  async function changeStatus(next: string) {
    setStatus(next);
    await save({ status: next });
  }

  async function addNote() {
    if (!newNote.trim()) return;
    startNotes(async () => {
      await fetch(`/api/admin/leads/${lead.id}/activities`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ content: newNote }),
      });
      setNewNote("");
      setNoteSaved(true);
      await fetchActivities();
      setTimeout(() => setNoteSaved(false), 2000);
    });
  }

  async function reassign() {
    startDealer(async () => {
      await fetch(`/api/admin/leads/${lead.id}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dealerId: dealerId || null }),
      });
      await fetchActivities();
    });
  }

  function timeAgo(date: string) {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60)   return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return (
    <div className="space-y-5">
      {/* Status */}
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

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Internal Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add notes about this lead..."
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

        {/* Reassign Dealer */}
        {dealers.length > 0 && (
          <div>
            <label className="flex items-center gap-1 text-xs font-bold text-gray-700 mb-2">
              <UserCheck className="w-3.5 h-3.5" /> Assign Dealer
            </label>
            <div className="flex gap-2">
              <select
                value={dealerId}
                onChange={e => setDealerId(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 bg-white"
              >
                <option value="">— Unassigned —</option>
                {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <button
                onClick={reassign}
                disabled={dealerPending}
                className="px-4 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1">
                {dealerPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Assign"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-gray-900 text-sm mb-4">Activity Timeline</h2>

        {activities.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] ?? MessageSquare;
              return (
                <div key={a.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3 h-3 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{a.content}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(a.createdAt)}
                      {a.userName && <> · <span className="font-medium">{a.userName}</span></>}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick note input */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={e => setNewNote(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addNote()}
            placeholder="Add a quick note…"
            className="flex-1 px-3 h-9 rounded-xl border border-gray-200 focus:border-blue-400 outline-none text-xs"
          />
          <button
            onClick={addNote}
            disabled={notesPending || !newNote.trim()}
            className="px-3 h-9 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1">
            {notesPending
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : noteSaved
                ? <CheckCircle2 className="w-3.5 h-3.5 text-green-200" />
                : "Add"
            }
          </button>
        </div>
      </div>
    </div>
  );
}
