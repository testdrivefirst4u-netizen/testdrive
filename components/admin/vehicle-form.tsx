"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Upload, Plus, Trash2, Wand2, X, Sparkles,
  Image as ImageIcon, Globe, HelpCircle, Shield, RefreshCw, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Image from "next/image";

interface Brand { id: string; name: string }
interface Category { id: string; name: string; type: string }

interface VehicleData {
  id?: string; name?: string; slug?: string; brandId?: string; categoryId?: string; type?: string;
  description?: string | null; shortDescription?: string | null;
  priceMin?: number | null; priceMax?: number | null; priceDisplay?: string | null;
  exShowroomPrice?: number | null; onRoadPrice?: number | null; launchDate?: string | null;
  isUpcoming?: boolean; isPopular?: boolean; isElectric?: boolean; isNew?: boolean;
  featured?: boolean; availabilityStatus?: string;
  featuredImage?: string | null; featuredFileId?: string | null;
  batteryCapacity?: string | null; chargingTime?: string | null; fastCharging?: boolean;
  range?: string | null; motorPower?: string | null; motorTorque?: string | null;
  acChargingTime?: string | null; dcChargingTime?: string | null; chargingPortType?: string | null;
  bodyType?: string | null; segment?: string | null; mileage?: string | null; topSpeed?: string | null;
  engine?: string | null; power?: string | null; torque?: string | null;
  acceleration?: string | null; drivetrainType?: string | null; seatingCapacity?: number | null;
  overview?: string | null; keyHighlights?: string[]; pros?: string[]; cons?: string[];
  videoUrl?: string | null; vehicleWarranty?: string | null; batteryWarranty?: string | null;
  status?: string;
  seo?: { metaTitle?: string | null; metaDescription?: string | null; metaKeywords?: string | null; canonicalUrl?: string | null; ogTitle?: string | null; ogDescription?: string | null; ogImage?: string | null } | null;
  variants?: Array<{ id?: string; name: string; priceDisplay?: string; fuelType?: string; transmission?: string; mileage?: string; range?: string }>;
  images?: Array<{ id?: string; url: string; fileId?: string; type?: string; sortOrder?: number }>;
  colours?: Array<{ id?: string; name: string; hexCode?: string; imageUrl?: string }>;
  faqs?: Array<{ id?: string; question: string; answer: string }>;
  features?: Array<{ id?: string; category: string; name: string; available?: boolean; note?: string }>;
}

interface Props { vehicle?: VehicleData; brands: Brand[]; categories: Category[] }

function genSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function VehicleForm({ vehicle, brands, categories }: Props) {
  const router = useRouter();
  const isEdit = !!vehicle?.id;

  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [autofilling, setAutofilling] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: vehicle?.name || "",
    slug: vehicle?.slug || "",
    brandId: vehicle?.brandId || "",
    categoryId: vehicle?.categoryId || "",
    type: vehicle?.type || "CAR",
    description: vehicle?.description || "",
    shortDescription: vehicle?.shortDescription || "",
    priceMin: vehicle?.priceMin?.toString() || "",
    priceMax: vehicle?.priceMax?.toString() || "",
    priceDisplay: vehicle?.priceDisplay || "",
    exShowroomPrice: vehicle?.exShowroomPrice?.toString() || "",
    onRoadPrice: vehicle?.onRoadPrice?.toString() || "",
    launchDate: vehicle?.launchDate ? vehicle.launchDate.split("T")[0] : "",
    isUpcoming: vehicle?.isUpcoming || false,
    isPopular: vehicle?.isPopular || false,
    isElectric: vehicle?.isElectric || false,
    isNew: vehicle?.isNew || false,
    featured: vehicle?.featured || false,
    availabilityStatus: vehicle?.availabilityStatus || "available",
    featuredImage: vehicle?.featuredImage || "",
    featuredFileId: vehicle?.featuredFileId || "",
    batteryCapacity: vehicle?.batteryCapacity || "",
    chargingTime: vehicle?.chargingTime || "",
    fastCharging: vehicle?.fastCharging || false,
    range: vehicle?.range || "",
    motorPower: vehicle?.motorPower || "",
    motorTorque: vehicle?.motorTorque || "",
    acChargingTime: vehicle?.acChargingTime || "",
    dcChargingTime: vehicle?.dcChargingTime || "",
    chargingPortType: vehicle?.chargingPortType || "",
    bodyType: vehicle?.bodyType || "",
    segment: vehicle?.segment || "",
    mileage: vehicle?.mileage || "",
    topSpeed: vehicle?.topSpeed || "",
    engine: vehicle?.engine || "",
    power: vehicle?.power || "",
    torque: vehicle?.torque || "",
    acceleration: vehicle?.acceleration || "",
    drivetrainType: vehicle?.drivetrainType || "",
    seatingCapacity: vehicle?.seatingCapacity?.toString() || "",
    overview: vehicle?.overview || "",
    videoUrl: vehicle?.videoUrl || "",
    vehicleWarranty: vehicle?.vehicleWarranty || "",
    batteryWarranty: vehicle?.batteryWarranty || "",
    status: vehicle?.status || "DRAFT",
  });

  const [seo, setSeo] = useState({
    metaTitle: vehicle?.seo?.metaTitle || "",
    metaDescription: vehicle?.seo?.metaDescription || "",
    metaKeywords: vehicle?.seo?.metaKeywords || "",
    canonicalUrl: vehicle?.seo?.canonicalUrl || "",
    ogTitle: vehicle?.seo?.ogTitle || "",
    ogDescription: vehicle?.seo?.ogDescription || "",
    ogImage: vehicle?.seo?.ogImage || "",
  });

  const [keyHighlights, setKeyHighlights] = useState<string[]>(vehicle?.keyHighlights || []);
  const [pros, setPros] = useState<string[]>(vehicle?.pros || []);
  const [cons, setCons] = useState<string[]>(vehicle?.cons || []);
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    (vehicle?.faqs || []).map((f) => ({ question: f.question, answer: f.answer }))
  );
  const [images, setImages] = useState<Array<{ url: string; fileId?: string; type?: string }>>(
    (vehicle?.images || []).map((i) => ({ url: i.url, fileId: i.fileId || "", type: i.type || "gallery" }))
  );
  const [colours, setColours] = useState<Array<{ name: string; hexCode?: string; imageUrl?: string }>>(
    (vehicle?.colours || []).map((c) => ({ name: c.name, hexCode: c.hexCode || "", imageUrl: c.imageUrl || "" }))
  );
  const [variants, setVariants] = useState<Array<{ name: string; priceDisplay?: string; fuelType?: string; transmission?: string; mileage?: string; range?: string }>>(
    (vehicle?.variants || []).map((v) => ({ name: v.name, priceDisplay: v.priceDisplay || "", fuelType: v.fuelType || "", transmission: v.transmission || "", mileage: v.mileage || "", range: v.range || "" }))
  );

  const vehicleFeatures = (vehicle?.features || []).filter((f) => f.category === "features");
  const vehicleSafety = (vehicle?.features || []).filter((f) => f.category === "safety");
  const [features, setFeatures] = useState<Array<{ name: string; available: boolean }>>(
    vehicleFeatures.length > 0 ? vehicleFeatures.map((f) => ({ name: f.name, available: f.available !== false })) : []
  );
  const [safety, setSafety] = useState<Array<{ name: string; available: boolean }>>(
    vehicleSafety.length > 0 ? vehicleSafety.map((f) => ({ name: f.name, available: f.available !== false })) : []
  );

  const set = (key: string, val: any) => setForm((f) => ({ ...f, [key]: val }));
  const setSeoField = (key: string, val: string) => setSeo((s) => ({ ...s, [key]: val }));

  const filteredCategories = categories.filter((c) => !form.type || c.type === form.type);
  const showEV = form.type === "EV" || form.isElectric;
  const brandName = brands.find((b) => b.id === form.brandId)?.name || "";

  function autoSlug() {
    if (!form.name) return;
    set("slug", genSlug(`${brandName} ${form.name}`));
  }

  async function uploadImage(file: File) {
    return new Promise<{ url: string; fileId: string }>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: reader.result, fileName: file.name, folder: "vehicles" }),
          });
          const data = await res.json();
          if (data.url) resolve({ url: data.url, fileId: data.fileId || "" });
          else reject(new Error("Upload failed"));
        } catch (e) { reject(e); }
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((f) => uploadImage(f)));
      setImages((prev) => [...prev, ...uploaded.map((u) => ({ ...u, type: "gallery" }))]);
      toast.success(`${uploaded.length} image(s) uploaded`);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function handleFeaturedImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url, fileId } = await uploadImage(file);
      set("featuredImage", url);
      set("featuredFileId", fileId);
      if (!seo.ogImage) setSeoField("ogImage", url);
      toast.success("Featured image uploaded");
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  }

  async function generateAI(field: string) {
    if (!form.name || !form.brandId) { toast.error("Enter vehicle name and brand first"); return; }
    setAiLoading(field);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, vehicleName: form.name, brand: brandName, type: form.type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (field === "description") set("description", data.result);
      else if (field === "overview") set("overview", data.result);
      else if (field === "pros") setPros(data.result || []);
      else if (field === "cons") setCons(data.result || []);
      else if (field === "highlights") setKeyHighlights(data.result || []);
      else if (field === "faqs") setFaqs(data.result || []);
      else if (field === "seo_title") setSeoField("metaTitle", data.result);
      else if (field === "seo_description") setSeoField("metaDescription", data.result);
      toast.success("AI content generated");
    } catch (e: any) { toast.error(e.message || "AI generation failed"); }
    finally { setAiLoading(null); }
  }

  async function autofillAll() {
    if (!form.name || !form.brandId) { toast.error("Enter vehicle name and select brand first"); return; }
    setAutofilling(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field: "autofill", vehicleName: form.name, brand: brandName, type: form.type }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const d = data.result;
      setForm((f) => ({
        ...f,
        description: d.description || f.description,
        shortDescription: d.shortDescription || f.shortDescription,
        overview: d.overview || f.overview,
        priceDisplay: d.priceDisplay || f.priceDisplay,
        priceMin: d.priceMin?.toString() || f.priceMin,
        priceMax: d.priceMax?.toString() || f.priceMax,
        engine: d.engine || f.engine, power: d.power || f.power, torque: d.torque || f.torque,
        mileage: d.mileage || f.mileage, topSpeed: d.topSpeed || f.topSpeed,
        bodyType: d.bodyType || f.bodyType, segment: d.segment || f.segment,
        batteryCapacity: d.batteryCapacity || f.batteryCapacity,
        range: d.range || f.range, chargingTime: d.chargingTime || f.chargingTime,
        motorPower: d.motorPower || f.motorPower, motorTorque: d.motorTorque || f.motorTorque,
        videoUrl: d.videoUrl || f.videoUrl,
        acceleration: d.acceleration || f.acceleration,
      }));
      if (d.keyHighlights?.length) setKeyHighlights(d.keyHighlights);
      if (d.pros?.length) setPros(d.pros);
      if (d.cons?.length) setCons(d.cons);
      if (d.variants?.length) setVariants(d.variants);
      if (d.colours?.length) setColours(d.colours.map((c: any) => ({ name: c.name, hexCode: c.hexCode || "" })));
      if (d.faqs?.length) setFaqs(d.faqs);
      if (d.features?.length) setFeatures(d.features.map((f: any) => ({ name: f.name || f, available: true })));
      if (d.safety?.length) setSafety(d.safety.map((f: any) => ({ name: f.name || f, available: true })));
      if (d.seo) setSeo((s) => ({ ...s, metaTitle: d.seo.metaTitle || s.metaTitle, metaDescription: d.seo.metaDescription || s.metaDescription, metaKeywords: d.seo.metaKeywords || s.metaKeywords, ogTitle: d.seo.ogTitle || s.ogTitle, ogDescription: d.seo.ogDescription || s.ogDescription }));
      if (!form.slug && form.name) set("slug", genSlug(`${brandName} ${form.name}`));
      toast.success("AI autofill complete! Review and save.");
    } catch (e: any) { toast.error(e.message || "AI autofill failed"); }
    finally { setAutofilling(false); }
  }

  function validate(targetStatus: string): string[] {
    if (targetStatus !== "PUBLISHED") return [];
    const errors: string[] = [];
    if (!form.name) errors.push("Vehicle name is required");
    if (!form.brandId) errors.push("Brand is required");
    if (!form.categoryId) errors.push("Category is required");
    if (!form.shortDescription) errors.push("Short description is required");
    if (!form.description) errors.push("Full description is required");
    if (!form.priceDisplay && !form.priceMin) errors.push("Price is required");
    if (images.length === 0 && !form.featuredImage) errors.push("At least one image is required");
    if (colours.length === 0) errors.push("At least one colour is required");
    if (variants.length === 0) errors.push("At least one variant is required");
    if (pros.length < 3) errors.push("At least 3 pros are required");
    if (cons.length < 3) errors.push("At least 3 cons are required");
    if (features.length < 5) errors.push("At least 5 features are required");
    if (safety.length < 3) errors.push("At least 3 safety features are required");
    if (!seo.metaTitle) errors.push("SEO: Meta title is required");
    if (!seo.metaDescription) errors.push("SEO: Meta description is required");
    return errors;
  }

  async function handleSubmit(e: React.FormEvent, overrideStatus?: string) {
    e.preventDefault();
    const targetStatus = overrideStatus || form.status;
    const errors = validate(targetStatus);
    if (errors.length > 0) {
      setValidationErrors(errors);
      toast.error(`Fix ${errors.length} issue(s) before publishing`);
      return;
    }
    setValidationErrors([]);
    setSaving(true);
    try {
      const url = isEdit ? `/api/admin/vehicles/${vehicle!.id}` : "/api/admin/vehicles";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: targetStatus, keyHighlights, pros, cons, seo }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || "Failed"); }
      const saved = await res.json();
      const vehicleId = saved.id;

      // Sync nested relations
      await Promise.all([
        // Images (new vehicle only — on edit they're managed separately)
        ...(!isEdit ? images.map((img) =>
          fetch(`/api/admin/vehicles/${vehicleId}/images`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(img),
          })
        ) : []),
        // Colours
        ...(!isEdit ? colours.map((c) =>
          fetch(`/api/admin/vehicles/${vehicleId}/colours`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(c),
          })
        ) : []),
        // Variants
        ...(!isEdit ? variants.map((v) =>
          fetch(`/api/admin/vehicles/${vehicleId}/variants`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(v),
          })
        ) : []),
      ]);

      // FAQs (bulk sync for both create and edit)
      await fetch(`/api/admin/vehicles/${vehicleId}/faqs`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ faqs }),
      });

      // Features + Safety (bulk sync)
      await fetch(`/api/admin/vehicles/${vehicleId}/features`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: [
            ...features.map((f) => ({ ...f, category: "features" })),
            ...safety.map((s) => ({ ...s, category: "safety" })),
          ],
        }),
      });

      toast.success(isEdit ? "Vehicle updated!" : "Vehicle created!");
      router.push(`/admin/vehicles/${vehicleId}`);
      router.refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Validation errors banner */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3 px-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-800 mb-1">Fix these issues before publishing:</p>
                <ul className="text-xs text-red-700 space-y-0.5 list-disc list-inside">
                  {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Autofill Banner */}
      <Card className="border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
        <CardContent className="py-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-violet-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Autofill
            </p>
            <p className="text-sm text-violet-700">Enter name + brand → auto-fill all specs, content, features, FAQs & SEO in one shot.</p>
          </div>
          <Button type="button" onClick={autofillAll} disabled={autofilling || !form.name || !form.brandId} className="bg-violet-600 hover:bg-violet-700 text-white shrink-0">
            {autofilling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Filling…</> : <><Sparkles className="w-4 h-4 mr-2" /> Autofill Everything</>}
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="basic">
        <TabsList className="grid grid-cols-9 w-full text-xs">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="specs">Specs</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* ── BASIC ── */}
        <TabsContent value="basic" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Vehicle Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vehicle Name *</Label>
                  <Input value={form.name} onChange={(e) => { set("name", e.target.value); if (!form.slug) set("slug", genSlug(`${brandName} ${e.target.value}`)); }} required placeholder="e.g. Nexon EV Max" />
                </div>
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select value={form.type} onValueChange={(v) => set("type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CAR">Car</SelectItem>
                      <SelectItem value="BIKE">Bike</SelectItem>
                      <SelectItem value="SCOOTER">Scooter</SelectItem>
                      <SelectItem value="EV">Electric Vehicle</SelectItem>
                      <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Brand *</Label>
                  <Select value={form.brandId} onValueChange={(v) => set("brandId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>{filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>URL Slug *</Label>
                <div className="flex gap-2">
                  <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto-generated from name" className="flex-1 font-mono text-sm" />
                  <Button type="button" variant="outline" size="sm" onClick={autoSlug} className="shrink-0">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Generate
                  </Button>
                </div>
                {form.slug && <p className="text-xs text-gray-400">URL: /cars/{form.slug}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Body Type</Label>
                  <Select value={form.bodyType} onValueChange={(v) => set("bodyType", v)}>
                    <SelectTrigger><SelectValue placeholder="Select body type" /></SelectTrigger>
                    <SelectContent>
                      {["SUV", "Sedan", "Hatchback", "MUV", "Crossover", "Convertible", "Pickup", "Van", "Minivan", "Cruiser", "Sports", "Naked", "Adventure", "Commuter"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Segment</Label>
                  <Input value={form.segment} onChange={(e) => set("segment", e.target.value)} placeholder="e.g. Premium SUV" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Availability Status</Label>
                  <Select value={form.availabilityStatus} onValueChange={(v) => set("availabilityStatus", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Launch Date</Label>
                  <Input type="date" value={form.launchDate} onChange={(e) => set("launchDate", e.target.value)} />
                </div>
              </div>

              <div className="flex flex-wrap gap-6">
                {[
                  { key: "featured", label: "⭐ Featured" },
                  { key: "isPopular", label: "Popular" },
                  { key: "isUpcoming", label: "Upcoming" },
                  { key: "isElectric", label: "Electric" },
                  { key: "isNew", label: "New Launch" },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2">
                    <Switch id={key} checked={(form as any)[key]} onCheckedChange={(v) => set(key, v)} />
                    <Label htmlFor={key}>{label}</Label>
                  </div>
                ))}
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

        {/* ── PRICING ── */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Price Min (Lakhs)</Label><Input type="number" step="0.01" value={form.priceMin} onChange={(e) => set("priceMin", e.target.value)} placeholder="e.g. 8.50" /></div>
                <div className="space-y-2"><Label>Price Max (Lakhs)</Label><Input type="number" step="0.01" value={form.priceMax} onChange={(e) => set("priceMax", e.target.value)} placeholder="e.g. 14.00" /></div>
              </div>
              <div className="space-y-2"><Label>Price Display</Label><Input value={form.priceDisplay} onChange={(e) => set("priceDisplay", e.target.value)} placeholder="e.g. ₹8.50 - ₹14.00 Lakh" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Ex-Showroom Price (₹)</Label><Input type="number" value={form.exShowroomPrice} onChange={(e) => set("exShowroomPrice", e.target.value)} /></div>
                <div className="space-y-2"><Label>On-Road Price (₹)</Label><Input type="number" value={form.onRoadPrice} onChange={(e) => set("onRoadPrice", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SPECS ── */}
        <TabsContent value="specs" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Performance</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Engine</Label><Input value={form.engine} onChange={(e) => set("engine", e.target.value)} placeholder="e.g. 1.2L Turbo" /></div>
              <div className="space-y-2"><Label>Power</Label><Input value={form.power} onChange={(e) => set("power", e.target.value)} placeholder="e.g. 120 bhp" /></div>
              <div className="space-y-2"><Label>Torque</Label><Input value={form.torque} onChange={(e) => set("torque", e.target.value)} placeholder="e.g. 170 Nm" /></div>
              <div className="space-y-2"><Label>Mileage</Label><Input value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="e.g. 18.4 kmpl" /></div>
              <div className="space-y-2"><Label>Top Speed</Label><Input value={form.topSpeed} onChange={(e) => set("topSpeed", e.target.value)} placeholder="e.g. 180 km/h" /></div>
              <div className="space-y-2"><Label>0-100 km/h</Label><Input value={form.acceleration} onChange={(e) => set("acceleration", e.target.value)} placeholder="e.g. 8.5 sec" /></div>
              <div className="space-y-2"><Label>Drivetrain</Label>
                <Select value={form.drivetrainType} onValueChange={(v) => set("drivetrainType", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {["FWD", "RWD", "AWD", "4WD"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Seating Capacity</Label><Input type="number" value={form.seatingCapacity} onChange={(e) => set("seatingCapacity", e.target.value)} placeholder="e.g. 5" /></div>
            </CardContent>
          </Card>

          {showEV && (
            <Card>
              <CardHeader><CardTitle>EV / Battery</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Battery Capacity</Label><Input value={form.batteryCapacity} onChange={(e) => set("batteryCapacity", e.target.value)} placeholder="e.g. 40.5 kWh" /></div>
                <div className="space-y-2"><Label>Driving Range</Label><Input value={form.range} onChange={(e) => set("range", e.target.value)} placeholder="e.g. 465 km (ARAI)" /></div>
                <div className="space-y-2"><Label>AC Charging Time</Label><Input value={form.acChargingTime} onChange={(e) => set("acChargingTime", e.target.value)} placeholder="e.g. 8.8 hrs" /></div>
                <div className="space-y-2"><Label>DC Fast Charging Time</Label><Input value={form.dcChargingTime} onChange={(e) => set("dcChargingTime", e.target.value)} placeholder="e.g. 56 min (80%)" /></div>
                <div className="space-y-2"><Label>Charging Port Type</Label><Input value={form.chargingPortType} onChange={(e) => set("chargingPortType", e.target.value)} placeholder="e.g. CCS2 / CHAdeMO" /></div>
                <div className="space-y-2"><Label>Motor Power</Label><Input value={form.motorPower} onChange={(e) => set("motorPower", e.target.value)} placeholder="e.g. 143 PS" /></div>
                <div className="space-y-2"><Label>Motor Torque</Label><Input value={form.motorTorque} onChange={(e) => set("motorTorque", e.target.value)} placeholder="e.g. 250 Nm" /></div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch id="fastCharging" checked={form.fastCharging} onCheckedChange={(v) => set("fastCharging", v)} />
                  <Label htmlFor="fastCharging">Fast Charging Support</Label>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Warranty</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Vehicle Warranty</Label><Input value={form.vehicleWarranty} onChange={(e) => set("vehicleWarranty", e.target.value)} placeholder="e.g. 3 years / 1,00,000 km" /></div>
              {showEV && <div className="space-y-2"><Label>Battery Warranty</Label><Input value={form.batteryWarranty} onChange={(e) => set("batteryWarranty", e.target.value)} placeholder="e.g. 8 years / 1,60,000 km" /></div>}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONTENT ── */}
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Description</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => generateAI("description")} disabled={!!aiLoading}>
                {aiLoading === "description" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />} AI Write
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Short Description * <span className="text-gray-400 text-xs">(listing cards)</span></Label>
                <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={2} placeholder="One-liner for listing pages" />
              </div>
              <div className="space-y-2">
                <Label>Full Description *</Label>
                <RichTextEditor value={form.description} onChange={(val) => set("description", val)} placeholder="Detailed description…" minHeight={280} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Overview</Label>
                  <Button type="button" variant="ghost" size="sm" onClick={() => generateAI("overview")} disabled={!!aiLoading}>
                    {aiLoading === "overview" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI
                  </Button>
                </div>
                <RichTextEditor value={form.overview} onChange={(val) => set("overview", val)} placeholder="Overview shown above specs…" minHeight={200} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Key Highlights</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => generateAI("highlights")} disabled={!!aiLoading}>
                {aiLoading === "highlights" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />} AI Generate
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {keyHighlights.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={h} onChange={(e) => setKeyHighlights((prev) => prev.map((x, j) => j === i ? e.target.value : x))} placeholder={`Highlight ${i + 1}`} />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setKeyHighlights((prev) => prev.filter((_, j) => j !== i))}><X className="w-4 h-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setKeyHighlights((prev) => [...prev, ""])}>
                <Plus className="w-4 h-4 mr-1" /> Add Highlight
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-green-700">Pros <span className="text-xs text-gray-400">(min 3)</span></CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("pros")} disabled={!!aiLoading}>
                  {aiLoading === "pros" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {pros.map((p, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={p} onChange={(e) => setPros((prev) => prev.map((x, j) => j === i ? e.target.value : x))} className="text-sm" placeholder="e.g. Spacious boot" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPros((prev) => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setPros((prev) => [...prev, ""])}><Plus className="w-3 h-3 mr-1" /> Add Pro</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base text-red-700">Cons <span className="text-xs text-gray-400">(min 3)</span></CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("cons")} disabled={!!aiLoading}>
                  {aiLoading === "cons" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {cons.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={c} onChange={(e) => setCons((prev) => prev.map((x, j) => j === i ? e.target.value : x))} className="text-sm" placeholder="e.g. Expensive on-road" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCons((prev) => prev.filter((_, j) => j !== i))}><X className="w-3 h-3" /></Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setCons((prev) => [...prev, ""])}><Plus className="w-3 h-3 mr-1" /> Add Con</Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Video</CardTitle></CardHeader>
            <CardContent>
              <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="YouTube embed or direct video URL" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── MEDIA ── */}
        <TabsContent value="media" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Featured Image <span className="text-xs text-gray-400 font-normal">(1200×630px for SEO/OG)</span></CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {form.featuredImage && (
                <div className="relative h-40 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={form.featuredImage} alt="Featured" fill className="object-cover" />
                  <button type="button" onClick={() => { set("featuredImage", ""); set("featuredFileId", ""); }} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex items-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-6 py-5 hover:bg-gray-50 justify-center">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">{uploading ? "Uploading…" : "Upload featured image"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} disabled={uploading} />
              </label>
              <Input placeholder="Or paste URL" value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Gallery Images</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col items-center gap-2 cursor-pointer border-2 border-dashed rounded-xl px-6 py-8 hover:bg-gray-50 transition-colors">
                <ImageIcon className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500 font-medium">{uploading ? "Uploading…" : "Click to upload gallery images"}</span>
                <span className="text-xs text-gray-400">Multiple files · JPG, PNG, WebP</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
              </label>
              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <Image src={img.url} alt={`Image ${i + 1}`} width={160} height={120} className="rounded-lg object-cover w-full h-24 bg-gray-100" />
                      <button type="button" onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Colours</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {colours.map((c, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <Input value={c.name} onChange={(e) => setColours((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Colour name" className="flex-1" />
                  <div className="flex items-center gap-1">
                    <input type="color" value={c.hexCode || "#000000"} onChange={(e) => setColours((prev) => prev.map((x, j) => j === i ? { ...x, hexCode: e.target.value } : x))} className="w-8 h-8 rounded cursor-pointer border" />
                    <Input value={c.hexCode || ""} onChange={(e) => setColours((prev) => prev.map((x, j) => j === i ? { ...x, hexCode: e.target.value } : x))} placeholder="#FFFFFF" className="w-24 text-xs font-mono" />
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setColours((prev) => prev.filter((_, j) => j !== i))}><X className="w-4 h-4 text-red-500" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setColours((prev) => [...prev, { name: "", hexCode: "#FFFFFF" }])}>
                <Plus className="w-4 h-4 mr-1" /> Add Colour
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FEATURES & SAFETY ── */}
        <TabsContent value="features" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-600" /> Key Features <span className="text-xs text-gray-400 font-normal">(min 5)</span></CardTitle>
                <CardDescription className="mt-1">Comfort, infotainment, convenience features</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setFeatures((prev) => [...prev, { name: "", available: true }])}>
                <Plus className="w-4 h-4 mr-1" /> Add Feature
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {features.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No features yet. Add them manually or use AI Autofill.</p>
              )}
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Switch checked={f.available} onCheckedChange={(v) => setFeatures((prev) => prev.map((x, j) => j === i ? { ...x, available: v } : x))} />
                  <Input value={f.name} onChange={(e) => setFeatures((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={`Feature ${i + 1} (e.g. Sunroof, Apple CarPlay)`} className="flex-1 text-sm" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFeatures((prev) => prev.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              ))}
              {features.length < 5 && features.length > 0 && (
                <p className="text-xs text-amber-600 mt-2">⚠ Add at least {5 - features.length} more feature(s) to publish</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-blue-600" /> Safety Features <span className="text-xs text-gray-400 font-normal">(min 3)</span></CardTitle>
                <CardDescription className="mt-1">ADAS, airbags, crash ratings, braking systems</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setSafety((prev) => [...prev, { name: "", available: true }])}>
                <Plus className="w-4 h-4 mr-1" /> Add Safety
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {safety.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">No safety features yet.</p>
              )}
              {safety.map((s, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Switch checked={s.available} onCheckedChange={(v) => setSafety((prev) => prev.map((x, j) => j === i ? { ...x, available: v } : x))} />
                  <Input value={s.name} onChange={(e) => setSafety((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder={`Safety feature (e.g. 6 Airbags, ABS+EBD, ADAS)`} className="flex-1 text-sm" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => setSafety((prev) => prev.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
              ))}
              {safety.length < 3 && safety.length > 0 && (
                <p className="text-xs text-amber-600 mt-2">⚠ Add at least {3 - safety.length} more safety feature(s) to publish</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── VARIANTS ── */}
        <TabsContent value="variants" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Variants <span className="text-xs text-gray-400 font-normal">(min 1)</span></CardTitle>
                <CardDescription className="mt-1">Add all available trims/grades</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setVariants((prev) => [...prev, { name: "", priceDisplay: "", fuelType: "", transmission: "" }])}>
                <Plus className="w-4 h-4 mr-1" /> Add Variant
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No variants yet.</p>}
              {variants.map((v, i) => (
                <Card key={i} className="border border-gray-200 bg-gray-50/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline">Variant {i + 1}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setVariants((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1"><Label className="text-xs">Name *</Label><Input value={v.name} onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. Base, Mid, Top" className="text-sm" /></div>
                      <div className="space-y-1"><Label className="text-xs">Price</Label><Input value={v.priceDisplay || ""} onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, priceDisplay: e.target.value } : x))} placeholder="e.g. ₹9.50 Lakh" className="text-sm" /></div>
                      <div className="space-y-1"><Label className="text-xs">Fuel Type</Label>
                        <Select value={v.fuelType || ""} onValueChange={(val) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, fuelType: val } : x))}>
                          <SelectTrigger className="text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{["Petrol", "Diesel", "CNG", "LPG", "Electric", "Hybrid", "Mild Hybrid"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">Transmission</Label>
                        <Select value={v.transmission || ""} onValueChange={(val) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, transmission: val } : x))}>
                          <SelectTrigger className="text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{["Manual", "Automatic", "CVT", "DCT", "AMT", "IMT"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1"><Label className="text-xs">{form.type === "EV" ? "Range" : "Mileage"}</Label><Input value={form.type === "EV" ? (v.range || "") : (v.mileage || "")} onChange={(e) => setVariants((prev) => prev.map((x, j) => j === i ? { ...x, [form.type === "EV" ? "range" : "mileage"]: e.target.value } : x))} className="text-sm" /></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── FAQS ── */}
        <TabsContent value="faqs" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5" /> FAQs</CardTitle>
                <CardDescription className="mt-1">Frequently asked questions</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("faqs")} disabled={!!aiLoading}>
                  {aiLoading === "faqs" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Wand2 className="w-4 h-4 mr-1" />} AI Generate
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setFaqs((prev) => [...prev, { question: "", answer: "" }])}>
                  <Plus className="w-4 h-4 mr-1" /> Add FAQ
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No FAQs yet. Use AI Generate or add manually.</p>}
              {faqs.map((faq, i) => (
                <Card key={i} className="border border-gray-200">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-xs">Q{i + 1}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFaqs((prev) => prev.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Question</Label>
                      <Input value={faq.question} onChange={(e) => setFaqs((prev) => prev.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="e.g. What is the mileage?" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Answer</Label>
                      <Textarea value={faq.answer} onChange={(e) => setFaqs((prev) => prev.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} rows={3} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SEO ── */}
        <TabsContent value="seo" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> SEO Settings</CardTitle>
                <CardDescription>Control search & social appearance</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("seo_title")} disabled={!!aiLoading}>{aiLoading === "seo_title" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Title</Button>
                <Button type="button" variant="outline" size="sm" onClick={() => generateAI("seo_description")} disabled={!!aiLoading}>{aiLoading === "seo_description" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Desc</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Meta Title * <span className="text-xs text-gray-400">(50–60 chars)</span></Label>
                <Input value={seo.metaTitle} onChange={(e) => setSeoField("metaTitle", e.target.value)} placeholder={`${form.name} Price, Specs & Review | Walley`} maxLength={80} />
                <p className={`text-xs ${seo.metaTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{seo.metaTitle.length}/80</p>
              </div>
              <div className="space-y-2">
                <Label>Meta Description * <span className="text-xs text-gray-400">(150–160 chars)</span></Label>
                <Textarea value={seo.metaDescription} onChange={(e) => setSeoField("metaDescription", e.target.value)} rows={3} maxLength={200} />
                <p className={`text-xs ${seo.metaDescription.length > 160 ? "text-amber-500" : "text-gray-400"}`}>{seo.metaDescription.length}/200</p>
              </div>
              <div className="space-y-2"><Label>Meta Keywords</Label><Input value={seo.metaKeywords} onChange={(e) => setSeoField("metaKeywords", e.target.value)} placeholder="keyword1, keyword2" /></div>
              <div className="space-y-2"><Label>Canonical URL *</Label><Input value={seo.canonicalUrl} onChange={(e) => setSeoField("canonicalUrl", e.target.value)} placeholder={`https://walley.broaddcast.com/cars/${form.slug}`} /></div>
              <Separator />
              <p className="text-sm font-semibold text-gray-700">Open Graph</p>
              <div className="space-y-2"><Label>OG Title</Label><Input value={seo.ogTitle} onChange={(e) => setSeoField("ogTitle", e.target.value)} placeholder={seo.metaTitle || form.name} /></div>
              <div className="space-y-2"><Label>OG Description</Label><Textarea value={seo.ogDescription} onChange={(e) => setSeoField("ogDescription", e.target.value)} rows={2} /></div>
              <div className="space-y-2">
                <Label>OG Image <span className="text-xs text-gray-400">(1200×630px)</span></Label>
                <Input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)} placeholder={form.featuredImage || "https://…"} />
                {seo.ogImage && <Image src={seo.ogImage} alt="OG" width={400} height={210} className="rounded-lg object-cover w-full max-h-40 border" />}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky action bar */}
      <div className="flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur py-4 border-t px-1 z-10">
        <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isEdit ? "Update Vehicle" : "Save Vehicle"}
        </Button>
        {form.status !== "PUBLISHED" && (
          <Button type="button" className="bg-green-600 hover:bg-green-700" disabled={saving} onClick={(e) => { e.preventDefault(); handleSubmit(e as any, "PUBLISHED"); }}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Publish
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>Cancel</Button>
        {isEdit && (
          <span className="ml-auto self-center text-xs text-gray-400">
            Last saved: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        )}
      </div>
    </form>
  );
}
