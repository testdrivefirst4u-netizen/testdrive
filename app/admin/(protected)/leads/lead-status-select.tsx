"use client";

import { useState, useTransition } from "react";

const STATUSES = ["new", "contacted", "converted", "lost"];

export function LeadStatusSelect({
  leadId,
  current,
  colors,
}: {
  leadId: string;
  current: string;
  colors: Record<string, string>;
}) {
  const [status, setStatus] = useState(current);
  const [isPending, startTransition] = useTransition();

  async function onChange(next: string) {
    setStatus(next);
    startTransition(async () => {
      await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
    });
  }

  const colorClass = colors[status] ?? "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      disabled={isPending}
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer outline-none capitalize transition-all disabled:opacity-60 ${colorClass}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="text-gray-800 font-semibold bg-white">
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  );
}
