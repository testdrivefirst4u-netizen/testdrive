"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface Props {
  source?: string;
  status?: string;
}

export function LeadExportButton({ source, status }: Props) {
  const [loading, setLoading] = useState(false);

  async function exportCsv() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "10000" });
      if (source) params.set("source", source);
      if (status) params.set("status", status);

      const res  = await fetch(`/api/admin/leads/export?${params}`);
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Export failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={exportCsv}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-60"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      Export CSV
    </button>
  );
}
