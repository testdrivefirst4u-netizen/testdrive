"use client";
import { useState, useEffect, useCallback } from "react";
import { CalendarClock, Phone, Loader2, MapPin } from "lucide-react";

export default function FollowUpsPage() {
  const [leads,   setLeads]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const res  = await fetch("/api/dealer/leads?status=contacted&limit=50");
    const data = await res.json();
    setLeads(data.leads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/dealer/leads/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Follow-ups</h1>
        <p className="text-sm text-gray-500 mt-0.5">Leads you&apos;ve contacted — mark as converted or lost</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarClock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No contacted leads to follow up</p>
          <p className="text-xs mt-1">Mark a lead as &quot;contacted&quot; from My Leads to see it here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="bg-white border border-blue-100 rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                    {lead.name?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                    <div className="flex items-center flex-wrap gap-3 mt-1">
                      <a href={`tel:${lead.mobile}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        <Phone className="w-3 h-3" />{lead.mobile}
                      </a>
                      {lead.city && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="w-3 h-3" />{lead.city}
                        </span>
                      )}
                      {lead.vehicleName && <span className="text-xs text-gray-500">{lead.vehicleName}</span>}
                    </div>
                    {lead.notes && <p className="text-xs text-gray-400 mt-1 italic">&ldquo;{lead.notes}&rdquo;</p>}
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 shrink-0">
                  {new Date(lead.createdAt).toLocaleDateString("en-IN")}
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => updateStatus(lead.id, "converted")}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                  Mark Converted
                </button>
                <button onClick={() => updateStatus(lead.id, "lost")}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors">
                  Mark Lost
                </button>
                <button onClick={() => updateStatus(lead.id, "new")}
                  className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                  Reset to New
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
