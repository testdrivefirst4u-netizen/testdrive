"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Plus, Trash2, Upload, Edit2, Eye, EyeOff, Loader2,
  ImageIcon, Monitor, Megaphone, ListFilter, LayoutGrid, Link2,
  Copy, X, Calendar, GripVertical, ZoomIn, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

/* ─────────────────────── Types ─────────────────────── */

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  fileId?: string | null;
  linkUrl?: string | null;
  linkLabel?: string | null;
  position: string;
  isActive: boolean;
  sortOrder: number;
  startsAt?: string | null;
  endsAt?: string | null;
}

type GroupId = "hero" | "promo" | "listing" | "other";

interface PositionDef { value: string; label: string; hint: string; dims: string }
interface GroupDef    { id: GroupId; label: string; Icon: React.ElementType; positions: PositionDef[] }

/* ─────────────────────── Config ─────────────────────── */

const GROUPS: GroupDef[] = [
  {
    id: "hero",
    label: "Hero Section",
    Icon: Monitor,
    positions: [
      { value: "hero",               label: "Hero Slider",            hint: "Main rotating banners at the top of the homepage",      dims: "1920 × 600 px" },
      { value: "hero_bg_car",        label: "Cars Slide Background",  hint: "Full-bleed image behind the Cars hero slide",            dims: "1920 × 1080 px" },
      { value: "hero_bg_bike",       label: "Bikes Slide Bg",         hint: "Full-bleed image behind the Bikes hero slide",           dims: "1920 × 1080 px" },
      { value: "hero_bg_ev",         label: "Electric Slide Bg",      hint: "Full-bleed image behind the Electric hero slide",        dims: "1920 × 1080 px" },
      { value: "hero_bg_commercial", label: "Commercial Slide Bg",    hint: "Full-bleed image behind the Commercial hero slide",      dims: "1920 × 1080 px" },
    ],
  },
  {
    id: "promo",
    label: "Promotional",
    Icon: Megaphone,
    positions: [
      { value: "promo", label: "Promo Strip", hint: "Horizontal strip below the category navigation", dims: "1200 × 120 px" },
    ],
  },
  {
    id: "listing",
    label: "Listing Pages",
    Icon: ListFilter,
    positions: [
      { value: "cars_top",  label: "Cars Page",  hint: "Top of /cars listing page",  dims: "1200 × 300 px" },
      { value: "bikes_top", label: "Bikes Page", hint: "Top of /bikes listing page", dims: "1200 × 300 px" },
      { value: "ev_top",    label: "EV Page",    hint: "Top of /ev listing page",    dims: "1200 × 300 px" },
    ],
  },
  {
    id: "other",
    label: "Other",
    Icon: LayoutGrid,
    positions: [
      { value: "sidebar", label: "Sidebar", hint: "Sidebar banner placement", dims: "300 × 600 px" },
    ],
  },
];

const ALL_POSITIONS = GROUPS.flatMap((g) => g.positions);
const POS_MAP       = Object.fromEntries(ALL_POSITIONS.map((p) => [p.value, p]));

const EMPTY: Omit<Banner, "id"> = {
  title: "", subtitle: "", imageUrl: "", fileId: "",
  linkUrl: "", linkLabel: "Learn More", position: "hero",
  isActive: true, sortOrder: 0, startsAt: null, endsAt: null,
};

function toLocalDT(iso: string | null | undefined) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

function scheduleBadge(b: Banner) {
  const now = Date.now();
  const starts = b.startsAt ? new Date(b.startsAt).getTime() : null;
  const ends   = b.endsAt   ? new Date(b.endsAt).getTime()   : null;
  if (starts && starts > now) return { label: "Scheduled", cls: "bg-amber-500" };
  if (ends   && ends   < now) return { label: "Expired",   cls: "bg-gray-500"  };
  return null;
}

/* ─────────────────────── Component ─────────────────────── */

