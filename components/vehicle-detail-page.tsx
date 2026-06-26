"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield, CheckCircle, XCircle, ChevronRight,
  ThumbsUp, ThumbsDown, Star,
  Droplets, Wind, Zap, Settings2, Gauge, BatteryCharging,
  Phone, BadgeCheck, ArrowRight, Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EMICalculator } from "@/components/emi-calculator";
import OfferPopup from "@/components/forms/OfferPopup";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface Vehicle {
  id: string; name: string; slug: string; type: string;
  brandId: string;
  priceMin: number | null; priceMax: number | null;
  priceDisplay: string | null; exShowroomPrice: number | null;
  onRoadPrice: number | null; description: string | null;
  overview: string | null; keyHighlights: string[];
  pros: string[]; cons: string[]; mileage: string | null;
  topSpeed: string | null; engine: string | null; power: string | null;
  torque: string | null; range: string | null; batteryCapacity: string | null;
  motorPower: string | null; isElectric: boolean; isPopular: boolean; isNew: boolean;
  brand: { name: string; slug: string; logo?: string | null };
  category: { name: string; slug: string };
  variants: Array<{
    id: string; name: string; priceDisplay: string | null;
    fuelType: string | null; transmission: string | null;
    mileage: string | null; range: string | null;
    engine: string | null; power: string | null;
  }>;
  images: Array<{ id: string; url: string; alt: string | null; type: string }>;
  colours: Array<{ id: string; name: string; hexCode: string | null; imageUrl: string | null }>;
  specGroups: Array<{
    id: string; group: { name: string };
    specValues: Array<{ specItem: { name: string; unit: string | null }; value: string }>;
  }>;
  features: Array<{ id: string; category: string; name: string; available: boolean }>;
  faqs: Array<{ id: string; question: string; answer: string }>;
}

interface Props {
  vehicle: Vehicle;
  similar: Array<{
    id: string; name: string; slug: string; type: string;
    priceDisplay: string | null;
    brand: { name: string; slug: string };
    images: Array<{ url: string }>;
  }>;
  vehicleType: "car" | "bike" | "scooter" | "ev" | "commercial";
}

function typeToPath(type: string) {
  if (type === "BIKE" || type === "SCOOTER") return "bikes";
  if (type === "EV") return "ev";
  if (type === "COMMERCIAL") return "commercial";
  return "cars";
}

function FuelBadge({ fuel }: { fuel: string }) {
  const f = fuel.toLowerCase();
  if (f.includes("electric") || f === "ev")
    return <span className="flex items-center gap-1 text-xs text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded-full"><Zap className="w-3 h-3" />{fuel}</span>;
  if (f.includes("cng") || f.includes("lpg"))
    return <span className="flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full"><Wind className="w-3 h-3" />{fuel}</span>;
  return <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full"><Droplets className="w-3 h-3" />{fuel}</span>;
}

