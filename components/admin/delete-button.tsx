"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  apiPath: string;
  label?: string;
  onDeleted?: () => void;
}

export function DeleteButton({ id, apiPath, label = "item", onDeleted }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`${apiPath}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${label} deleted`);
      if (onDeleted) onDeleted();
      else router.refresh();
    } catch {
      toast.error(`Failed to delete ${label}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {label}?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this {label}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
