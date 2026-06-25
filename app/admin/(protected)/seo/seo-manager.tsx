"use client";

import { useState, useMemo, type ReactNode } from "react";
import {
  Globe, CheckCircle, XCircle, Search, X, ChevronRight,
  ExternalLink, Wand2, Save, Loader2, Settings,
} from "lucide-react";

type SeoRecord = {
  id?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  schema?: any;
};

type VehicleItem = {
  id: string; name: string; slug: string; type: string;
  brand: { name: string } | null;
  seo: SeoRecord | null;
};

type ContentItem = {
  id: string; title: string; slug: string; status: string;
  seo: SeoRecord | null;
};

type BrandItem = {
  id: string; name: string; slug: string;
  seo: SeoRecord | null;
};

interface Props {
  vehicles: VehicleItem[];
  news: ContentItem[];
  blogs: ContentItem[];
  brands: BrandItem[];
  globalSettings: Record<string, string>;
}

const TABS = ["overview", "vehicles", "news", "blogs", "brands", "global"] as const;
type Tab = (typeof TABS)[number];

function seoScore(seo: SeoRecord | null): number {
  if (!seo) return 0;
  let s = 0;
  if (seo.metaTitle) { s += 25; if (seo.metaTitle.length >= 40 && seo.metaTitle.length <= 70) s += 10; }
  if (seo.metaDescription) { s += 25; if (seo.metaDescription.length >= 120 && seo.metaDescription.length <= 165) s += 10; }
  if (seo.ogImage) s += 15;
  if (seo.metaKeywords) s += 10;
  if (seo.canonicalUrl) s += 5;
  return s;
}

function scorePill(score: number) {
  if (score >= 70) return "bg-emerald-100 text-emerald-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function scoreBar(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-amber-400";
  return "bg-red-400";
}

function charLabel(count: number, min: number, max: number) {
  if (count === 0) return { cls: "text-gray-400", hint: "" };
  if (count >= min && count <= max) return { cls: "text-emerald-600", hint: "ideal" };
  if (count > max) return { cls: "text-red-500", hint: "too long" };
  return { cls: "text-amber-500", hint: "too short" };
}

const CONTENT_TYPES: Record<string, string> = {
  vehicle: "cars",
  news:    "news",
  blog:    "blog",
  brand:   "brands",
};