export default function BannersPage() {
  const [banners,      setBanners]      = useState<Banner[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [activeGroup,  setActiveGroup]  = useState<GroupId>("hero");
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editing,      setEditing]      = useState<Banner | null>(null);
  const [form,         setForm]         = useState<Omit<Banner, "id">>(EMPTY);
  const [isDirty,      setIsDirty]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [uploading,    setUploading]    = useState(false);
  const [preview,      setPreview]      = useState<Banner | null>(null);
  const [draggedId,    setDraggedId]    = useState<string | null>(null);
  const [dragOverId,   setDragOverId]   = useState<string | null>(null);
  const reorderTimer                    = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Data ── */
  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/banners");
      const d = await r.json();
      setBanners(d.banners || []);
    } catch {
      toast.error("Failed to load banners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Keyboard shortcut: N = new banner ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || dialogOpen) return;
      if (e.key === "n" || e.key === "N") openNew();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogOpen]);

  /* ── Form helpers ── */
  function openNew(position?: string) {
    setEditing(null);
    setForm({ ...EMPTY, position: position ?? currentGroup.positions[0]?.value ?? "hero" });
    setIsDirty(false);
    setDialogOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({
      title: b.title, subtitle: b.subtitle || "", imageUrl: b.imageUrl,
      fileId: b.fileId || "", linkUrl: b.linkUrl || "", linkLabel: b.linkLabel || "",
      position: b.position, isActive: b.isActive, sortOrder: b.sortOrder,
      startsAt: toLocalDT(b.startsAt), endsAt: toLocalDT(b.endsAt),
    });
    setIsDirty(false);
    setDialogOpen(true);
  }

  function handleDialogClose(open: boolean) {
    if (!open && isDirty) {
      if (!confirm("You have unsaved changes. Discard them?")) return;
    }
    setDialogOpen(open);
    if (!open) setIsDirty(false);
  }

  const set = (k: string, v: unknown) => {
    setIsDirty(true);
    setForm((f) => ({ ...f, [k]: v }));
  };

  /* ── Upload ── */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: "banners" }),
        });
        const d = await res.json();
        if (d.url) {
          set("imageUrl", d.url);
          set("fileId", d.fileId || "");
          toast.success("Image uploaded");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading(false);
    }
  }

  /* ── Save ── */
  async function handleSave() {
    if (!form.title || !form.imageUrl) { toast.error("Title and image are required"); return; }
    setSaving(true);
    try {
      const url    = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
      const method = editing ? "PUT" : "POST";
      const payload = {
        ...form,
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : null,
        endsAt:   form.endsAt   ? new Date(form.endsAt).toISOString()   : null,
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      toast.success(editing ? "Banner updated!" : "Banner created!");
      setDialogOpen(false);
      setIsDirty(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* ── Toggle ── */
  async function handleToggle(b: Banner) {
    try {
      await fetch(`/api/admin/banners/${b.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...b, isActive: !b.isActive }),
      });
      setBanners((prev) => prev.map((x) => x.id === b.id ? { ...x, isActive: !b.isActive } : x));
    } catch {
      toast.error("Failed to toggle");
    }
  }

  /* ── Delete ── */
  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    try {
      await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      setBanners((prev) => prev.filter((b) => b.id !== id));
      toast.success("Banner deleted");
    } catch {
      toast.error("Delete failed");
    }
  }

  /* ── Duplicate ── */
  async function handleDuplicate(b: Banner) {
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Copy of ${b.title}`, subtitle: b.subtitle,
          imageUrl: b.imageUrl, fileId: b.fileId,
          linkUrl: b.linkUrl, linkLabel: b.linkLabel,
          position: b.position, isActive: false,
          sortOrder: b.sortOrder + 1,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Banner duplicated (set to inactive)");
      load();
    } catch {
      toast.error("Failed to duplicate");
    }
  }

  /* ── Drag-to-reorder ── */
  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  }

  async function handleDrop(e: React.DragEvent, targetId: string, position: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }

    const items   = banners.filter((b) => b.position === position);
    const fromIdx = items.findIndex((b) => b.id === draggedId);
    const toIdx   = items.findIndex((b) => b.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...items];
    const [moved]   = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updates   = reordered.map((b, i) => ({ id: b.id, sortOrder: i }));

    // Optimistic update
    setBanners((prev) => prev.map((b) => {
      const u = updates.find((x) => x.id === b.id);
      return u ? { ...b, sortOrder: u.sortOrder } : b;
    }));

    setDraggedId(null);
    setDragOverId(null);

    // Debounce API call
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/admin/banners/reorder", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates }),
        });
      } catch {
        toast.error("Reorder failed");
        load();
      }
    }, 400);
  }

  /* ── Derived ── */
  const grouped      = Object.fromEntries(
    ALL_POSITIONS.map((p) => [
      p.value,
      banners.filter((b) => b.position === p.value).sort((a, b) => a.sortOrder - b.sortOrder),
    ])
  );
  const totalActive   = banners.filter((b) => b.isActive).length;
  const totalInactive = banners.length - totalActive;
  const currentGroup  = GROUPS.find((g) => g.id === activeGroup)!;
  const posDims       = POS_MAP[form.position]?.dims ?? "1920 × 600 px";

  /* ─────────────────────── Render ─────────────────────── */
  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Control images &amp; banners across all placements
            <kbd className="ml-2 text-[10px] bg-gray-100 border border-gray-200 text-gray-400 px-1.5 py-0.5 rounded font-mono">N</kbd>
            <span className="text-[10px] text-gray-400 ml-1">new banner</span>
          </p>
        </div>
        <Button onClick={() => openNew()} className="bg-red-600 hover:bg-red-700 gap-2 shrink-0 h-10">
          <Plus className="w-4 h-4" /> Add Banner
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{banners.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">banners</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Active</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{totalActive}</p>
          <p className="text-xs text-emerald-400 mt-0.5">live now</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive</p>
          <p className="text-3xl font-extrabold text-gray-400 mt-1">{totalInactive}</p>
          <p className="text-xs text-gray-400 mt-0.5">paused</p>
        </div>
      </div>

      {/* ── Group Tabs ── */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
        {GROUPS.map((g) => {
          const count  = g.positions.reduce((s, p) => s + (grouped[p.value]?.length ?? 0), 0);
          const active = activeGroup === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActiveGroup(g.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                active ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <g.Icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-red-500" : "text-gray-400"}`} />
              <span className="hidden sm:inline">{g.label}</span>
              {count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none ${
                  active ? "bg-red-100 text-red-600" : "bg-gray-200 text-gray-500"
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Empty state (zero banners total) ── */}
      {!loading && banners.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-5 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-9 h-9 text-gray-300" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900">No banners yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Add your first banner to start promoting content across the site
            </p>
          </div>
          <Button onClick={() => openNew()} className="bg-red-600 hover:bg-red-700 gap-2">
            <Plus className="w-4 h-4" /> Create First Banner
          </Button>
        </div>
      )}

      {/* ── Position sections ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading banners…
        </div>
      ) : banners.length > 0 && (
        <div className="space-y-10">
          {currentGroup.positions.map((pos) => {
            const items = grouped[pos.value] ?? [];
            return (
              <div key={pos.value}>

                {/* Position header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base font-bold text-gray-900">{pos.label}</h2>
                      <code className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-mono border border-gray-200">
                        {pos.value}
                      </code>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        items.length > 0 ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
                      }`}>
                        {items.length} banner{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {pos.hint} · <span className="font-semibold text-gray-500">{pos.dims}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => openNew(pos.value)}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((b) => {
                    const sched = scheduleBadge(b);
                    const isDragging = draggedId === b.id;
                    const isDragTarget = dragOverId === b.id && draggedId !== b.id;
                    return (
                      <div
                        key={b.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, b.id)}
                        onDragOver={(e) => handleDragOver(e, b.id)}
                        onDrop={(e) => handleDrop(e, b.id, b.position)}
                        onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                        className={`group relative rounded-2xl overflow-hidden border bg-white shadow-sm transition-all duration-150 ${
                          isDragging    ? "opacity-40 scale-95 shadow-none"    : ""
                        } ${
                          isDragTarget  ? "ring-2 ring-red-400 shadow-lg scale-[1.02]" : ""
                        } ${
                          !isDragging && !isDragTarget ? "hover:shadow-lg" : ""
                        } ${
                          !b.isActive ? "border-gray-100 opacity-60" : "border-gray-200"
                        }`}
                      >
                        {/* Image */}
                        <div className="relative aspect-video bg-gray-100">
                          <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                          {/* Drag handle */}
                          <div className="absolute top-2.5 left-2.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                            <div className="bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                              <GripVertical className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>

                          {/* Status + schedule pills */}
                          <div className="absolute top-2.5 left-10 flex gap-1.5">
                            {b.isActive ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                                Paused
                              </span>
                            )}
                            {sched && (
                              <span className={`inline-flex items-center gap-1 ${sched.cls} text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow`}>
                                <Clock className="w-2.5 h-2.5" /> {sched.label}
                              </span>
                            )}
                          </div>

                          {/* Sort order */}
                          <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                            #{b.sortOrder}
                          </div>

                          {/* Title overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-3">
                            <p className="text-white font-bold text-sm leading-tight line-clamp-1">{b.title}</p>
                            {b.subtitle && <p className="text-white/70 text-xs mt-0.5 line-clamp-1">{b.subtitle}</p>}
                          </div>

                          {/* Hover actions overlay */}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => setPreview(b)}
                              className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-xl transition-all shadow"
                              title="Full preview"
                            >
                              <ZoomIn className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggle(b)}
                              className="bg-white/90 hover:bg-white text-gray-800 p-2.5 rounded-xl transition-all shadow"
                              title={b.isActive ? "Pause" : "Activate"}
                            >
                              {b.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openEdit(b)}
                              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition-all shadow"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(b)}
                              className="bg-violet-600 hover:bg-violet-700 text-white p-2.5 rounded-xl transition-all shadow"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-xl transition-all shadow"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="px-3 py-2.5 flex items-center justify-between gap-2 border-t border-gray-100">
                          <div className="min-w-0">
                            {b.linkUrl ? (
                              <a
                                href={b.linkUrl} target="_blank" rel="noopener"
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 truncate"
                              >
                                <Link2 className="w-3 h-3 shrink-0" />
                                <span className="truncate">{b.linkLabel || b.linkUrl}</span>
                              </a>
                            ) : (
                              <span className="text-xs text-gray-300 italic">No link</span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={() => setPreview(b)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center" title="Preview">
                              <ZoomIn className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                            <button onClick={() => handleToggle(b)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                              {b.isActive ? <EyeOff className="w-3.5 h-3.5 text-gray-400" /> : <Eye className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                            <button onClick={() => openEdit(b)} className="w-7 h-7 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                              <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                            </button>
                            <button onClick={() => handleDuplicate(b)} className="w-7 h-7 rounded-lg hover:bg-violet-50 flex items-center justify-center">
                              <Copy className="w-3.5 h-3.5 text-violet-500" />
                            </button>
                            <button onClick={() => handleDelete(b.id)} className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add new card */}
                  <button
                    onClick={() => openNew(pos.value)}
                    className="min-h-[160px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50/30 transition-all group/add"
                  >
                    <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover/add:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold">Add Banner</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Preview lightbox ── */}
      {preview && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setPreview(null)}
        >
          <button
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-xl p-2 transition-all"
            onClick={() => setPreview(null)}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video bg-gray-900">
              <Image src={preview.imageUrl} alt={preview.title} fill className="object-contain" />
            </div>
            <div className="bg-gray-900 px-5 py-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold text-sm">{preview.title}</p>
                {preview.subtitle && <p className="text-white/50 text-xs mt-0.5">{preview.subtitle}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <code className="text-[10px] bg-white/10 text-white/60 px-2 py-1 rounded-lg font-mono">
                  {POS_MAP[preview.position]?.label ?? preview.position}
                </code>
                <button
                  onClick={() => { setPreview(null); openEdit(preview); }}
                  className="flex items-center gap-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-all"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>
          </div>
          <p className="text-white/30 text-xs mt-4">Click outside to close</p>
        </div>
      )}

      {/* ── Edit / New Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">

          {/* Sticky header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {editing ? "Edit Banner" : "New Banner"}
                {isDirty && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                    Unsaved
                  </span>
                )}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                {editing ? "Update banner details and image" : "Upload an image and configure placement"}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-6">

            {/* Placement */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Placement</Label>
              <Select value={form.position} onValueChange={(v) => set("position", v)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <div key={g.id}>
                      <div className="px-2 pt-2 pb-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {g.label}
                      </div>
                      {g.positions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="font-semibold">{p.label}</span>
                          <code className="ml-2 text-[10px] text-gray-400 font-mono">{p.dims}</code>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {form.position && (
                <p className="text-xs text-gray-400">
                  {POS_MAP[form.position]?.hint} ·{" "}
                  <span className="font-semibold text-gray-500">Recommended: {posDims}</span>
                </p>
              )}
            </div>

            {/* Image upload */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Image * <span className="normal-case font-normal text-gray-400">— {posDims}</span>
              </Label>
              {form.imageUrl ? (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 group">
                  <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-800 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-lg">
                      <Upload className="w-4 h-4" /> Replace Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                      <p className="text-white text-sm font-semibold">Uploading…</p>
                    </div>
                  )}
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-12 cursor-pointer transition-all ${
                  uploading ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-red-300 hover:bg-red-50/30"
                }`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <span className="text-sm font-semibold text-blue-600">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-700">Click to upload image</p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP · Recommended: {posDims}</p>
                      </div>
                      <span className="text-xs font-semibold text-red-500 border border-red-200 px-3 py-1 rounded-lg">
                        Browse files
                      </span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
              <Input
                placeholder="Or paste image URL…"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                className="font-mono text-sm text-gray-600 h-9"
              />
            </div>

            {/* Title & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Title *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Explore the New Nexon EV" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Subtitle</Label>
                <Input value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Starting at ₹14.49 Lakh" className="h-10" />
              </div>
            </div>

            {/* Link */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Link URL</Label>
                <Input value={form.linkUrl || ""} onChange={(e) => set("linkUrl", e.target.value)} placeholder="/cars/tata/nexon-ev" className="h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Link Label</Label>
                <Input value={form.linkLabel || ""} onChange={(e) => set("linkLabel", e.target.value)} placeholder="Learn More" className="h-10" />
              </div>
            </div>

            {/* Schedule */}
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <p className="text-sm font-bold text-amber-800">Schedule (optional)</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Go Live</Label>
                  <Input
                    type="datetime-local"
                    value={form.startsAt || ""}
                    onChange={(e) => set("startsAt", e.target.value || null)}
                    className="h-10 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Expire</Label>
                  <Input
                    type="datetime-local"
                    value={form.endsAt || ""}
                    onChange={(e) => set("endsAt", e.target.value || null)}
                    className="h-10 text-sm"
                  />
                </div>
              </div>
              <p className="text-[11px] text-amber-600">Leave blank for no scheduling. Banner must also be Active.</p>
            </div>

            {/* Sort & Active */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
                  className="w-24 h-10 text-center font-bold"
                />
              </div>
              <div className="h-10 w-px bg-gray-200 self-end mb-0.5" />
              <div className="flex items-center gap-3 flex-1">
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                <div>
                  <p className={`text-sm font-bold ${form.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                    {form.isActive ? "Active — visible on site" : "Inactive — hidden from site"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Toggle to show or hide</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center sticky bottom-0 bg-white">
            <p className="text-xs text-gray-400">
              {isDirty ? "You have unsaved changes" : editing ? "No changes yet" : ""}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDialogClose(false)} className="h-10">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || uploading}
                className="bg-red-600 hover:bg-red-700 gap-2 h-10 px-6"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editing ? "Update Banner" : "Create Banner"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
