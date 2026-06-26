"use client";
import { useState, useTransition } from "react";
import { Search, Trash2, UserCheck, UserX, Mail } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  status: string;
  tags: string[];
  subscribedAt: string;
}

export default function NewsletterClient({ subscribers: initial }: { subscribers: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initial);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "unsubscribed">("all");
  const [isPending, startTransition] = useTransition();

  const filtered = subscribers.filter((s) => {
    const matchSearch =
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || s.status === filter;
    return matchSearch && matchFilter;
  });

  async function handleStatus(id: string, newStatus: string) {
    startTransition(async () => {
      await fetch(`/api/admin/newsletter/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
      );
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this subscriber?")) return;
    startTransition(async () => {
      await fetch(`/api/admin/newsletter/${id}`, { method: "DELETE" });
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    });
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-100">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(["all", "active", "unsubscribed"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              {f}
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400">{filtered.length} subscribers</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Name</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Source</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-bold text-gray-500">Subscribed</th>
              <th className="text-right px-4 py-3 text-xs font-bold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  <Mail className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                  No subscribers found
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 text-xs">{s.email}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{s.name ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs capitalize">{s.source ?? "website"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${
                      s.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(s.subscribedAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {s.status === "active" ? (
                        <button
                          onClick={() => handleStatus(s.id, "unsubscribed")}
                          title="Unsubscribe"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <UserX className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatus(s.id, "active")}
                          title="Reactivate"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(s.id)}
                        title="Delete"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