export function SeoManager({ vehicles, news, blogs, brands, globalSettings }: Props) {
  const [tab, setTab]         = useState<Tab>("overview");
  const [search, setSearch]   = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Local SEO overrides after saves (avoids page reload)
  const [localSeo, setLocalSeo] = useState<Record<string, SeoRecord>>({});

  // Edit panel
  const [editEntity, setEditEntity] = useState<{
    type: string; id: string; name: string; slug: string;
  } | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  // Global settings
  const [gForm, setGForm]         = useState<Record<string, string>>(globalSettings);
  const [savingG, setSavingG]     = useState(false);
  const [savedG, setSavedG]       = useState(false);

  function getEffectiveSeo(id: string, base: SeoRecord | null): SeoRecord | null {
    return localSeo[id] ?? base;
  }

  function openEdit(type: string, id: string, name: string, slug: string, seo: SeoRecord | null) {
    const s = localSeo[id] ?? seo;
    setEditEntity({ type, id, name, slug });
    setForm({
      metaTitle:       s?.metaTitle       ?? "",
      metaDescription: s?.metaDescription ?? "",
      metaKeywords:    s?.metaKeywords    ?? "",
      canonicalUrl:    s?.canonicalUrl    ?? "",
      ogTitle:         s?.ogTitle         ?? "",
      ogDescription:   s?.ogDescription   ?? "",
      ogImage:         s?.ogImage         ?? "",
      schema:          s?.schema ? JSON.stringify(s.schema, null, 2) : "",
    });
    setError(null);
  }

  async function save() {
    if (!editEntity) return;
    setSaving(true);
    setError(null);
    try {
      let schemaJson: any = null;
      if (form.schema?.trim()) {
        try { schemaJson = JSON.parse(form.schema); }
        catch { throw new Error("Invalid JSON in Schema field — please fix or clear it."); }
      }
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: editEntity.type, entityId: editEntity.id, data: { ...form, schema: schemaJson } }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Save failed");
      }
      setLocalSeo(prev => ({ ...prev, [editEntity.id]: { ...form, schema: schemaJson } }));
      setSavedId(editEntity.id);
      setTimeout(() => setSavedId(null), 2500);
      setEditEntity(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveGlobal() {
    setSavingG(true);
    setError(null);
    const keys = [
      "seo_site_name", "seo_default_description", "seo_default_og_image",
      "seo_google_analytics", "seo_google_tag_manager", "seo_facebook_pixel",
      "seo_twitter_handle", "seo_robots_txt",
    ];
    try {
      await Promise.all(keys.map(key =>
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: gForm[key] || "", group: "seo", label: key }),
        })
      ));
      setSavedG(true);
      setTimeout(() => setSavedG(false), 2500);
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSavingG(false);
    }
  }

  // Derived data
  const vCoverage  = vehicles.filter(v => getEffectiveSeo(v.id, v.seo)?.metaTitle).length;
  const nCoverage  = news.filter(n => getEffectiveSeo(n.id, n.seo)?.metaTitle).length;
  const bCoverage  = blogs.filter(b => getEffectiveSeo(b.id, b.seo)?.metaTitle).length;
  const brCoverage = brands.filter(b => getEffectiveSeo(b.id, b.seo)?.metaTitle).length;

  const q = search.toLowerCase();
  const fVehicles = useMemo(() => vehicles.filter(v => !q || `${v.brand?.name ?? ""} ${v.name}`.toLowerCase().includes(q)), [vehicles, q]);
  const fNews     = useMemo(() => news.filter(n => !q || n.title.toLowerCase().includes(q)), [news, q]);
  const fBlogs    = useMemo(() => blogs.filter(b => !q || b.title.toLowerCase().includes(q)), [blogs, q]);
  const fBrands   = useMemo(() => brands.filter(b => !q || b.name.toLowerCase().includes(q)), [brands, q]);

  const tabLabel: Record<Tab, string> = {
    overview: "Overview",
    vehicles: `Vehicles (${vehicles.length})`,
    news:     `News (${news.length})`,
    blogs:    `Blogs (${blogs.length})`,
    brands:   `Brands (${brands.length})`,
    global:   "Global Settings",
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">SEO Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Control meta tags, Open Graph, and global SEO settings</p>
        </div>
        <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl px-3 py-2 hover:border-blue-300 transition-all">
          <ExternalLink className="w-3.5 h-3.5" /> Search Console
        </a>
      </div>

      {/* Coverage cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Vehicles", total: vehicles.length, done: vCoverage,  emoji: "🚗", go: "vehicles" as Tab },
          { label: "News",     total: news.length,     done: nCoverage,  emoji: "📰", go: "news"     as Tab },
          { label: "Blogs",    total: blogs.length,    done: bCoverage,  emoji: "✍️", go: "blogs"    as Tab },
          { label: "Brands",   total: brands.length,   done: brCoverage, emoji: "🏷️", go: "brands"   as Tab },
        ].map(c => {
          const pct = c.total > 0 ? Math.round((c.done / c.total) * 100) : 0;
          return (
            <button key={c.label} onClick={() => { setTab(c.go); setSearch(""); }}
              className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:shadow-sm hover:border-blue-200 transition-all">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xl">{c.emoji}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scorePill(pct)}`}>{pct}%</span>
              </div>
              <p className="text-sm font-semibold text-gray-800">{c.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.done}/{c.total} have SEO</p>
              <div className="mt-2.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${scoreBar(pct)}`} style={{ width: `${pct}%` }} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex overflow-x-auto border-b border-gray-100 no-scrollbar">
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(""); }}
              className={`flex-shrink-0 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                tab === t
                  ? "border-blue-600 text-blue-600 bg-blue-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50"
              }`}>
              {tabLabel[t]}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Overview ── */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    label: "Vehicles missing SEO", go: "vehicles" as Tab,
                    items: vehicles.filter(v => !getEffectiveSeo(v.id, v.seo)?.metaTitle)
                      .map(v => ({ id: v.id, name: v.brand ? `${v.brand.name} ${v.name}` : v.name, sub: v.type })),
                  },
                  {
                    label: "News missing SEO", go: "news" as Tab,
                    items: news.filter(n => !getEffectiveSeo(n.id, n.seo)?.metaTitle)
                      .map(n => ({ id: n.id, name: n.title, sub: n.status })),
                  },
                  {
                    label: "Blogs missing SEO", go: "blogs" as Tab,
                    items: blogs.filter(b => !getEffectiveSeo(b.id, b.seo)?.metaTitle)
                      .map(b => ({ id: b.id, name: b.title, sub: b.status })),
                  },
                  {
                    label: "Brands missing SEO", go: "brands" as Tab,
                    items: brands.filter(b => !getEffectiveSeo(b.id, b.seo)?.metaTitle)
                      .map(b => ({ id: b.id, name: b.name, sub: "" })),
                  },
                ].map(sec => (
                  <div key={sec.label} className="border border-gray-100 rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-600">{sec.label}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sec.items.length === 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {sec.items.length === 0 ? "All done ✓" : `${sec.items.length} missing`}
                      </span>
                    </div>
                    {sec.items.length === 0 ? (
                      <div className="py-5 text-center">
                        <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-400">Complete!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50 max-h-52 overflow-y-auto">
                        {sec.items.slice(0, 10).map(it => (
                          <button key={it.id} onClick={() => setTab(sec.go)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left transition-colors">
                            <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-700 truncate">{it.name}</p>
                              {it.sub && <p className="text-[10px] text-gray-400 capitalize">{it.sub}</p>}
                            </div>
                            <ChevronRight className="w-3 h-3 text-gray-300" />
                          </button>
                        ))}
                        {sec.items.length > 10 && (
                          <button onClick={() => setTab(sec.go)}
                            className="w-full py-2.5 text-xs text-blue-600 hover:underline">
                            +{sec.items.length - 10} more →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={() => setTab("global")}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 border border-blue-200 rounded-xl px-3 py-2 hover:bg-blue-50 transition-all">
                <Settings className="w-3.5 h-3.5" /> Edit Global SEO Settings
              </button>
            </div>
          )}

          {/* ── Vehicles ── */}
          {tab === "vehicles" && (
            <EntityTable
              search={search} setSearch={setSearch} savedId={savedId}
              items={fVehicles.map(v => {
                const name = v.brand ? `${v.brand.name} ${v.name}` : v.name;
                return { id: v.id, name, sub: v.type, slug: v.slug, type: "vehicle", seo: getEffectiveSeo(v.id, v.seo) };
              })}
              onEdit={(id) => {
                const v = vehicles.find(x => x.id === id)!;
                const name = v.brand ? `${v.brand.name} ${v.name}` : v.name;
                openEdit("vehicle", v.id, name, v.slug, v.seo);
              }}
            />
          )}

          {/* ── News ── */}
          {tab === "news" && (
            <EntityTable
              search={search} setSearch={setSearch} savedId={savedId}
              items={fNews.map(n => ({ id: n.id, name: n.title, sub: n.status, slug: n.slug, type: "news", seo: getEffectiveSeo(n.id, n.seo) }))}
              onEdit={(id) => { const n = news.find(x => x.id === id)!; openEdit("news", n.id, n.title, n.slug, n.seo); }}
            />
          )}

          {/* ── Blogs ── */}
          {tab === "blogs" && (
            <EntityTable
              search={search} setSearch={setSearch} savedId={savedId}
              items={fBlogs.map(b => ({ id: b.id, name: b.title, sub: b.status, slug: b.slug, type: "blog", seo: getEffectiveSeo(b.id, b.seo) }))}
              onEdit={(id) => { const b = blogs.find(x => x.id === id)!; openEdit("blog", b.id, b.title, b.slug, b.seo); }}
            />
          )}

          {/* ── Brands ── */}
          {tab === "brands" && (
            <EntityTable
              search={search} setSearch={setSearch} savedId={savedId}
              items={fBrands.map(b => ({ id: b.id, name: b.name, sub: "", slug: b.slug, type: "brand", seo: getEffectiveSeo(b.id, b.seo) }))}
              onEdit={(id) => { const b = brands.find(x => x.id === id)!; openEdit("brand", b.id, b.name, b.slug, b.seo); }}
            />
          )}

          {/* ── Global Settings ── */}
          {tab === "global" && (
            <div className="max-w-xl space-y-5">
              {[
                { key: "seo_site_name",           label: "Site Name",               icon: "🌐", ph: "TestDriveFirst" },
                { key: "seo_default_description", label: "Default Meta Description",icon: "📝", ph: "India's best car research platform...", ta: true },
                { key: "seo_default_og_image",    label: "Default OG Image URL",    icon: "🖼️", ph: "https://ik.imagekit.io/..." },
                { key: "seo_google_analytics",    label: "Google Analytics 4 ID",   icon: "📊", ph: "G-XXXXXXXXXX" },
                { key: "seo_google_tag_manager",  label: "Google Tag Manager ID",   icon: "🏷️", ph: "GTM-XXXXXXX" },
                { key: "seo_facebook_pixel",      label: "Facebook Pixel ID",       icon: "📘", ph: "123456789012345" },
                { key: "seo_twitter_handle",      label: "Twitter/X Handle",        icon: "🐦", ph: "@testdrivefirst" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-700 block mb-1.5">
                    <span className="mr-1.5">{f.icon}</span>{f.label}
                  </label>
                  {(f as any).ta ? (
                    <textarea
                      value={gForm[f.key] || ""}
                      onChange={e => setGForm({ ...gForm, [f.key]: e.target.value })}
                      rows={3} placeholder={f.ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                    />
                  ) : (
                    <input
                      value={gForm[f.key] || ""}
                      onChange={e => setGForm({ ...gForm, [f.key]: e.target.value })}
                      placeholder={f.ph}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  <span className="mr-1.5">🤖</span>Robots.txt Content
                </label>
                <textarea
                  value={gForm["seo_robots_txt"] || "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /account/\n\nSitemap: https://testdrivefirst.com/sitemap.xml"}
                  onChange={e => setGForm({ ...gForm, seo_robots_txt: e.target.value })}
                  rows={8}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                />
                <p className="text-[10px] text-gray-400 mt-1">Served dynamically at <code className="bg-gray-100 px-1 rounded">/robots.txt</code></p>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button onClick={saveGlobal} disabled={savingG}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60">
                  {savingG ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {savedG ? "Saved!" : savingG ? "Saving…" : "Save Settings"}
                </button>
                {savedG && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Saved</span>}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <p className="text-xs font-bold text-amber-700 mb-1">💡 Applying GA4 / GTM</p>
                <p className="text-xs text-amber-600">
                  After saving, add the IDs to <code className="bg-amber-100 px-1 rounded font-mono">app/layout.tsx</code> using
                  the Next.js <code className="bg-amber-100 px-1 rounded font-mono">Script</code> component or a package like{" "}
                  <code className="bg-amber-100 px-1 rounded font-mono">next-gtm</code>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit SEO slide panel */}
      {editEntity && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !saving && setEditEntity(null)} />
          <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-slate-50/80">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{editEntity.type} · SEO Editor</p>
                <h2 className="text-sm font-bold text-gray-900 truncate">{editEntity.name}</h2>
              </div>
              <button onClick={() => !saving && setEditEntity(null)}
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border-b border-red-100 px-5 py-2.5 text-xs text-red-600 font-medium">{error}</div>
            )}

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {/* Toolbar */}
              <div className="flex items-center gap-2">
                <button onClick={() => setForm(p => ({ ...p, ogTitle: p.ogTitle || p.metaTitle, ogDescription: p.ogDescription || p.metaDescription }))}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-all">
                  <Wand2 className="w-3 h-3" /> Auto-fill OG
                </button>
                <a href={`/${CONTENT_TYPES[editEntity.type]}/${editEntity.slug}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5 hover:text-blue-600 hover:border-blue-200 transition-all">
                  <ExternalLink className="w-3 h-3" /> View page
                </a>
              </div>

              {/* Meta Title */}
              <Field label="Meta Title" hint={(() => { const c = charLabel(form.metaTitle?.length ?? 0, 40, 70); return <span className={`text-[10px] font-semibold ${c.cls}`}>{form.metaTitle?.length ?? 0}/70{c.hint ? ` · ${c.hint}` : ""}</span>; })()}>
                <input value={form.metaTitle ?? ""} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))}
                  placeholder="Page title for search engines…"
                  className="input" />
              </Field>

              {/* Meta Description */}
              <Field label="Meta Description" hint={(() => { const c = charLabel(form.metaDescription?.length ?? 0, 120, 165); return <span className={`text-[10px] font-semibold ${c.cls}`}>{form.metaDescription?.length ?? 0}/165{c.hint ? ` · ${c.hint}` : ""}</span>; })()}>
                <textarea value={form.metaDescription ?? ""} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                  rows={3} placeholder="Brief description for search engine snippets…"
                  className="input resize-none" />
              </Field>

              {/* Keywords */}
              <Field label="Keywords" sub="comma-separated">
                <input value={form.metaKeywords ?? ""} onChange={e => setForm(p => ({ ...p, metaKeywords: e.target.value }))}
                  placeholder="electric car, EV, sedan…" className="input" />
              </Field>

              {/* Canonical URL */}
              <Field label="Canonical URL" sub="optional override">
                <input value={form.canonicalUrl ?? ""} onChange={e => setForm(p => ({ ...p, canonicalUrl: e.target.value }))}
                  placeholder="https://testdrivefirst.com/…" className="input" />
              </Field>

              {/* OG section */}
              <div className="border-t border-dashed border-gray-200 pt-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Open Graph (Social Sharing)</p>
                <div className="space-y-3">
                  <Field label="OG Title">
                    <input value={form.ogTitle ?? ""} onChange={e => setForm(p => ({ ...p, ogTitle: e.target.value }))}
                      placeholder="Title shown when shared on social…" className="input" />
                  </Field>
                  <Field label="OG Description">
                    <textarea value={form.ogDescription ?? ""} onChange={e => setForm(p => ({ ...p, ogDescription: e.target.value }))}
                      rows={2} placeholder="Description shown when shared on social…"
                      className="input resize-none" />
                  </Field>
                  <Field label="OG Image URL">
                    <input value={form.ogImage ?? ""} onChange={e => setForm(p => ({ ...p, ogImage: e.target.value }))}
                      placeholder="https://ik.imagekit.io/…" className="input" />
                    {form.ogImage && (
                      <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={form.ogImage} alt="OG preview" className="w-full h-32 object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        <p className="text-[10px] text-gray-400 px-2.5 py-1">Recommended: 1200×630px</p>
                      </div>
                    )}
                  </Field>
                </div>
              </div>

              {/* Schema JSON-LD */}
              <div className="border-t border-dashed border-gray-200 pt-4">
                <Field label="Schema.org JSON-LD" sub="optional">
                  <textarea value={form.schema ?? ""} onChange={e => setForm(p => ({ ...p, schema: e.target.value }))}
                    rows={6} placeholder='{"@context":"https://schema.org","@type":"Vehicle",...}'
                    className="input resize-none font-mono text-xs" />
                </Field>
              </div>
            </div>

            {/* Panel footer */}
            <div className="px-5 py-4 border-t border-gray-100 bg-slate-50/80 flex gap-3">
              <button onClick={save} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl py-2.5 transition-colors disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving…" : "Save SEO"}
              </button>
              <button onClick={() => !saving && setEditEntity(null)}
                className="px-4 py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.input{width:100%;border:1px solid #e5e7eb;border-radius:0.75rem;padding:0.625rem 0.75rem;font-size:0.875rem;outline:none}.input:focus{border-color:#60a5fa;box-shadow:0 0 0 3px rgba(59,130,246,0.1)}`}</style>
    </div>
  );
}

function Field({ label, sub, hint, children }: {
  label: string; sub?: string; hint?: ReactNode; children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-bold text-gray-700">
          {label}{sub && <span className="font-normal text-gray-400 ml-1">({sub})</span>}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

type EntityRow = {
  id: string; name: string; sub: string; slug: string;
  type: string; seo: SeoRecord | null;
};

function EntityTable({ items, search, setSearch, savedId, onEdit }: {
  items: EntityRow[];
  search: string;
  setSearch: (v: string) => void;
  savedId: string | null;
  onEdit: (id: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search…"
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
      </div>

      {items.length === 0 ? (
        <div className="py-12 text-center">
          <Globe className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No items found</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-slate-50/60">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Meta Title</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Description</th>
                <th className="text-center px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">OG</th>
                <th className="text-center px-3 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map(row => {
                const score = seoScore(row.seo);
                const pill  = scorePill(score);
                const flash = savedId === row.id;
                return (
                  <tr key={row.id} className={`hover:bg-slate-50/50 transition-colors ${flash ? "bg-emerald-50" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-800 text-xs leading-snug">{row.name}</p>
                      {row.sub && <p className="text-[10px] text-gray-400 capitalize mt-0.5">{row.sub}</p>}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {row.seo?.metaTitle
                        ? <p className="text-xs text-gray-600 truncate max-w-[180px]">{row.seo.metaTitle}</p>
                        : <span className="text-[10px] font-semibold text-red-400">Missing</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {row.seo?.metaDescription
                        ? <p className="text-xs text-gray-400 truncate max-w-[180px]">{row.seo.metaDescription}</p>
                        : <span className="text-[10px] font-semibold text-amber-400">Missing</span>}
                    </td>
                    <td className="px-3 py-3 text-center hidden sm:table-cell">
                      {row.seo?.ogImage
                        ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                        : <XCircle className="w-4 h-4 text-gray-200 mx-auto" />}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {flash
                        ? <span className="text-[10px] font-bold text-emerald-600">Saved!</span>
                        : <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pill}`}>{score}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onEdit(row.id)}
                        className="text-xs font-semibold text-blue-600 border border-blue-200 rounded-lg px-2.5 py-1 hover:bg-blue-50 transition-all whitespace-nowrap">
                        Edit SEO
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
