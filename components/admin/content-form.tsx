"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Wand2, X, Plus, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

interface ContentData {
  id?: string;
  title?: string;
  excerpt?: string | null;
  content?: string;
  coverImage?: string | null;
  coverFileId?: string | null;
  author?: string | null;
  tags?: string[];
  type?: string;
  status?: string;
  seo?: {
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
    canonicalUrl?: string | null;
    ogTitle?: string | null;
    ogDescription?: string | null;
    ogImage?: string | null;
  } | null;
}

interface Props {
  data?: ContentData;
  apiPath: string;
  listPath: string;
  contentType: "news" | "blog";
  typeOptions?: string[];
}

export function ContentForm({ data, apiPath, listPath, contentType, typeOptions }: Props) {
  const router = useRouter();
  const isEdit = !!data?.id;

  const [form, setForm] = useState({
    title: data?.title || "",
    excerpt: data?.excerpt || "",
    content: data?.content || "",
    coverImage: data?.coverImage || "",
    coverFileId: data?.coverFileId || "",
    author: data?.author || "",
    type: data?.type || (contentType === "news" ? "news" : "article"),
    status: data?.status || "DRAFT",
  });

  const [seo, setSeo] = useState({
    metaTitle: data?.seo?.metaTitle || "",
    metaDescription: data?.seo?.metaDescription || "",
    metaKeywords: data?.seo?.metaKeywords || "",
    canonicalUrl: data?.seo?.canonicalUrl || "",
    ogTitle: data?.seo?.ogTitle || "",
    ogDescription: data?.seo?.ogDescription || "",
    ogImage: data?.seo?.ogImage || "",
  });

  const [tags, setTags] = useState<string[]>(data?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [coverPreview, setCoverPreview] = useState(data?.coverImage || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));
  const setSeoField = (key: string, val: string) => setSeo((s) => ({ ...s, [key]: val }));

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ file: reader.result, fileName: file.name, folder: contentType }),
        });
        const d = await res.json();
        if (d.url) {
          set("coverImage", d.url);
          set("coverFileId", d.fileId || "");
          setCoverPreview(d.url);
          if (!seo.ogImage) setSeoField("ogImage", d.url);
          toast.success("Cover uploaded");
        }
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Upload failed");
      setUploading(false);
    }
  }

  async function generateAI(field: string) {
    if (!form.title) { toast.error("Enter a title first"); return; }
    setAiLoading(field);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, title: form.title, contentType }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      if (field === "excerpt") set("excerpt", d.result);
      else if (field === "seo_title") setSeoField("metaTitle", d.result);
      else if (field === "seo_description") setSeoField("metaDescription", d.result);
      toast.success("AI content generated");
    } catch (e: any) {
      toast.error(e.message || "AI generation failed");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const url = isEdit ? `${apiPath}/${data!.id}` : apiPath;
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags, seo }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      toast.success(isEdit ? "Updated!" : "Created!");
      router.push(listPath);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <Tabs defaultValue="content">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Cover &amp; Tags</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-1">
            <Globe className="w-3 h-3" /> SEO
          </TabsTrigger>
        </TabsList>

        {/* CONTENT */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} required placeholder="Article title..." className="text-lg font-medium" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Excerpt / Summary <span className="text-xs text-gray-400">(shown in listings)</span></Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => generateAI("excerpt")} disabled={!!aiLoading}>
                    {aiLoading === "excerpt" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />}
                    AI Generate
                  </Button>
                </div>
                <Textarea value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} placeholder="Brief summary shown in listings..." />
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <RichTextEditor
                  value={form.content}
                  onChange={(val) => set("content", val)}
                  placeholder="Write your article here…"
                  minHeight={480}
                  showCharCount
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MEDIA */}
        <TabsContent value="media" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Cover Image</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {coverPreview && (
                <div className="relative">
                  <Image src={coverPreview} alt="Cover" width={800} height={450} className="rounded-lg object-cover w-full max-h-60" />
                  <button type="button" onClick={() => { setCoverPreview(""); set("coverImage", ""); }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-6 py-6 hover:bg-gray-50 transition-colors justify-center">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">{uploading ? "Uploading..." : "Upload Cover Image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploading} />
              </label>
              <Input placeholder="Or paste image URL" value={form.coverImage} onChange={(e) => { set("coverImage", e.target.value); setCoverPreview(e.target.value); }} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" variant="outline" onClick={addTag}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span key={t} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {t}
                    <button type="button" onClick={() => setTags((prev) => prev.filter((x) => x !== t))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SETTINGS */}
        <TabsContent value="settings" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input value={form.author} onChange={(e) => set("author", e.target.value)} placeholder="Author name" />
                </div>
                {typeOptions && (
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => set("type", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {typeOptions.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> SEO Settings</CardTitle>
                <CardDescription>Optimise how this article appears in search results</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("seo_title")} disabled={!!aiLoading}>
                  {aiLoading === "seo_title" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Title
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("seo_description")} disabled={!!aiLoading}>
                  {aiLoading === "seo_description" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Desc
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Meta Title <span className="text-xs text-gray-400">(50–60 chars)</span></Label>
                <Input value={seo.metaTitle} onChange={(e) => setSeoField("metaTitle", e.target.value)} placeholder={form.title} maxLength={80} />
                <p className="text-xs text-gray-400">{seo.metaTitle.length}/80 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description <span className="text-xs text-gray-400">(150–160 chars)</span></Label>
                <Textarea value={seo.metaDescription} onChange={(e) => setSeoField("metaDescription", e.target.value)} rows={3} placeholder={form.excerpt || "Brief description for search results..."} maxLength={200} />
                <p className="text-xs text-gray-400">{seo.metaDescription.length}/200 characters</p>
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords <span className="text-xs text-gray-400">(comma-separated)</span></Label>
                <Input value={seo.metaKeywords} onChange={(e) => setSeoField("metaKeywords", e.target.value)} placeholder="keyword1, keyword2, keyword3" />
              </div>

              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input value={seo.canonicalUrl} onChange={(e) => setSeoField("canonicalUrl", e.target.value)} placeholder="Leave blank for auto-generated URL" />
              </div>

              <Separator />
              <p className="text-sm font-semibold text-gray-700">Open Graph (Social Sharing)</p>

              <div className="space-y-2">
                <Label>OG Title</Label>
                <Input value={seo.ogTitle} onChange={(e) => setSeoField("ogTitle", e.target.value)} placeholder={seo.metaTitle || form.title} />
              </div>

              <div className="space-y-2">
                <Label>OG Description</Label>
                <Textarea value={seo.ogDescription} onChange={(e) => setSeoField("ogDescription", e.target.value)} rows={2} placeholder={seo.metaDescription || form.excerpt || ""} />
              </div>

              <div className="space-y-2">
                <Label>OG Image <span className="text-xs text-gray-400">(1200×630px recommended)</span></Label>
                <Input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)} placeholder="https://... (auto-set from cover image)" />
                {seo.ogImage && (
                  <Image src={seo.ogImage} alt="OG preview" width={400} height={210} className="rounded-lg object-cover w-full max-h-40 border" />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Update" : "Publish"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
