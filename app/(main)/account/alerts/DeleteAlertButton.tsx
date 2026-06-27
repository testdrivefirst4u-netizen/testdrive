"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteAlertButton({ vehicleId }: { vehicleId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      await fetch("/api/account/alerts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-3 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5"
      onClick={handleDelete}
      disabled={loading}
    >
      <Trash2 className="w-3.5 h-3.5" />
      {loading ? "Deleting…" : "Delete Alert"}
    </Button>
  );
}
