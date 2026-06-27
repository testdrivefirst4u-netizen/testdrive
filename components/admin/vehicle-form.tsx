"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, Upload, Plus, Trash2, Wand2, X, Sparkles,
  Image as ImageIcon, Globe, HelpCircle, Shield, RefreshCw,
  CheckCircle2, AlertCircle, Car, DollarSign, Zap, FileText,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  brochureUrl?: string | null; brochureFileId?: string | null;
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

function SectionHeader({ icon: Icon, title, description, action }: {
  icon: any; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

function SeoLivePreview({ title, description, slug, ogTitle, ogDescription, ogImage }: {
  title: string; description: string; slug: string;
  ogTitle: string; ogDescription: string; ogImage: string;
}) {
  const domain = "testdrivefirst.com";
  const displayTitle = title || "Page Title — write your meta title above";
  const displayDesc = description || "Page description will appear here. Write your meta description above.";

  return (
    <div className="space-y-5">
      {/* Google Search Preview */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded-sm bg-[#4285F4]" />
          Google Search Preview
        </p>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[9px] text-white font-black">W</span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-xs text-[#202124] font-medium">{domain}</span>
              <span className="text-xs text-[#4d5156]"> › cars › {slug || "vehicle-slug"}</span>
            </div>
          </div>
          <p className={`text-[17px] leading-snug font-normal mb-0.5 line-clamp-1 ${title ? "text-[#1a0dab]" : "text-gray-300 italic"}`}>
            {displayTitle}
          </p>
          <p className={`text-[13px] leading-relaxed line-clamp-2 ${description ? "text-[#4d5156]" : "text-gray-300 italic"}`}>
            {displayDesc}
          </p>
        </div>
      </div>

      {/* Facebook / OG Preview */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded-sm bg-[#1877F2]" />
          Facebook / Open Graph Preview
        </p>
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          {ogImage ? (
            <div className="relative h-44 bg-gray-100">
              <Image src={ogImage} alt="OG Preview" fill className="object-cover" />
            </div>
          ) : (
            <div className="h-44 bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2">
              <ImageIcon className="w-8 h-8 text-slate-300" />
              <p className="text-xs text-slate-400">OG image will appear here (1200×630px)</p>
            </div>
          )}
          <div className="px-3 py-3 bg-[#f0f2f5] border-t border-gray-200">
            <p className="text-[11px] font-medium text-[#65676b] uppercase tracking-wide">{domain}</p>
            <p className={`text-sm font-bold mt-0.5 line-clamp-1 ${ogTitle || title ? "text-[#1c1e21]" : "text-gray-400 italic"}`}>
              {ogTitle || title || "OG Title (falls back to meta title)"}
            </p>
            <p className={`text-xs mt-0.5 line-clamp-2 ${ogDescription || description ? "text-[#65676b]" : "text-gray-300 italic"}`}>
              {ogDescription || description || "OG description (falls back to meta description)"}
            </p>
          </div>
        </div>
      </div>

      {/* Twitter / X Preview */}
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
          <span className="inline-block w-3.5 h-3.5 rounded-sm bg-black" />
          Twitter / X Card Preview
        </p>
        <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          {ogImage ? (
            <div className="relative h-40 bg-gray-100">
              <Image src={ogImage} alt="Twitter Card" fill className="object-cover" />
            </div>
          ) : (
            <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <p className="text-xs text-slate-400">No image set</p>
            </div>
          )}
          <div className="px-3 py-2.5 bg-white">
            <p className={`text-sm font-bold line-clamp-1 ${ogTitle || title ? "text-gray-900" : "text-gray-400 italic"}`}>
              {ogTitle || title || "Title"}
            </p>
            <p className={`text-xs mt-0.5 line-clamp-2 ${ogDescription || description ? "text-gray-500" : "text-gray-300 italic"}`}>
              {ogDescription || description || "Description"}
            </p>
            <p className="text-[11px] text-gray-400 mt-1.5">{domain}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleCardPreview({ name, brandName, priceDisplay, featuredImage, engine, mileage, seatingCapacity, status, type, colours }: {
  name: string; brandName: string; priceDisplay: string; featuredImage: string;
  engine: string; mileage: string; seatingCapacity: string; status: string; type: string;
  colours: Array<{ name: string; hexCode?: string }>;
}) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
        {featuredImage ? (
          <Image src={featuredImage} alt={name || "Vehicle"} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5">
            <Car className="w-10 h-10 text-gray-300" />
            <span className="text-[11px] text-gray-400">No image uploaded</span>
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status === "PUBLISHED" ? "bg-green-500 text-white" : "bg-amber-400 text-white"}`}>
            {status === "PUBLISHED" ? "LIVE" : "DRAFT"}
          </span>
        </div>
        {type && (
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-600/90 text-white backdrop-blur-sm">{type}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[11px] text-blue-600 font-semibold">{brandName || "Brand"}</p>
        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{name || "Vehicle Name"}</p>
        {priceDisplay
          ? <p className="text-sm font-bold text-blue-600 mt-1">{priceDisplay}</p>
          : <p className="text-xs text-gray-400 italic mt-1">Price not set</p>}
        {(engine || mileage || seatingCapacity) && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {engine && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{engine}</span>}
            {mileage && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{mileage}</span>}
            {seatingCapacity && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">{seatingCapacity} Seats</span>}
          </div>
        )}
        {colours.length > 0 && (
          <div className="flex gap-1 mt-2.5 items-center">
            {colours.slice(0, 7).map((c, i) => (
              <div key={i} title={c.name}
                className="w-4 h-4 rounded-full border-2 border-white shadow ring-1 ring-gray-200"
                style={{ backgroundColor: c.hexCode || "#e5e7eb" }}
              />
            ))}
            {colours.length > 7 && <span className="text-[10px] text-gray-400 ml-0.5">+{colours.length - 7}</span>}
          </div>
        )}
      </div>
    </div>
  );
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
    brochureUrl: vehicle?.brochureUrl || "",
    brochureFileId: vehicle?.brochureFileId || "",
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
      if (!d || typeof d !== "object" || Array.isArray(d)) throw new Error("AI returned unexpected data. Try again.");
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
      if (d.features?.length) setFeatures(d.features.map((f: any) => ({ name: typeof f === "string" ? f : (f.name || ""), available: true })));
      if (d.safety?.length) setSafety(d.safety.map((s: any) => ({ name: typeof s === "string" ? s : (s.name || ""), available: true })));
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
      if (saved.slug && saved.slug !== form.slug) set("slug", saved.slug);

      await Promise.all([
        fetch(`/api/admin/vehicles/${vehicleId}/variants`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variants }),
        }),
        fetch(`/api/admin/vehicles/${vehicleId}/colours`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ colours }),
        }),
        fetch(`/api/admin/vehicles/${vehicleId}/images`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images }),
        }),
        fetch(`/api/admin/vehicles/${vehicleId}/faqs`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ faqs }),
        }),
        fetch(`/api/admin/vehicles/${vehicleId}/features`, {
          method: "PUT", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            features: [
              ...features.map((f) => ({ ...f, category: "features" })),
              ...safety.map((s) => ({ ...s, category: "safety" })),
            ],
          }),
        }),
      ]);

      toast.success(isEdit ? "Vehicle updated!" : "Vehicle created!");
      router.push("/admin/vehicles");
      router.refresh();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const completionItems = [
    { label: "Name & Brand", done: !!(form.name && form.brandId) },
    { label: "Category & Type", done: !!(form.categoryId && form.type) },
    { label: "Price", done: !!(form.priceDisplay || form.priceMin) },
    { label: "Description", done: !!(form.shortDescription && form.description) },
    { label: "Images", done: images.length > 0 || !!form.featuredImage },
    { label: "Variants", done: variants.length > 0 },
    { label: "Colours", done: colours.length > 0 },
    { label: "Features (5+)", done: features.length >= 5 },
    { label: "Safety (3+)", done: safety.length >= 3 },
    { label: "SEO", done: !!(seo.metaTitle && seo.metaDescription) },
  ];
  const completedCount = completionItems.filter((i) => i.done).length;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-12 gap-6 items-start">

        {/* ══════════════════════════════════════════
            LEFT — main content
        ══════════════════════════════════════════ */}
        <div className="col-span-8 space-y-6">

          {/* Validation banner */}
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-1">Fix these before publishing:</p>
                  <ul className="text-xs text-red-700 space-y-0.5 list-disc list-inside">
                    {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 1: Vehicle Info ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader icon={Car} title="Vehicle Information" description="Core identity — name, brand, type, category" />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Vehicle Name *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => { set("name", e.target.value); if (!form.slug) set("slug", genSlug(`${brandName} ${e.target.value}`)); }}
                      required placeholder="e.g. Nexon EV Max"
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Vehicle Type *</Label>
                    <Select value={form.type} onValueChange={(v) => set("type", v)}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Brand *</Label>
                    <Select value={form.brandId} onValueChange={(v) => set("brandId", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Category *</Label>
                    <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{filteredCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">URL Slug</Label>
                  <div className="flex gap-2">
                    <Input
                      value={form.slug}
                      onChange={(e) => set("slug", e.target.value)}
                      placeholder="auto-generated from name"
                      className="flex-1 font-mono text-sm h-9"
                    />
                    <Button type="button" variant="outline" size="sm" onClick={autoSlug} className="h-9 shrink-0">
                      <RefreshCw className="w-3.5 h-3.5 mr-1" /> Generate
                    </Button>
                  </div>
                  {form.slug && <p className="text-[11px] text-gray-400">/cars/{form.slug}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Body Type</Label>
                    <Select value={form.bodyType} onValueChange={(v) => set("bodyType", v)}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["SUV", "Sedan", "Hatchback", "MUV", "Crossover", "Convertible", "Pickup", "Van", "Minivan", "Cruiser", "Sports", "Naked", "Adventure", "Commuter"].map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Segment</Label>
                    <Input value={form.segment} onChange={(e) => set("segment", e.target.value)} placeholder="e.g. Premium SUV" className="h-9" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 2: Pricing ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader icon={DollarSign} title="Pricing" description="Price range and display text" />
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Price Display</Label>
                  <Input value={form.priceDisplay} onChange={(e) => set("priceDisplay", e.target.value)} placeholder="e.g. ₹8.50 - ₹14.00 Lakh" className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Min Price (Lakhs)</Label>
                    <Input type="number" step="0.01" value={form.priceMin} onChange={(e) => set("priceMin", e.target.value)} placeholder="8.50" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Max Price (Lakhs)</Label>
                    <Input type="number" step="0.01" value={form.priceMax} onChange={(e) => set("priceMax", e.target.value)} placeholder="14.00" className="h-9" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Ex-Showroom (₹)</Label>
                    <Input type="number" value={form.exShowroomPrice} onChange={(e) => set("exShowroomPrice", e.target.value)} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">On-Road Price (₹)</Label>
                    <Input type="number" value={form.onRoadPrice} onChange={(e) => set("onRoadPrice", e.target.value)} className="h-9" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 3: Performance & Specs ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader icon={Zap} title="Performance & Specs" description="Engine, power, drivetrain, mileage" />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Engine</Label>
                  <Input value={form.engine} onChange={(e) => set("engine", e.target.value)} placeholder="1.2L Turbo" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Power</Label>
                  <Input value={form.power} onChange={(e) => set("power", e.target.value)} placeholder="120 bhp" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Torque</Label>
                  <Input value={form.torque} onChange={(e) => set("torque", e.target.value)} placeholder="170 Nm" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Mileage</Label>
                  <Input value={form.mileage} onChange={(e) => set("mileage", e.target.value)} placeholder="18.4 kmpl" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Top Speed</Label>
                  <Input value={form.topSpeed} onChange={(e) => set("topSpeed", e.target.value)} placeholder="180 km/h" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">0–100 km/h</Label>
                  <Input value={form.acceleration} onChange={(e) => set("acceleration", e.target.value)} placeholder="8.5 sec" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Drivetrain</Label>
                  <Select value={form.drivetrainType} onValueChange={(v) => set("drivetrainType", v)}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{["FWD", "RWD", "AWD", "4WD"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Seating Capacity</Label>
                  <Input type="number" value={form.seatingCapacity} onChange={(e) => set("seatingCapacity", e.target.value)} placeholder="5" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Vehicle Warranty</Label>
                  <Input value={form.vehicleWarranty} onChange={(e) => set("vehicleWarranty", e.target.value)} placeholder="3 yrs / 1,00,000 km" className="h-9" />
                </div>
              </div>

              {showEV && (
                <>
                  <Separator className="my-5" />
                  <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">Electric / Battery</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Battery Capacity</Label>
                      <Input value={form.batteryCapacity} onChange={(e) => set("batteryCapacity", e.target.value)} placeholder="40.5 kWh" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Driving Range</Label>
                      <Input value={form.range} onChange={(e) => set("range", e.target.value)} placeholder="465 km (ARAI)" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Motor Power</Label>
                      <Input value={form.motorPower} onChange={(e) => set("motorPower", e.target.value)} placeholder="143 PS" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Motor Torque</Label>
                      <Input value={form.motorTorque} onChange={(e) => set("motorTorque", e.target.value)} placeholder="250 Nm" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">AC Charging Time</Label>
                      <Input value={form.acChargingTime} onChange={(e) => set("acChargingTime", e.target.value)} placeholder="8.8 hrs" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">DC Fast Charging</Label>
                      <Input value={form.dcChargingTime} onChange={(e) => set("dcChargingTime", e.target.value)} placeholder="56 min (80%)" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Charging Port Type</Label>
                      <Input value={form.chargingPortType} onChange={(e) => set("chargingPortType", e.target.value)} placeholder="CCS2 / CHAdeMO" className="h-9" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-gray-700">Battery Warranty</Label>
                      <Input value={form.batteryWarranty} onChange={(e) => set("batteryWarranty", e.target.value)} placeholder="8 yrs / 1,60,000 km" className="h-9" />
                    </div>
                    <div className="flex items-center gap-2 pt-5">
                      <Switch id="fastCharging" checked={form.fastCharging} onCheckedChange={(v) => set("fastCharging", v)} />
                      <Label htmlFor="fastCharging" className="text-xs">Fast Charging</Label>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── SECTION 4: Content ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader
                icon={FileText}
                title="Content"
                description="Descriptions, highlights, pros & cons"
                action={
                  <Button type="button" variant="outline" size="sm" onClick={() => generateAI("description")} disabled={!!aiLoading} className="h-8 text-xs">
                    {aiLoading === "description" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Write
                  </Button>
                }
              />
              <div className="space-y-5">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Short Description * <span className="text-gray-400">(listing cards)</span></Label>
                  <Textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} rows={2} placeholder="One-liner for listing pages" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Full Description *</Label>
                  <RichTextEditor value={form.description} onChange={(val) => set("description", val)} placeholder="Detailed description…" minHeight={260} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between mb-1">
                    <Label className="text-xs font-medium text-gray-700">Overview</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => generateAI("overview")} disabled={!!aiLoading} className="h-7 text-xs">
                      {aiLoading === "overview" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI
                    </Button>
                  </div>
                  <RichTextEditor value={form.overview} onChange={(val) => set("overview", val)} placeholder="Overview shown above specs…" minHeight={180} />
                </div>

                <Separator />

                {/* Key Highlights */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Key Highlights</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => generateAI("highlights")} disabled={!!aiLoading} className="h-7 text-xs">
                        {aiLoading === "highlights" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setKeyHighlights((p) => [...p, ""])} className="h-7 text-xs">
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {keyHighlights.map((h, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={h} onChange={(e) => setKeyHighlights((p) => p.map((x, j) => j === i ? e.target.value : x))} placeholder={`Highlight ${i + 1}`} className="h-8 text-sm" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => setKeyHighlights((p) => p.filter((_, j) => j !== i))} className="h-8 w-8 p-0"><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Pros & Cons */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-green-700 uppercase tracking-wide">Pros <span className="text-gray-400 font-normal">(min 3)</span></Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => generateAI("pros")} disabled={!!aiLoading} className="h-7 text-xs"><Wand2 className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setPros((p) => [...p, ""])} className="h-7 text-xs"><Plus className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {pros.map((p, i) => (
                        <div key={i} className="flex gap-1.5">
                          <Input value={p} onChange={(e) => setPros((prev) => prev.map((x, j) => j === i ? e.target.value : x))} className="text-sm h-8" placeholder="e.g. Spacious boot" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setPros((prev) => prev.filter((_, j) => j !== i))} className="h-8 w-8 p-0"><X className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs font-semibold text-red-700 uppercase tracking-wide">Cons <span className="text-gray-400 font-normal">(min 3)</span></Label>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="sm" onClick={() => generateAI("cons")} disabled={!!aiLoading} className="h-7 text-xs"><Wand2 className="w-3 h-3" /></Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => setCons((p) => [...p, ""])} className="h-7 text-xs"><Plus className="w-3 h-3" /></Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {cons.map((c, i) => (
                        <div key={i} className="flex gap-1.5">
                          <Input value={c} onChange={(e) => setCons((prev) => prev.map((x, j) => j === i ? e.target.value : x))} className="text-sm h-8" placeholder="e.g. Expensive on-road" />
                          <Button type="button" variant="ghost" size="sm" onClick={() => setCons((prev) => prev.filter((_, j) => j !== i))} className="h-8 w-8 p-0"><X className="w-3 h-3" /></Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 5: Media ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader icon={ImageIcon} title="Media" description="Featured image, gallery & colours" />

              {/* Featured Image */}
              <div className="mb-5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">Featured Image <span className="text-gray-400 font-normal normal-case">(1200×630 for OG)</span></Label>
                {form.featuredImage ? (
                  <div className="relative h-44 rounded-xl overflow-hidden bg-gray-100 mb-2">
                    <Image src={form.featuredImage} alt="Featured" fill className="object-cover" />
                    <button type="button" onClick={() => { set("featuredImage", ""); set("featuredFileId", ""); }}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 justify-center cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-6 py-8 hover:bg-gray-50 transition-colors mb-2">
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">{uploading ? "Uploading…" : "Upload featured image"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFeaturedImageUpload} disabled={uploading} />
                  </label>
                )}
                <Input placeholder="Or paste image URL" value={form.featuredImage} onChange={(e) => set("featuredImage", e.target.value)} className="h-8 text-sm" />
              </div>

              <Separator className="my-5" />

              {/* Gallery */}
              <div className="mb-5">
                <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-2">Gallery Images</Label>
                <label className="flex flex-col items-center gap-1.5 cursor-pointer border-2 border-dashed border-gray-200 rounded-xl px-6 py-6 hover:bg-gray-50 transition-colors mb-3">
                  <ImageIcon className="w-7 h-7 text-gray-400" />
                  <span className="text-sm text-gray-500 font-medium">{uploading ? "Uploading…" : "Click to upload gallery images"}</span>
                  <span className="text-xs text-gray-400">Multiple files · JPG, PNG, WebP</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden bg-gray-100">
                        <Image src={img.url} alt={`Image ${i + 1}`} width={120} height={90} className="object-cover w-full h-20" />
                        <button type="button" onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="my-5" />

              {/* Colours */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Colours</Label>
                  <Button type="button" variant="outline" size="sm" onClick={() => setColours((p) => [...p, { name: "", hexCode: "#FFFFFF" }])} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Colour
                  </Button>
                </div>
                <div className="space-y-2">
                  {colours.map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="color" value={c.hexCode || "#000000"} onChange={(e) => setColours((p) => p.map((x, j) => j === i ? { ...x, hexCode: e.target.value } : x))} className="w-9 h-9 rounded cursor-pointer border border-gray-200 p-0.5" />
                      <Input value={c.hexCode || ""} onChange={(e) => setColours((p) => p.map((x, j) => j === i ? { ...x, hexCode: e.target.value } : x))} placeholder="#FFFFFF" className="w-24 h-9 text-xs font-mono" />
                      <Input value={c.name} onChange={(e) => setColours((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Colour name" className="flex-1 h-9" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setColours((p) => p.filter((_, j) => j !== i))} className="h-9 w-9 p-0"><X className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 6: Features & Safety ── */}
          <div className="grid grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Key Features <span className="text-gray-400 font-normal">(min 5)</span></h3>
                      <p className="text-xs text-gray-500 mt-0.5">Comfort, infotainment, convenience</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setFeatures((p) => [...p, { name: "", available: true }])} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {features.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No features. Add manually or use AI Autofill.</p>
                  )}
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Switch checked={f.available} onCheckedChange={(v) => setFeatures((p) => p.map((x, j) => j === i ? { ...x, available: v } : x))} />
                      <Input value={f.name} onChange={(e) => setFeatures((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. Sunroof, CarPlay" className="flex-1 text-xs h-8" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFeatures((p) => p.filter((_, j) => j !== i))} className="h-8 w-8 p-0"><X className="w-3 h-3 text-red-500" /></Button>
                    </div>
                  ))}
                  {features.length < 5 && features.length > 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">Need {5 - features.length} more to publish</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Safety Features <span className="text-gray-400 font-normal">(min 3)</span></h3>
                      <p className="text-xs text-gray-500 mt-0.5">ADAS, airbags, braking</p>
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setSafety((p) => [...p, { name: "", available: true }])} className="h-7 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {safety.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No safety features yet.</p>
                  )}
                  {safety.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Switch checked={s.available} onCheckedChange={(v) => setSafety((p) => p.map((x, j) => j === i ? { ...x, available: v } : x))} />
                      <Input value={s.name} onChange={(e) => setSafety((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. 6 Airbags, ABS" className="flex-1 text-xs h-8" />
                      <Button type="button" variant="ghost" size="sm" onClick={() => setSafety((p) => p.filter((_, j) => j !== i))} className="h-8 w-8 p-0"><X className="w-3 h-3 text-red-500" /></Button>
                    </div>
                  ))}
                  {safety.length < 3 && safety.length > 0 && (
                    <p className="text-[11px] text-amber-600 mt-1">Need {3 - safety.length} more to publish</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── SECTION 7: Variants ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader
                icon={Settings2}
                title="Variants"
                description="Trims, grades and their prices"
                action={
                  <Button type="button" variant="outline" size="sm" onClick={() => setVariants((p) => [...p, { name: "", priceDisplay: "", fuelType: "", transmission: "" }])} className="h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Add Variant
                  </Button>
                }
              />
              {variants.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No variants yet.</p>}
              <div className="space-y-3">
                {variants.map((v, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-[11px]">Variant {i + 1}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setVariants((p) => p.filter((_, j) => j !== i))} className="h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-2 space-y-1">
                        <Label className="text-[11px] text-gray-500">Name *</Label>
                        <Input value={v.name} onChange={(e) => setVariants((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="e.g. Base, Top" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">Price</Label>
                        <Input value={v.priceDisplay || ""} onChange={(e) => setVariants((p) => p.map((x, j) => j === i ? { ...x, priceDisplay: e.target.value } : x))} placeholder="₹9.50 L" className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">Fuel</Label>
                        <Select value={v.fuelType || ""} onValueChange={(val) => setVariants((p) => p.map((x, j) => j === i ? { ...x, fuelType: val } : x))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{["Petrol", "Diesel", "CNG", "LPG", "Electric", "Hybrid", "Mild Hybrid"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] text-gray-500">Transmission</Label>
                        <Select value={v.transmission || ""} onValueChange={(val) => setVariants((p) => p.map((x, j) => j === i ? { ...x, transmission: val } : x))}>
                          <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>{["Manual", "Automatic", "CVT", "DCT", "AMT", "IMT"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 8: FAQs ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader
                icon={HelpCircle}
                title="FAQs"
                description="Frequently asked questions"
                action={
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => generateAI("faqs")} disabled={!!aiLoading} className="h-8 text-xs">
                      {aiLoading === "faqs" ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => setFaqs((p) => [...p, { question: "", answer: "" }])} className="h-8 text-xs">
                      <Plus className="w-3 h-3 mr-1" /> Add
                    </Button>
                  </div>
                }
              />
              {faqs.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No FAQs yet. Use AI Generate or add manually.</p>}
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <Badge variant="outline" className="text-[11px]">Q{i + 1}</Badge>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setFaqs((p) => p.filter((_, j) => j !== i))} className="h-7 w-7 p-0"><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                    </div>
                    <div className="space-y-2">
                      <Input value={faq.question} onChange={(e) => setFaqs((p) => p.map((x, j) => j === i ? { ...x, question: e.target.value } : x))} placeholder="Question…" className="h-8 text-sm" />
                      <Textarea value={faq.answer} onChange={(e) => setFaqs((p) => p.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))} rows={2} placeholder="Answer…" className="text-sm resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ── SECTION 9: SEO ── */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <SectionHeader
                icon={Globe}
                title="SEO"
                description="Search & social appearance"
                action={
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => generateAI("seo_title")} disabled={!!aiLoading} className="h-8 text-xs">
                      {aiLoading === "seo_title" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Title
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => generateAI("seo_description")} disabled={!!aiLoading} className="h-8 text-xs">
                      {aiLoading === "seo_description" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 mr-1" />} AI Desc
                    </Button>
                  </div>
                }
              />
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Meta Title * <span className="text-gray-400">(50–60 chars)</span></Label>
                  <Input value={seo.metaTitle} onChange={(e) => setSeoField("metaTitle", e.target.value)} placeholder={`${form.name} Price, Specs & Review | Walley`} maxLength={80} className="h-9" />
                  <p className={`text-[11px] ${seo.metaTitle.length > 60 ? "text-amber-500" : "text-gray-400"}`}>{seo.metaTitle.length}/80</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">Meta Description * <span className="text-gray-400">(150–160 chars)</span></Label>
                  <Textarea value={seo.metaDescription} onChange={(e) => setSeoField("metaDescription", e.target.value)} rows={3} maxLength={200} className="resize-none" />
                  <p className={`text-[11px] ${seo.metaDescription.length > 160 ? "text-amber-500" : "text-gray-400"}`}>{seo.metaDescription.length}/200</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Meta Keywords</Label>
                    <Input value={seo.metaKeywords} onChange={(e) => setSeoField("metaKeywords", e.target.value)} placeholder="keyword1, keyword2" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">Canonical URL</Label>
                    <Input value={seo.canonicalUrl} onChange={(e) => setSeoField("canonicalUrl", e.target.value)} placeholder={`https://testdrivefirst.com/cars/${form.slug}`} className="h-9" />
                  </div>
                </div>
                <Separator />
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Open Graph</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">OG Title</Label>
                    <Input value={seo.ogTitle} onChange={(e) => setSeoField("ogTitle", e.target.value)} placeholder={seo.metaTitle || form.name} className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-gray-700">OG Description</Label>
                    <Input value={seo.ogDescription} onChange={(e) => setSeoField("ogDescription", e.target.value)} className="h-9" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-gray-700">OG Image <span className="text-gray-400">(1200×630px)</span></Label>
                  <Input value={seo.ogImage} onChange={(e) => setSeoField("ogImage", e.target.value)} placeholder={form.featuredImage || "https://…"} className="h-9" />
                </div>

                <Separator className="my-2" />

                {/* Live Previews */}
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-4">Live Previews</p>
                  <SeoLivePreview
                    title={seo.metaTitle}
                    description={seo.metaDescription}
                    slug={form.slug}
                    ogTitle={seo.ogTitle}
                    ogDescription={seo.ogDescription}
                    ogImage={seo.ogImage || form.featuredImage}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* ══════════════════════════════════════════
            RIGHT — sticky sidebar
        ══════════════════════════════════════════ */}
        <div className="col-span-4 sticky top-6 space-y-4">

          {/* Vehicle Card Preview */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-0.5">Listing Card Preview</p>
            <VehicleCardPreview
              name={form.name}
              brandName={brandName}
              priceDisplay={form.priceDisplay}
              featuredImage={form.featuredImage}
              engine={form.engine}
              mileage={form.type === "EV" ? form.range : form.mileage}
              seatingCapacity={form.seatingCapacity}
              status={form.status}
              type={form.type}
              colours={colours}
            />
          </div>

          {/* Actions */}
          <Card className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardContent className="p-5 space-y-2.5">
              <Button type="submit" className="w-full h-10 bg-blue-600 hover:bg-blue-700 font-semibold" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {isEdit ? "Update Vehicle" : "Save as Draft"}
              </Button>
              {form.status !== "PUBLISHED" && (
                <Button type="button" className="w-full h-10 bg-green-600 hover:bg-green-700 font-semibold" disabled={saving}
                  onClick={(e) => { e.preventDefault(); handleSubmit(e as any, "PUBLISHED"); }}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Publish
                </Button>
              )}
              {form.status === "PUBLISHED" && (
                <Button type="button" variant="outline" className="w-full h-10 text-amber-600 border-amber-200 hover:bg-amber-50" disabled={saving}
                  onClick={(e) => { e.preventDefault(); handleSubmit(e as any, "DRAFT"); }}>
                  Unpublish to Draft
                </Button>
              )}
              <Button type="button" variant="ghost" className="w-full h-9 text-gray-500" onClick={() => router.back()} disabled={saving}>
                Cancel
              </Button>
              {isEdit && (
                <p className="text-[11px] text-center text-gray-400 pt-1">
                  Last saved: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* AI Autofill */}
          <Card className="shadow-sm border-violet-200 bg-gradient-to-b from-violet-50 to-white">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="font-semibold text-violet-900 text-sm">AI Autofill</p>
              </div>
              <p className="text-xs text-violet-700 mb-3 leading-relaxed">Enter name + brand → auto-fill specs, content, features, FAQs & SEO in one shot.</p>
              <Button type="button" onClick={autofillAll} disabled={autofilling || !form.name || !form.brandId} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-9">
                {autofilling ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> Filling…</> : <><Sparkles className="w-3.5 h-3.5 mr-2" /> Autofill Everything</>}
              </Button>
            </CardContent>
          </Card>

          {/* Status & Settings */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Status & Settings</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Status</Label>
                  <Select value={form.status} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Availability</Label>
                  <Select value={form.availabilityStatus} onValueChange={(v) => set("availabilityStatus", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Launch Date</Label>
                  <Input type="date" value={form.launchDate} onChange={(e) => set("launchDate", e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-600">Video URL</Label>
                  <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="YouTube URL" className="h-9 text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Labels / Toggles */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Labels</p>
              <div className="space-y-3">
                {[
                  { key: "featured", label: "Featured", desc: "Show in featured section" },
                  { key: "isPopular", label: "Popular", desc: "Show in popular listing" },
                  { key: "isNew", label: "New Launch", desc: "New arrival badge" },
                  { key: "isUpcoming", label: "Upcoming", desc: "Not yet launched" },
                  { key: "isElectric", label: "Electric", desc: "Electric vehicle" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{label}</p>
                      <p className="text-[11px] text-gray-400">{desc}</p>
                    </div>
                    <Switch id={key} checked={(form as any)[key]} onCheckedChange={(v) => set(key, v)} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Publish Checklist */}
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Publish Checklist</p>
                <span className="text-xs font-bold text-blue-600">{completedCount}/{completionItems.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(completedCount / completionItems.length) * 100}%` }} />
              </div>
              <div className="space-y-1.5">
                {completionItems.map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-green-500" : "bg-gray-200"}`}>
                      {done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>
                    <span className={`text-xs ${done ? "text-gray-700" : "text-gray-400"}`}>{label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </form>
  );
}