export function VehicleDetailPage({ vehicle, similar, vehicleType }: Props) {
  const [offerOpen, setOfferOpen]       = useState(false);
  const [activeImage, setActiveImage]   = useState(0);
  const [activeColour, setActiveColour] = useState(-1);
  const [shareOpen, setShareOpen]       = useState(false);
  const [copied, setCopied]             = useState(false);
  const isEV = vehicle.isElectric || vehicle.type === "EV";

  function getShareUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }
  function shareWhatsApp() {
    const url  = getShareUrl();
    const text = `Check out the ${vehicle.brand.name} ${vehicle.name} on Walley! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    setShareOpen(false);
  }
  function copyLink() {
    navigator.clipboard.writeText(getShareUrl()).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    setShareOpen(false);
  }

  const mainImage =
    activeColour >= 0
      ? vehicle.colours[activeColour]?.imageUrl || vehicle.images[activeImage]?.url || "/placeholder.svg"
      : vehicle.images[activeImage]?.url || "/placeholder.svg";

  const featureGroups = vehicle.features.reduce<Record<string, typeof vehicle.features>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  const categoryPath = vehicleType === "car" ? "/cars" : `/${vehicleType}s`;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb strip */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/" className="text-gray-400 hover:text-blue-700 text-xs">Home</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={categoryPath} className="text-gray-400 hover:text-blue-700 text-xs">{vehicle.category.name}</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbLink href={`${categoryPath}?brand=${vehicle.brand.slug}`} className="text-gray-400 hover:text-blue-700 text-xs">{vehicle.brand.name}</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage className="text-xs font-medium">{vehicle.name}</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left / Main ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="relative h-64 sm:h-80 md:h-[400px] bg-slate-50">
                <Image
                  src={mainImage} alt={vehicle.name} fill priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                  {vehicle.isNew && <Badge className="bg-emerald-500 text-white border-0">New</Badge>}
                  {vehicle.isPopular && <Badge className="bg-blue-600 text-white border-0">Popular</Badge>}
                  {isEV && <Badge className="bg-teal-500 text-white border-0"><Zap className="w-3 h-3 mr-0.5" />Electric</Badge>}
                </div>

                {/* Counter */}
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {activeImage + 1} / {vehicle.images.length}
                </div>

                {/* Share */}
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => setShareOpen((p) => !p)}
                    className="w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-sm"
                  >
                    <Share2 className="w-4 h-4 text-gray-600" />
                  </button>
                  {shareOpen && (
                    <div className="absolute top-10 right-0 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 min-w-[160px]">
                      <button
                        onClick={shareWhatsApp}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-500 shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        WhatsApp
                      </button>
                      <button
                        onClick={copyLink}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current shrink-0" fill="none" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {vehicle.images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                  {vehicle.images.slice(0, 8).map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => { setActiveImage(i); setActiveColour(-1); }}
                      className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImage === i && activeColour < 0
                          ? "border-blue-600 shadow-sm"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <Image src={img.url} alt={`View ${i + 1}`} width={64} height={48} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick spec bar */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-gray-100">
                {[
                  { label: isEV ? "Range" : "Mileage", value: isEV ? vehicle.range : vehicle.mileage, icon: isEV ? BatteryCharging : Gauge, color: "text-teal-600" },
                  { label: "Engine",  value: vehicle.engine,    icon: Zap,      color: "text-blue-600" },
                  { label: "Power",   value: vehicle.power,     icon: Zap,      color: "text-blue-600" },
                  { label: "Torque",  value: vehicle.torque,    icon: Settings2,color: "text-purple-600" },
                ].filter(s => s.value).map((s) => (
                  <div key={s.label} className="pl-4 first:pl-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <s.icon className={`w-3 h-3 ${s.color}`} />
                      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
                    </div>
                    <p className="font-bold text-sm text-slate-900">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <Tabs defaultValue="overview">
                <TabsList className="w-full rounded-none border-b border-gray-100 bg-slate-50 h-auto p-0 justify-start overflow-x-auto">
                  {["overview", "specs", "features", "variants", "colours", "emi"].map((t) => (
                    <TabsTrigger
                      key={t}
                      value={t}
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-700 data-[state=active]:text-blue-700 data-[state=active]:bg-white px-5 py-3 text-sm font-semibold text-gray-500 capitalize whitespace-nowrap"
                    >
                      {t === "emi" ? "EMI" : t.charAt(0).toUpperCase() + t.slice(1)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {/* Overview */}
                <TabsContent value="overview" className="p-5 space-y-5 m-0">
                  {(vehicle.overview || vehicle.description) && (
                    <p className="text-gray-600 leading-relaxed text-sm">{vehicle.overview || vehicle.description}</p>
                  )}
                  {vehicle.keyHighlights?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-blue-600" /> Key Highlights
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {vehicle.keyHighlights.map((h, i) => (
                          <li key={i} className="flex gap-2 items-start bg-blue-50 rounded-xl px-3 py-2">
                            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <span className="text-sm text-slate-700">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(vehicle.pros?.length > 0 || vehicle.cons?.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      {vehicle.pros?.length > 0 && (
                        <div className="bg-emerald-50 rounded-2xl p-4">
                          <h3 className="font-bold text-sm text-emerald-800 flex items-center gap-2 mb-3">
                            <ThumbsUp className="w-4 h-4" /> What's Great
                          </h3>
                          <ul className="space-y-2">
                            {vehicle.pros.map((p, i) => (
                              <li key={i} className="flex gap-2 text-sm text-emerald-800">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />{p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {vehicle.cons?.length > 0 && (
                        <div className="bg-red-50 rounded-2xl p-4">
                          <h3 className="font-bold text-sm text-red-800 flex items-center gap-2 mb-3">
                            <ThumbsDown className="w-4 h-4" /> What Could Be Better
                          </h3>
                          <ul className="space-y-2">
                            {vehicle.cons.map((c, i) => (
                              <li key={i} className="flex gap-2 text-sm text-red-800">
                                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />{c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Specs */}
                <TabsContent value="specs" className="p-5 m-0">
                  {vehicle.specGroups.length > 0 ? (
                    vehicle.specGroups.map((sg) => (
                      <div key={sg.id} className="mb-6 last:mb-0">
                        <h3 className="font-bold text-sm bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 mb-3 text-slate-900">
                          {sg.group.name}
                        </h3>
                        <div className="divide-y divide-gray-50">
                          {sg.specValues.map((sv) => (
                            <div key={sv.specItem.name} className="flex justify-between py-2.5 px-2 text-sm">
                              <span className="text-gray-500">{sv.specItem.name}</span>
                              <span className="font-semibold text-slate-800">
                                {sv.value}{sv.specItem.unit ? ` ${sv.specItem.unit}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No specifications available yet</p>
                  )}
                </TabsContent>

                {/* Features */}
                <TabsContent value="features" className="p-5 m-0">
                  {Object.entries(featureGroups).length > 0 ? (
                    Object.entries(featureGroups).map(([cat, feats]) => (
                      <div key={cat} className="mb-5 last:mb-0">
                        <h3 className="font-bold text-sm bg-slate-50 border border-gray-100 rounded-xl px-4 py-2 mb-3 text-slate-900">{cat}</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {feats.map((f) => (
                            <div key={f.id} className="flex items-center gap-2.5 text-sm py-1">
                              {f.available
                                ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                : <XCircle className="w-4 h-4 text-gray-200 shrink-0" />}
                              <span className={f.available ? "text-slate-700" : "text-gray-400"}>{f.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No features data available</p>
                  )}
                </TabsContent>

                {/* Variants */}
                <TabsContent value="variants" className="p-5 m-0">
                  {vehicle.variants.length > 0 ? (
                    <div className="space-y-3">
                      {vehicle.variants.map((v) => (
                        <div key={v.id} className="border border-gray-100 rounded-2xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-slate-900 mb-2">{v.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                {v.fuelType && <FuelBadge fuel={v.fuelType} />}
                                {v.transmission && (
                                  <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                    <Settings2 className="w-3 h-3" />{v.transmission}
                                  </span>
                                )}
                                {(v.mileage || v.range) && (
                                  <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full">
                                    {isEV ? <BatteryCharging className="w-3 h-3 text-teal-500" /> : <Gauge className="w-3 h-3" />}
                                    {isEV ? v.range : v.mileage}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-blue-700 text-base">{v.priceDisplay || "—"}</p>
                              <Button
                                size="sm"
                                className="mt-2 bg-blue-700 hover:bg-blue-800 text-white h-8 text-xs px-3"
                                onClick={() => setOfferOpen(true)}
                              >
                                Get Quote
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No variants available</p>
                  )}
                </TabsContent>

                {/* Colours */}
                <TabsContent value="colours" className="p-5 m-0">
                  {vehicle.colours.length > 0 ? (
                    <div className="space-y-5">
                      {vehicle.colours[activeColour >= 0 ? activeColour : 0]?.imageUrl && (
                        <div className="relative h-48 bg-slate-50 rounded-2xl overflow-hidden border border-gray-100">
                          <Image
                            src={vehicle.colours[activeColour >= 0 ? activeColour : 0].imageUrl!}
                            alt="Colour variant"
                            fill className="object-contain"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                          />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-3">
                          {activeColour >= 0 ? vehicle.colours[activeColour].name : "Select a colour"}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {vehicle.colours.map((c, i) => (
                            <button
                              key={c.id}
                              onClick={() => setActiveColour(i)}
                              title={c.name}
                              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${
                                activeColour === i
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-transparent hover:border-gray-200"
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border border-gray-200 shadow-sm"
                                style={{ backgroundColor: c.hexCode || "#ccc" }}
                              />
                              <span className="text-[10px] text-gray-500 max-w-[60px] text-center leading-tight">{c.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm text-center py-8">No colour information available</p>
                  )}
                </TabsContent>

                {/* EMI */}
                <TabsContent value="emi" className="m-0">
                  <EMICalculator carPrice={(vehicle.priceMin || 0) * 100000} carName={vehicle.name} />
                </TabsContent>
              </Tabs>
            </div>

            {/* FAQs */}
            {vehicle.faqs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {vehicle.faqs.map((faq) => (
                    <AccordionItem key={faq.id} value={faq.id} className="border border-gray-100 rounded-xl px-4 data-[state=open]:border-blue-200 data-[state=open]:bg-blue-50/30">
                      <AccordionTrigger className="text-sm font-semibold py-3 hover:text-blue-700 hover:no-underline text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 text-sm pb-3 leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="space-y-4">
            {/* Main CTA card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
              <div className="flex items-center gap-2 mb-1">
                {vehicle.brand.logo && (
                  <Image src={vehicle.brand.logo} alt={vehicle.brand.name} width={24} height={24} className="object-contain" />
                )}
                <span className="text-xs font-semibold text-gray-400">{vehicle.brand.name}</span>
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 leading-tight mb-1">{vehicle.name}</h1>
              <p className="text-3xl font-black text-blue-700 mt-2 leading-none">
                {vehicle.priceDisplay || "Price on request"}
              </p>
              {vehicle.exShowroomPrice && (
                <p className="text-xs text-gray-400 mt-1">
                  Ex-showroom: ₹{(vehicle.exShowroomPrice / 100000).toFixed(2)} Lakh
                </p>
              )}

              <div className="space-y-2 mt-5">
                <Button
                  className="w-full bg-blue-700 hover:bg-blue-800 h-11 font-bold text-sm gap-2"
                  onClick={() => setOfferOpen(true)}
                >
                  Check Best Offers <ArrowRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="w-full h-10 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-400 font-semibold text-sm gap-2">
                  <Phone className="w-4 h-4" /> Book Test Drive
                </Button>
              </div>

              {/* Quick specs */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-gray-100">
                {[
                  { label: isEV ? "Range" : "Mileage", value: isEV ? vehicle.range : vehicle.mileage },
                  { label: "Engine", value: vehicle.engine },
                  { label: "Power",  value: vehicle.power },
                  { label: "Torque", value: vehicle.torque },
                ].filter(s => s.value).map((s) => (
                  <div key={s.label}>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</p>
                    <p className="font-bold text-sm text-slate-900 mt-0.5">{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Similar Vehicles */}
            {similar.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
                  Similar Vehicles
                  <Link href={categoryPath} className="text-xs text-blue-700 font-semibold hover:underline">
                    View all
                  </Link>
                </h2>
                <div className="space-y-2">
                  {similar.slice(0, 5).map((s) => {
                    const path = `/${typeToPath(s.type)}/${s.brand.slug}/${s.slug}`;
                    return (
                      <Link
                        key={s.id}
                        href={path}
                        className="flex gap-3 items-center p-2 rounded-xl hover:bg-blue-50 transition-colors group"
                      >
                        <div className="w-16 h-12 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                          <Image
                            src={s.images[0]?.url || "/placeholder.svg"} alt={s.name} fill
                            className="object-cover group-hover:scale-105 transition-transform"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1 group-hover:text-blue-700 transition-colors">{s.name}</p>
                          <p className="text-xs text-blue-700 font-bold">{s.priceDisplay || "—"}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <OfferPopup isOpen={offerOpen} onClose={() => setOfferOpen(false)} carName={vehicle.name} vehicleType={vehicleType} brandId={vehicle.brandId} />
    </div>
  );
}
