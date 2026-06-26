"use client";
import { useState } from "react";
import { UserCheck } from "lucide-react";

interface Dealer { id: string; name: string }

interface Props {
  leadId:    string;
  currentId: string | null;
  dealers:   Dealer[];
}

export function LeadReassignSelect({ leadId, currentId, dealers }: Props) {
  const [value, setValue]     = useState(currentId ?? "");
  const [saving, setSaving]   = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const dealerId = e.target.value;
    setValue(dealerId);
    setSaving(true);
    try {
      await fetch(`/api/admin/leads/${leadId}`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ dealerId: dealerId || null }),
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <UserCheck className={`w-3 h-3 flex-shrink-0 ${saving ? "text-blue-400 animate-pulse" : "text-gray-300"}`} />
      <select
        value={value}
        onChange={handleChange}
        disabled={saving}
        className="text-[10px] text-gray-600 border border-gray-200 rounded-lg px-1.5 py-0.5 bg-white focus:outline-none focus:border-blue-400 max-w-[120px] truncate disabled:opacity-50"
      >
        <option value="">Unassigned</option>
        {dealers.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
    </div>
  );
}
