"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarClock, Phone, Loader2, CheckCircle2, AlertCircle, Clock,
  Plus, ChevronDown, ChevronUp, MapPin, Download,
} from "lucide-react";

type FuStatus = "all" | "overdue" | "today" | "upcoming" | "done";

interface FollowUpItem {
  id: string;
  scheduledAt: string;
  note: string | null;
  status: string;
  outcome: string | null;
  doneAt: string | null;
  lead: { id: string; name: string; mobile: string; vehicleName: string | null; city: string | null; status: string };
}

interface LeadGroup {
  lead: FollowUpItem["lead"];
  followUps: FollowUpItem[];           // all non-cancelled, newest last
  nextPending: FollowUpItem | null;    // most urgent pending
  urgency: "overdue" | "today" | "upcoming" | "done";
}

/* ── helpers ─────────────────────────────────────── */

function isOverdue(d: string) {
  const date = new Date(d); const now = new Date();
  return date < now && date.toDateString() !== now.toDateString();
}
function isToday(d: string) {
  return new Date(d).toDateString() === new Date().toDateString();
}
function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}
function relTime(d: string) {
  const diff = new Date(d).getTime() - Date.now();
  const abs  = Math.abs(diff);
  const past = diff < 0;
  const days = Math.floor(abs / 86400000);
  const hrs  = Math.floor(abs / 3600000);
  const mins = Math.floor(abs / 60000);
  if (days > 0) return past ? `${days}d ago` : `in ${days}d`;
  if (hrs  > 0) return past ? `${hrs}h ago`  : `in ${hrs}h`;
  return past ? `${mins}m ago` : `in ${mins}m`;
}

function getUrgency(fu: FollowUpItem): LeadGroup["urgency"] {
  if (fu.status !== "pending") return "done";
  if (isOverdue(fu.scheduledAt))  return "overdue";
  if (isToday(fu.scheduledAt))    return "today";
  return "upcoming";
}

function groupByLead(items: FollowUpItem[]): LeadGroup[] {
  const map = new Map<string, FollowUpItem[]>();
  for (const fu of items) {
    const key = fu.lead.id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(fu);
  }

  const groups: LeadGroup[] = [];
  map.forEach((fus, _leadId) => {
    // sort: oldest first (for timeline display)
    fus.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const pending = fus.filter(f => f.status === "pending");
    // most urgent pending = overdue first, then soonest
    pending.sort((a, b) => {
      const ao = isOverdue(a.scheduledAt), bo = isOverdue(b.scheduledAt);
      if (ao && !bo) return -1;
      if (!ao && bo) return 1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });

    const nextPending = pending[0] ?? null;
    const urgency: LeadGroup["urgency"] = nextPending
      ? getUrgency(nextPending)
      : "done";

    groups.push({ lead: fus[0].lead, followUps: fus, nextPending, urgency });
  });

  // Sort groups: overdue → today → upcoming → done
  const rank = { overdue: 0, today: 1, upcoming: 2, done: 3 };
  groups.sort((a, b) => {
    const diff = rank[a.urgency] - rank[b.urgency];
    if (diff !== 0) return diff;
    const at = a.nextPending?.scheduledAt ?? a.followUps.at(-1)?.scheduledAt ?? "";
    const bt = b.nextPending?.scheduledAt ?? b.followUps.at(-1)?.scheduledAt ?? "";
    return new Date(at).getTime() - new Date(bt).getTime();
  });

  return groups;
}

/* ── Timeline entry ──────────────────────────────── */

