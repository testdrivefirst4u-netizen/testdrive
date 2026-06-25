"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

interface Brand {
  id?: string;
  name?: string;
  logo?: string | null;
  logoFileId?: string | null;
  description?: string | null;
  country?: string | null;
  founded?: number | null;
  isPopular?: boolean;
  status?: string;
  sortOrder?: number;
}

export function BrandForm({ brand }: { brand?: Brand }) {
  const router = useRouter();
  const isEdit = !!brand?.id;

  const [form, setForm] = useState({
    name: brand?.name || "",
    logo: brand?.logo || "",
    logoFileId: brand?.logoFileId || "",
    description: brand?.description || "",
    country: brand?.country || "",
    founded: brand?.founded?.toString() || "",
    isPopular: brand?.isPopular || false,
    status: brand?.status || "PUBLISHED",
    sortOrder: brand?.sortOrder?.toString() || "0",
  });

  const [logoPreview, setLogoPreview] = useState(brand?.logo || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: base64, fileName: file.name, folder: "brands" }),
        });
        const data = await res.json();
        if (data.url) {
          setForm((f) => ({ ...f, logo: data.url, logoFileId: data.fileId || "" }));
          setLogoPreview(data.url);
          toast.success("Logo uploaded");
        }
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/brands/${brand!.id}` : "/api/admin/brands";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, founded: form.founded || null, sortOrder: parseInt(form.sortOrder) }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success(isEdit ? "Brand updated" : "Brand created");
      router.push("/admin/brands");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader><CardTitle>Brand Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={form.country} onChange={(e) => setForm(f => ({ ...f, country: e.target.value }))} placeholder="e.g. India, Japan" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founded">Founded Year</Label>
              <Input id="founded" type="number" value={form.founded} onChange={(e) => setForm(f => ({ ...f, founded: e.target.value }))} placeholder="e.g. 1948" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <Image src={logoPreview} alt="Brand logo" width={64} height={64} className="rounded bg-gray-100 p-1 object-contain" />
              )}
              <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg px-4 py-3 hover:bg-gray-50 transition-colors">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{uploading ? "Uploading..." : "Upload Logo"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
              </label>
            </div>
            <Input placeholder="Or paste image URL" value={form.logo} onChange={(e) => { setForm(f => ({ ...f, logo: e.target.value })); setLogoPreview(e.target.value); }} className="mt-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch id="isPopular" checked={form.isPopular} onCheckedChange={(v) => setForm(f => ({ ...f, isPopular: v }))} />
              <Label htmlFor="isPopular">Mark as Popular</Label>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Update Brand" : "Create Brand"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
