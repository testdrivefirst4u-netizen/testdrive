"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Trash2, Upload, Edit2, Eye, EyeOff, Loader2,
  ImageIcon, X, GripVertical, RefreshCw, BookImage,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

/* ─────────────────────── Types ─────────────────────── */

interface Story {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  link?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

const EMPTY_FORM: Omit<Story, "id" | "createdAt"> = {
  title: "",
  imageUrl: "",
  category: "",
  link: "",
  isActive: true,
  sortOrder: 0,
};

/* ─────────────────────── Component ─────────────────────── */

export default function VisualStoriesAdminPage() {
  const [stories,     setStories]     = useState<Story[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editing,     setEditing]     = useState<Story | null>(null);
  const [form,        setForm]        = useState<Omit<Story, "id" | "createdAt">>(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [search,      setSearch]      = useState("");
  const [draggedId,   setDraggedId]   = useState<string | null>(null);
  const [dragOverId,  setDragOverId]  = useState<string | null>(null);
  const reorderTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/visual-stories");
      const d = await r.json();
      setStories(Array.isArray(d) ? d : []);
    } catch {
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* ── Form helpers ── */
  function openNew() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, sortOrder: stories.length });
    setDialogOpen(true);
  }

  function openEdit(s: Story) {
    setEditing(s);
    setForm({
      title: s.title,
      imageUrl: s.imageUrl,
      category: s.category,
      link: s.link || "",
      isActive: s.isActive,
      sortOrder: s.sortOrder,
    });
    setDialogOpen(true);
  }

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

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
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: "visual-stories" }),
        });
        const d = await res.json();
        if (d.url) {
          set("imageUrl", d.url);
          toast.success("Image uploaded");
        } else {
          toast.error(d.error || "Upload failed");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading(false);
    }
    // reset input so same file can be re-selected
    e.target.value = "";
  }

  /* ── Save (create / update) ── */
  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.imageUrl.trim()) { toast.error("Image URL is required"); return; }
    setSaving(true);
    try {
      const url    = editing ? `/api/admin/visual-stories/${editing.id}` : "/api/admin/visual-stories";
      const method = editing ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, link: form.link || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Save failed");
      }
      toast.success(editing ? "Story updated!" : "Story created!");
      setDialogOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  /* ── Toggle active ── */
  async function handleToggle(s: Story) {
    try {
      const res = await fetch(`/api/admin/visual-stories/${s.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !s.isActive }),
      });
      if (!res.ok) throw new Error();
      setStories((prev) => prev.map((x) => x.id === s.id ? { ...x, isActive: !s.isActive } : x));
    } catch {
      toast.error("Failed to toggle");
    }
  }

  /* ── Delete ── */
  async function handleDelete(id: string) {
    if (!confirm("Delete this story?")) return;
    try {
      const res = await fetch(`/api/admin/visual-stories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setStories((prev) => prev.filter((s) => s.id !== id));
      toast.success("Story deleted");
    } catch {
      toast.error("Delete failed");
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

  async function handleDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }

    const fromIdx = stories.findIndex((s) => s.id === draggedId);
    const toIdx   = stories.findIndex((s) => s.id === targetId);
    if (fromIdx === -1 || toIdx === -1) return;

    const reordered = [...stories];
    const [moved]   = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const withOrder = reordered.map((s, i) => ({ ...s, sortOrder: i }));

    setStories(withOrder);
    setDraggedId(null);
    setDragOverId(null);

    // Persist new order via individual PUT calls (debounced)
    if (reorderTimer.current) clearTimeout(reorderTimer.current);
    reorderTimer.current = setTimeout(async () => {
      try {
        await Promise.all(
          withOrder.map((s) =>
            fetch(`/api/admin/visual-stories/${s.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sortOrder: s.sortOrder }),
            })
          )
        );
        toast.success("Order saved");
      } catch {
        toast.error("Reorder save failed");
        load();
      }
    }, 500);
  }

  /* ── Derived ── */
  const q        = search.toLowerCase();
  const filtered = stories.filter(
    (s) => !q || s.title.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  );
  const activeCount   = stories.filter((s) => s.isActive).length;
  const inactiveCount = stories.length - activeCount;

  /* ─────────────────────── Render ─────────────────────── */
  return (
    <div className="space-y-6 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visual Stories</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage story cards displayed on the public Visual Stories page
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5 h-9">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button onClick={openNew} className="bg-red-600 hover:bg-red-700 gap-2 h-9">
            <Plus className="w-4 h-4" /> Add Story
          </Button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">{stories.length}</p>
          <p className="text-xs text-gray-400 mt-0.5">stories</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Active</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{activeCount}</p>
          <p className="text-xs text-emerald-400 mt-0.5">visible</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inactive</p>
          <p className="text-3xl font-extrabold text-gray-400 mt-1">{inactiveCount}</p>
          <p className="text-xs text-gray-400 mt-0.5">hidden</p>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative max-w-sm">
        <Input
          placeholder="Search by title or category…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-sm pr-8"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading stories…
        </div>
      ) : stories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-5 border-2 border-dashed border-gray-200 rounded-3xl">
          <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
            <BookImage className="w-9 h-9 text-gray-300" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900">No stories yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-xs">
              Add your first visual story to display it on the public page.
            </p>
          </div>
          <Button onClick={openNew} className="bg-red-600 hover:bg-red-700 gap-2">
            <Plus className="w-4 h-4" /> Create First Story
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-xs text-gray-400 mb-3">
            Drag rows to reorder. Changes are saved automatically.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((s) => {
              const isDragging   = draggedId === s.id;
              const isDragTarget = dragOverId === s.id && draggedId !== s.id;
              return (
                <div
                  key={s.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, s.id)}
                  onDragOver={(e) => handleDragOver(e, s.id)}
                  onDrop={(e) => handleDrop(e, s.id)}
                  onDragEnd={() => { setDraggedId(null); setDragOverId(null); }}
                  className={`group relative rounded-2xl overflow-hidden border bg-white shadow-sm transition-all duration-150 cursor-grab active:cursor-grabbing ${
                    isDragging    ? "opacity-40 scale-95 shadow-none" : ""
                  } ${
                    isDragTarget  ? "ring-2 ring-red-400 shadow-lg scale-[1.02]" : ""
                  } ${
                    !isDragging && !isDragTarget ? "hover:shadow-lg" : ""
                  } ${
                    !s.isActive ? "opacity-60" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] bg-gray-100">
                    {s.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.imageUrl}
                        alt={s.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                    {/* Drag handle */}
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                        <GripVertical className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>

                    {/* Active badge */}
                    <div className="absolute top-2 right-2">
                      {s.isActive ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          <span className="w-1.5 h-1.5 bg-white rounded-full" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex bg-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
                          Off
                        </span>
                      )}
                    </div>

                    {/* Category */}
                    {s.category && (
                      <div className="absolute top-7 right-2 mt-1">
                        <span className="text-[9px] font-bold bg-blue-500/90 text-white px-1.5 py-0.5 rounded-full">
                          {s.category}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-white font-bold text-xs leading-tight line-clamp-2">{s.title}</p>
                    </div>

                    {/* Hover actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggle(s)}
                        className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-xl transition-all shadow"
                        title={s.isActive ? "Deactivate" : "Activate"}
                      >
                        {s.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all shadow"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl transition-all shadow"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-2.5 py-2 flex items-center justify-between border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 font-semibold">#{s.sortOrder}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => handleToggle(s)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100"
                      >
                        {s.isActive ? <EyeOff className="w-3 h-3 text-gray-400" /> : <Eye className="w-3 h-3 text-gray-400" />}
                      </button>
                      <button
                        onClick={() => openEdit(s)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-blue-50"
                      >
                        <Edit2 className="w-3 h-3 text-blue-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add new card */}
            <button
              onClick={openNew}
              className="min-h-[200px] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50/30 transition-all group/add"
            >
              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-current flex items-center justify-center group-hover/add:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold">Add Story</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Edit / New Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">

          <div className="px-6 pt-6 pb-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                {editing ? "Edit Story" : "New Visual Story"}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-0.5">
                {editing ? "Update story details" : "Fill in the details for the new story"}
              </p>
            </DialogHeader>
          </div>

          <div className="px-6 py-5 space-y-5">

            {/* Image */}
            <div className="space-y-2">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Thumbnail Image *
              </Label>
              {form.imageUrl ? (
                <div className="relative aspect-[3/4] max-h-64 rounded-2xl overflow-hidden bg-gray-100 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer bg-white text-gray-800 font-bold text-sm px-4 py-2 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-lg">
                      <Upload className="w-4 h-4" /> Replace
                      <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                    </label>
                  </div>
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl py-10 cursor-pointer transition-all ${
                  uploading ? "border-blue-300 bg-blue-50" : "border-gray-200 hover:border-red-300 hover:bg-red-50/20"
                }`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                      <span className="text-sm font-semibold text-blue-600">Uploading…</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                      <span className="text-sm font-bold text-gray-600">Click to upload</span>
                      <span className="text-xs text-gray-400">PNG, JPG, WebP</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
                </label>
              )}
              <Input
                placeholder="Or paste image URL…"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
                className="text-sm h-9 font-mono"
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. BYD Seagull Electric Hatchback"
                className="h-10"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Category</Label>
              <Input
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="e.g. Electric, SUV, News"
                className="h-10"
              />
            </div>

            {/* Link */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                Link URL <span className="font-normal text-gray-400 normal-case">(optional)</span>
              </Label>
              <Input
                value={form.link || ""}
                onChange={(e) => set("link", e.target.value)}
                placeholder="/visual-stories/byd-seagull"
                className="h-10"
              />
            </div>

            {/* Sort order + Active */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Sort Order</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
                  className="w-24 h-10 text-center font-bold"
                  min={0}
                />
              </div>
              <div className="h-10 w-px bg-gray-200 self-end mb-0.5" />
              <div className="flex items-center gap-3 flex-1">
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                <div>
                  <p className={`text-sm font-bold ${form.isActive ? "text-emerald-600" : "text-gray-400"}`}>
                    {form.isActive ? "Active — visible on site" : "Inactive — hidden"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2 sticky bottom-0 bg-white">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-10">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading}
              className="bg-red-600 hover:bg-red-700 gap-2 h-10 px-6"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
