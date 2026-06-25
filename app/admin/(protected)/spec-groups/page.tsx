"use client";

import { useState, useEffect, type ReactNode } from "react";
import {
  Plus, Pencil, Trash2, X, Save, Loader2, Zap, ChevronDown, ChevronRight,
} from "lucide-react";

type SpecItem = {
  id: string; name: string; slug: string;
  unit?: string | null; description?: string | null; sortOrder: number;
};

type SpecGroup = {
  id: string; name: string; slug: string; icon?: string | null;
  sortOrder: number; specItems: SpecItem[];
  _count?: { specItems: number };
};

const EMPTY_GROUP: Partial<SpecGroup> = { name: "", icon: "", sortOrder: 0 };
const EMPTY_ITEM: Partial<SpecItem>   = { name: "", unit: "", description: "", sortOrder: 0 };

export default function SpecGroupsPage() {
  const [groups, setGroups]       = useState<SpecGroup[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expanded, setExpanded]   = useState<Set<string>>(new Set());

  // Group panel
  const [gPanel, setGPanel]       = useState<"add" | SpecGroup | null>(null);
  const [gForm, setGForm]         = useState<Partial<SpecGroup>>(EMPTY_GROUP);
  const [gSaving, setGSaving]     = useState(false);
  const [gError, setGError]       = useState<string | null>(null);

  // Item inline add
  const [iPanel, setIPanel]       = useState<string | null>(null); // groupId
  const [iForm, setIForm]         = useState<Partial<SpecItem>>(EMPTY_ITEM);
  const [iEditId, setIEditId]     = useState<string | null>(null);
  const [iSaving, setISaving]     = useState(false);
  const [iError, setIError]       = useState<string | null>(null);

  const [deleting, setDeleting]   = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/admin/spec-groups");
    setGroups(await r.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  // Group save
  async function saveGroup() {
    setGSaving(true); setGError(null);
    try {
      const isEdit = gPanel !== "add";
      const url    = isEdit ? `/api/admin/spec-groups/${(gPanel as SpecGroup).id}` : "/api/admin/spec-groups";
      const res    = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gForm),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      await load();
      setGPanel(null);
    } catch (e: any) { setGError(e.message); }
    finally { setGSaving(false); }
  }

  async function deleteGroup(id: string) {
    if (!confirm("Delete this spec group and all its items?")) return;
    setDeleting(id);
    await fetch(`/api/admin/spec-groups/${id}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  // Item save
  async function saveItem(groupId: string) {
    setISaving(true); setIError(null);
    try {
      const isEdit = !!iEditId;
      const url    = isEdit
        ? `/api/admin/spec-groups/${groupId}/items/${iEditId}`
        : `/api/admin/spec-groups/${groupId}/items`;
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(iForm),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      await load();
      setIPanel(null); setIEditId(null); setIForm(EMPTY_ITEM);
    } catch (e: any) { setIError(e.message); }
    finally { setISaving(false); }
  }

  async function deleteItem(groupId: string, itemId: string) {
    if (!confirm("Delete this spec item?")) return;
    setDeleting(itemId);
    await fetch(`/api/admin/spec-groups/${groupId}/items/${itemId}`, { method: "DELETE" });
    await load();
    setDeleting(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Spec Groups</h1>
          <p className="text-gray-500 text-sm mt-0.5">{groups.length} groups · {groups.reduce((s, g) => s + g.specItems.length, 0)} spec items</p>
        </div>
        <button onClick={() => { setGForm(EMPTY_GROUP); setGPanel("add"); setGError(null); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors">
          <Plus className="w-4 h-4" /> Add Group
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-400">Loading…</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="py-16 text-center">
            <Zap className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No spec groups yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {groups.map(g => {
              const isOpen = expanded.has(g.id);
              return (
                <div key={g.id}>
                  {/* Group row */}
                  <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <button onClick={() => toggleExpand(g.id)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                      {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-base shrink-0">
                      {g.icon || <Zap className="w-4 h-4 text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{g.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">/{g.slug} · {g.specItems.length} items</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setGForm({ ...g }); setGPanel(g); setGError(null); }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteGroup(g.id)} disabled={deleting === g.id}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                        {deleting === g.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded spec items */}
                  {isOpen && (
                    <div className="bg-slate-50/60 border-t border-gray-50 px-5 py-3">
                      <div className="ml-7 space-y-1">
                        {g.specItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2 border border-gray-100 group">
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-semibold text-gray-700">{item.name}</span>
                              {item.unit && <span className="text-[10px] text-gray-400 ml-1.5 bg-gray-100 px-1.5 py-0.5 rounded">{item.unit}</span>}
                              {item.description && <p className="text-[10px] text-gray-400 mt-0.5">{item.description}</p>}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {
                                setIEditId(item.id); setIForm({ ...item });
                                setIPanel(g.id); setIError(null);
                              }} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                                <Pencil className="w-3 h-3" />
                              </button>
                              <button onClick={() => deleteItem(g.id, item.id)} disabled={deleting === item.id}
                                className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                                {deleting === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        ))}

                        {/* Inline add / edit item */}
                        {iPanel === g.id ? (
                          <div className="bg-white rounded-xl border border-blue-200 p-3 space-y-2">
                            {iError && <p className="text-xs text-red-500">{iError}</p>}
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Name *</label>
                                <input value={iForm.name || ""} onChange={e => setIForm(p => ({ ...p, name: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                                  placeholder="e.g. Engine Displacement" autoFocus />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-gray-500 block mb-1">Unit</label>
                                <input value={iForm.unit || ""} onChange={e => setIForm(p => ({ ...p, unit: e.target.value }))}
                                  className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                                  placeholder="cc, km/l, bhp…" />
                              </div>
                            </div>
                            <input value={iForm.description || ""} onChange={e => setIForm(p => ({ ...p, description: e.target.value }))}
                              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400"
                              placeholder="Description (optional)" />
                            <div className="flex gap-2">
                              <button onClick={() => saveItem(g.id)} disabled={iSaving || !iForm.name}
                                className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg px-3 py-1.5 hover:bg-blue-700 disabled:opacity-60">
                                {iSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                {iSaving ? "Saving…" : iEditId ? "Update" : "Add Item"}
                              </button>
                              <button onClick={() => { setIPanel(null); setIEditId(null); setIForm(EMPTY_ITEM); }}
                                className="text-xs text-gray-500 hover:text-gray-700 px-2">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => { setIPanel(g.id); setIEditId(null); setIForm(EMPTY_ITEM); setIError(null); }}
                            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold py-1 hover:underline">
                            <Plus className="w-3 h-3" /> Add spec item
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Group slide panel */}
      {gPanel !== null && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !gSaving && setGPanel(null)} />
          <div className="relative z-10 w-full max-w-sm bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-slate-50/80">
              <h2 className="text-sm font-bold text-gray-900">{gPanel === "add" ? "Add Spec Group" : `Edit: ${(gPanel as SpecGroup).name}`}</h2>
              <button onClick={() => !gSaving && setGPanel(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {gError && <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs text-red-600">{gError}</div>}
            <div className="flex-1 p-5 space-y-4">
              <F label="Group Name *">
                <input value={gForm.name || ""} onChange={e => setGForm(p => ({ ...p, name: e.target.value }))}
                  className="inp" placeholder="e.g. Engine, Safety, Dimensions" />
              </F>
              <F label="Icon (emoji)">
                <input value={gForm.icon || ""} onChange={e => setGForm(p => ({ ...p, icon: e.target.value }))}
                  className="inp" placeholder="⚙️" />
              </F>
              <F label="Sort Order">
                <input type="number" value={gForm.sortOrder ?? 0} onChange={e => setGForm(p => ({ ...p, sortOrder: +e.target.value }))}
                  className="inp" min={0} />
              </F>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/80 flex gap-3">
              <button onClick={saveGroup} disabled={gSaving || !gForm.name}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60">
                {gSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {gSaving ? "Saving…" : "Save Group"}
              </button>
              <button onClick={() => !gSaving && setGPanel(null)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
      <style>{`.inp{width:100%;border:1px solid #e5e7eb;border-radius:0.75rem;padding:0.5rem 0.75rem;font-size:0.875rem;outline:none}.inp:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}`}</style>
    </div>
  );
}

function F({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-gray-700 block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
