"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Plus, Trash2, Upload, Edit2, GripVertical, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

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
}

const POSITIONS = [
  { value: "hero", label: "Hero (Homepage Main Banner)" },
  { value: "promo", label: "Promo Strip (Below Hero)" },
  { value: "sidebar", label: "Sidebar" },
  { value: "cars_top", label: "Cars Page Top" },
  { value: "bikes_top", label: "Bikes Page Top" },
  { value: "ev_top", label: "EV Page Top" },
];

const EMPTY: Omit<Banner, "id"> = {
  title: "",
  subtitle: "",
  imageUrl: "",
  fileId: "",
  linkUrl: "",
  linkLabel: "Learn More",
  position: "hero",
  isActive: true,
  sortOrder: 0,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<Omit<Banner, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  }

  function openEdit(b: Banner) {
    setEditing(b);
    setForm({ title: b.title, subtitle: b.subtitle || "", imageUrl: b.imageUrl, fileId: b.fileId || "", linkUrl: b.linkUrl || "", linkLabel: b.linkLabel || "", position: b.position, isActive: b.isActive, sortOrder: b.sortOrder });
    setDialogOpen(true);
  }

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

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

  async function handleSave() {
    if (!form.title || !form.imageUrl) {
      toast.error("Title and image are required");
      return;
    }
    setSaving(true);
    try {
      const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(editing ? "Banner updated!" : "Banner created!");
      setDialogOpen(false);
      load();
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }

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

  const grouped = POSITIONS.reduce((acc, pos) => {
    acc[pos.value] = banners.filter((b) => b.position === pos.value);
    return acc;
  }, {} as Record<string, Banner[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Banner Management</h1>
          <p className="text-gray-500 text-sm mt-1">Control hero banners and promotional images across the site</p>
        </div>
        <Button onClick={openNew} className="bg-red-600 hover:bg-red-700">
          <Plus className="w-4 h-4 mr-2" /> Add Banner
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading banners...
        </div>
      ) : (
        <div className="space-y-8">
          {POSITIONS.map((pos) => (
            <div key={pos.value}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{pos.label}</h2>
              {grouped[pos.value]?.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center text-gray-400 text-sm">
                    No banners for this position.{" "}
                    <button className="text-red-600 underline" onClick={() => { set("position", pos.value); setEditing(null); setForm({ ...EMPTY, position: pos.value }); setDialogOpen(true); }}>
                      Add one
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[pos.value].map((b) => (
                    <Card key={b.id} className={`overflow-hidden ${!b.isActive ? "opacity-50" : ""}`}>
                      <div className="relative h-40 bg-gray-100">
                        <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-2 left-3 text-white">
                          <p className="font-semibold text-sm">{b.title}</p>
                          {b.subtitle && <p className="text-xs text-white/80">{b.subtitle}</p>}
                        </div>
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge variant={b.isActive ? "default" : "secondary"} className="text-xs">
                            {b.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-3 flex items-center justify-between gap-2">
                        <div className="text-xs text-gray-500 truncate">
                          {b.linkUrl ? <a href={b.linkUrl} target="_blank" rel="noopener" className="text-blue-600 hover:underline">{b.linkLabel || b.linkUrl}</a> : "No link"}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleToggle(b)} className="p-1.5 rounded hover:bg-gray-100" title={b.isActive ? "Deactivate" : "Activate"}>
                            {b.isActive ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-gray-500" />}
                          </button>
                          <button onClick={() => openEdit(b)} className="p-1.5 rounded hover:bg-gray-100">
                            <Edit2 className="w-4 h-4 text-blue-600" />
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded hover:bg-gray-100">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Banner" : "New Banner"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Position</Label>
              <Select value={form.position} onValueChange={(v) => set("position", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {POSITIONS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Explore the New Nexon EV" />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input value={form.subtitle || ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="e.g. Starting at ₹14.49 Lakh" />
            </div>

            <div className="space-y-2">
              <Label>Image *</Label>
              {form.imageUrl && (
                <div className="relative h-32 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={form.imageUrl} alt="Preview" fill className="object-cover" />
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-lg px-4 py-3 hover:bg-gray-50 justify-center">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{uploading ? "Uploading..." : "Upload Image (1920×600px recommended)"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              <Input placeholder="Or paste image URL" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input value={form.linkUrl || ""} onChange={(e) => set("linkUrl", e.target.value)} placeholder="/cars/tata/nexon-ev" />
              </div>
              <div className="space-y-2">
                <Label>Link Label</Label>
                <Input value={form.linkLabel || ""} onChange={(e) => set("linkLabel", e.target.value)} placeholder="Learn More" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
                <Label>Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Update" : "Create"} Banner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