function TimelineEntry({
  fu,
  onMarkDone,
}: {
  fu: FollowUpItem;
  onMarkDone: (id: string) => void;
}) {
  const isDone      = fu.status === "done";
  const isCancelled = fu.status === "cancelled";
  const overdue     = fu.status === "pending" && isOverdue(fu.scheduledAt);
  const today       = fu.status === "pending" && isToday(fu.scheduledAt);

  return (
    <div className={`relative pl-6 pb-4 last:pb-0 before:absolute before:left-2 before:top-0 before:bottom-0 before:w-px ${
      isDone ? "before:bg-emerald-200" : isCancelled ? "before:bg-gray-100" :
      overdue ? "before:bg-red-200" : today ? "before:bg-amber-200" : "before:bg-blue-100"
    }`}>
      {/* dot */}
      <span className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
        isDone      ? "bg-emerald-100 border-emerald-400" :
        isCancelled ? "bg-gray-100 border-gray-300" :
        overdue     ? "bg-red-100 border-red-400" :
        today       ? "bg-amber-100 border-amber-400" :
                      "bg-blue-50 border-blue-300"
      }`}>
        {isDone && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
        {overdue && <AlertCircle className="w-2.5 h-2.5 text-red-500" />}
        {today   && <Clock className="w-2.5 h-2.5 text-amber-500" />}
      </span>

      <div className="ml-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold ${
            isDone ? "text-gray-400" : overdue ? "text-red-700" : today ? "text-amber-700" : "text-gray-700"
          }`}>
            {fmtDate(fu.scheduledAt)}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isDone      ? "bg-emerald-100 text-emerald-700" :
            isCancelled ? "bg-gray-100 text-gray-400" :
            overdue     ? "bg-red-100 text-red-600" :
            today       ? "bg-amber-100 text-amber-700" :
                          "bg-blue-100 text-blue-700"
          }`}>
            {isDone ? "Done" : isCancelled ? "Cancelled" : overdue ? "Overdue" : today ? "Today" : "Upcoming"}
          </span>
        </div>

        {fu.note && <p className="text-xs text-gray-500 mt-0.5">{fu.note}</p>}
        {fu.outcome && (
          <p className="text-xs text-emerald-700 mt-0.5 italic">→ {fu.outcome}</p>
        )}

        {fu.status === "pending" && (
          <button
            onClick={() => onMarkDone(fu.id)}
            className="mt-1.5 text-[10px] font-bold flex items-center gap-1 text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" /> Mark as Done
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Lead group card ─────────────────────────────── */

function LeadCard({
  group,
  onRefresh,
}: {
  group: LeadGroup;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAdd,  setShowAdd]  = useState(false);
  const [fuDate,   setFuDate]   = useState("");
  const [fuNote,   setFuNote]   = useState("");
  const [fuSaving, setFuSaving] = useState(false);

  // Mark-done overlay
  const [doneId,     setDoneId]     = useState<string | null>(null);
  const [outcome,    setOutcome]    = useState("");
  const [doneSaving, setDoneSaving] = useState(false);

  const defaultDt = (() => {
    const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(10, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  async function addFollowUp() {
    if (!fuDate) return;
    setFuSaving(true);
    await fetch(`/api/dealer/leads/${group.lead.id}/followups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduledAt: fuDate, note: fuNote }),
    });
    setFuSaving(false); setShowAdd(false); setFuDate(""); setFuNote("");
    onRefresh();
  }

  async function markDone(fid: string) {
    setDoneSaving(true);
    await fetch(`/api/dealer/followups/${fid}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done", outcome }),
    });
    setDoneSaving(false); setDoneId(null); setOutcome("");
    onRefresh();
  }

  const { lead, followUps, nextPending, urgency } = group;
  const pendingCount = followUps.filter(f => f.status === "pending").length;
  const totalCount   = followUps.length;

  const borderColor =
    urgency === "overdue"  ? "border-red-200 shadow-red-50"   :
    urgency === "today"    ? "border-amber-200 shadow-amber-50" :
    urgency === "upcoming" ? "border-blue-100"                :
                             "border-gray-100 opacity-80";

  const avatarBg =
    urgency === "overdue"  ? "bg-red-100 text-red-600"     :
    urgency === "today"    ? "bg-amber-100 text-amber-700"  :
    urgency === "upcoming" ? "bg-indigo-100 text-indigo-600":
                             "bg-emerald-100 text-emerald-600";

  return (
    <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${borderColor}`}>

      {/* Lead header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${avatarBg}`}>
            {lead.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-gray-900 text-sm">{lead.name}</p>
              {urgency === "overdue"  && <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse"><AlertCircle className="w-2.5 h-2.5" />Overdue</span>}
              {urgency === "today"    && <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700"><Clock className="w-2.5 h-2.5" />Due Today</span>}
              {urgency === "upcoming" && <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700"><CalendarClock className="w-2.5 h-2.5" />Upcoming</span>}
              {urgency === "done"     && <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="w-2.5 h-2.5" />All Done</span>}
            </div>
            <div className="flex items-center flex-wrap gap-3 mt-0.5">
              <a href={`tel:${lead.mobile}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                <Phone className="w-3 h-3" />{lead.mobile}
              </a>
              {lead.vehicleName && <span className="text-xs text-gray-400">· {lead.vehicleName}</span>}
              {lead.city && (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <MapPin className="w-3 h-3" />{lead.city}
                </span>
              )}
            </div>
          </div>

          {/* Follow-up count badge */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-xl transition-colors shrink-0"
          >
            <CalendarClock className="w-3 h-3" />
            {totalCount} follow-up{totalCount !== 1 ? "s" : ""}
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Next pending call highlight */}
        {nextPending && (
          <div className={`mt-3 rounded-xl px-3 py-2.5 text-xs ${
            urgency === "overdue" ? "bg-red-50 border border-red-100" :
            urgency === "today"   ? "bg-amber-50 border border-amber-100" :
                                    "bg-blue-50 border border-blue-100"
          }`}>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className={`font-bold ${urgency === "overdue" ? "text-red-700" : urgency === "today" ? "text-amber-700" : "text-blue-700"}`}>
                  {urgency === "overdue" ? "⚠️ Missed call" : urgency === "today" ? "📞 Call today" : "🗓 Next call"}
                  {" "}<span className="font-normal">{fmtDate(nextPending.scheduledAt)}</span>
                </p>
                {nextPending.note && <p className="text-gray-500 mt-0.5">{nextPending.note}</p>}
              </div>
              <span className="text-[10px] text-gray-400 shrink-0">{relTime(nextPending.scheduledAt)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {nextPending && (
            doneId === nextPending.id ? (
              <div className="w-full space-y-2">
                <input
                  type="text" value={outcome} onChange={e => setOutcome(e.target.value)}
                  placeholder="What happened on the call? (optional)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400"
                />
                <div className="flex gap-2">
                  <button onClick={() => markDone(nextPending.id)} disabled={doneSaving}
                    className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                    {doneSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                    Confirm Done
                  </button>
                  <button onClick={() => { setDoneId(null); setOutcome(""); }}
                    className="px-4 text-xs text-gray-400 border border-gray-200 rounded-xl hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setDoneId(nextPending.id); setOutcome(""); }}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-2 rounded-xl transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Called — Mark Done
              </button>
            )
          )}

          {!showAdd && doneId !== nextPending?.id && (
            <button
              onClick={() => { setShowAdd(true); setFuDate(defaultDt); setExpanded(true); }}
              className="flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {nextPending ? "Reschedule / Add" : "Schedule Call"}
            </button>
          )}
        </div>

        {/* Add follow-up inline form */}
        {showAdd && (
          <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 space-y-2">
            <p className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Schedule Follow-up</p>
            <input
              type="datetime-local" value={fuDate} onChange={e => setFuDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <input
              type="text" value={fuNote} onChange={e => setFuNote(e.target.value)}
              placeholder="Note, e.g. call about test drive…"
              className="w-full border border-indigo-200 rounded-xl px-3 py-2 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <div className="flex gap-2">
              <button onClick={addFollowUp} disabled={!fuDate || fuSaving}
                className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 hover:bg-indigo-700 transition-colors">
                {fuSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CalendarClock className="w-3 h-3" />}
                Save
              </button>
              <button onClick={() => { setShowAdd(false); setFuDate(""); setFuNote(""); }}
                className="px-4 text-xs text-gray-400 border border-gray-200 bg-white rounded-xl hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Expandable timeline */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 px-4 pt-4 pb-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-4">
            Full Timeline ({totalCount})
          </p>
          <div>
            {followUps.filter(f => f.status !== "cancelled").map(fu => (
              <TimelineEntry
                key={fu.id}
                fu={fu}
                onMarkDone={(id) => { setDoneId(id); setOutcome(""); }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Page ────────────────────────────────────────── */

export default function FollowUpsPage() {
  const searchParams = useSearchParams();
  const [items,   setItems]   = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<FuStatus>(
    (searchParams.get("filter") as FuStatus) ?? "all"
  );

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/dealer/followups/list");
    const data = await res.json();
    setItems(data.followUps ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const groups = groupByLead(items);

  // Compute counts per tab from groups
  const counts = {
    all:      groups.length,
    overdue:  groups.filter(g => g.urgency === "overdue").length,
    today:    groups.filter(g => g.urgency === "today").length,
    upcoming: groups.filter(g => g.urgency === "upcoming").length,
    done:     groups.filter(g => g.urgency === "done").length,
  };

  const filtered = groups.filter(g => {
    if (filter === "all")      return true;
    if (filter === "overdue")  return g.urgency === "overdue";
    if (filter === "today")    return g.urgency === "today";
    if (filter === "upcoming") return g.urgency === "upcoming";
    if (filter === "done")     return g.urgency === "done";
    return true;
  });

  const TABS: { key: FuStatus; label: string }[] = [
    { key: "all",      label: "All"      },
    { key: "overdue",  label: "Overdue"  },
    { key: "today",    label: "Today"    },
    { key: "upcoming", label: "Upcoming" },
    { key: "done",     label: "Done"     },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Follow-ups</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {groups.length} lead{groups.length !== 1 ? "s" : ""} with follow-ups scheduled
          </p>
        </div>
        <a href="/api/dealer/followups/export"
          className="flex items-center gap-2 text-xs font-bold bg-white border border-gray-200 hover:border-indigo-300 text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-xl transition-colors">
          <Download className="w-3.5 h-3.5" />Export CSV
        </a>
      </div>

      {/* Urgent banners */}
      {(counts.overdue > 0 || counts.today > 0) && (
        <div className="flex flex-wrap gap-2">
          {counts.overdue > 0 && (
            <button onClick={() => setFilter("overdue")}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs font-bold px-4 py-2.5 rounded-2xl hover:bg-red-100 transition-colors">
              <AlertCircle className="w-3.5 h-3.5" />
              {counts.overdue} lead{counts.overdue > 1 ? "s" : ""} with overdue calls
            </button>
          )}
          {counts.today > 0 && (
            <button onClick={() => setFilter("today")}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-4 py-2.5 rounded-2xl hover:bg-amber-100 transition-colors">
              <Clock className="w-3.5 h-3.5" />
              {counts.today} call{counts.today > 1 ? "s" : ""} due today
            </button>
          )}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-0 border-b border-gray-100">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all -mb-px ${
              filter === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}>
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-500"
              }`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm font-semibold">
            {filter === "overdue"  ? "No overdue follow-ups" :
             filter === "today"    ? "No calls due today" :
             filter === "upcoming" ? "No upcoming follow-ups" :
             filter === "done"     ? "No completed follow-ups yet" :
             "No follow-ups yet"}
          </p>
          <p className="text-xs mt-1">Open a lead → Follow-ups tab to schedule one</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(group => (
            <LeadCard key={group.lead.id} group={group} onRefresh={load} />
          ))}
        </div>
      )}
    </div>
  );
}
