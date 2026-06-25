"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  id: string;
  name: string;
  callerRole: string;
  targetRole: string;
}

export function UserDeleteButton({ id, name, callerRole, targetRole }: Props) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // ADMIN can only be deleted by SUPER_ADMIN
  if (targetRole === "ADMIN" && callerRole !== "SUPER_ADMIN") return null;

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-[9px] text-red-500 font-bold hidden sm:inline">Delete?</span>
      <button
        disabled={loading}
        onClick={async () => {
          setLoading(true);
          await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
          window.location.reload();
        }}
        className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded hover:bg-red-600 transition-colors disabled:opacity-50">
        {loading ? "..." : "Yes"}
      </button>
      <button
        onClick={() => setConfirm(false)}
        className="text-[9px] font-bold bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded hover:bg-gray-300 transition-colors">
        No
      </button>
    </div>
  );
}
