"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, CheckCircle, Settings, Phone, Globe, Share2, MapPin } from "lucide-react";

type Field = {
  key: string; label: string; placeholder: string;
  type?: "text" | "url" | "tel" | "email" | "textarea";
};

const SECTIONS: { title: string; icon: any; fields: Field[] }[] = [
  {
    title: "Contact Information",
    icon: Phone,
    fields: [
      { key: "site_phone",     label: "Phone Number",    placeholder: "+91 98765 43210",         type: "tel"   },
      { key: "site_whatsapp",  label: "WhatsApp Number", placeholder: "+91 98765 43210",         type: "tel"   },
      { key: "site_email",     label: "Email Address",   placeholder: "info@testdrivefirst.com", type: "email" },
      { key: "site_address",   label: "Address",         placeholder: "123, Auto Plaza, Mumbai", type: "textarea" },
    ],
  },
  {
    title: "Branding",
    icon: Settings,
    fields: [
      { key: "site_name",        label: "Site Name",         placeholder: "TestDriveFirst"                             },
      { key: "site_tagline",     label: "Tagline",           placeholder: "India's #1 Car Research Platform"           },
      { key: "site_logo",        label: "Logo URL",          placeholder: "https://ik.imagekit.io/…", type: "url"      },
      { key: "site_favicon",     label: "Favicon URL",       placeholder: "https://ik.imagekit.io/…", type: "url"      },
      { key: "site_footer_desc", label: "Footer Description",placeholder: "Your trusted source for…", type: "textarea" },
      { key: "site_copyright",   label: "Copyright Text",    placeholder: "© 2025 TestDriveFirst. All rights reserved."},
    ],
  },
  {
    title: "Social Links",
    icon: Share2,
    fields: [
      { key: "social_facebook",  label: "Facebook URL",  placeholder: "https://facebook.com/…",  type: "url" },
      { key: "social_instagram", label: "Instagram URL", placeholder: "https://instagram.com/…", type: "url" },
      { key: "social_twitter",   label: "Twitter/X URL", placeholder: "https://x.com/…",         type: "url" },
      { key: "social_youtube",   label: "YouTube URL",   placeholder: "https://youtube.com/…",   type: "url" },
      { key: "social_linkedin",  label: "LinkedIn URL",  placeholder: "https://linkedin.com/…",  type: "url" },
    ],
  },
  {
    title: "Location & Maps",
    icon: MapPin,
    fields: [
      { key: "site_city",          label: "City",            placeholder: "Mumbai"                     },
      { key: "site_state",         label: "State",           placeholder: "Maharashtra"                },
      { key: "site_country",       label: "Country",         placeholder: "India"                      },
      { key: "site_maps_embed",    label: "Google Maps Embed URL", placeholder: "https://maps.google.com/maps?q=…&output=embed", type: "url" },
    ],
  },
  {
    title: "Business Hours",
    icon: Globe,
    fields: [
      { key: "hours_weekdays", label: "Weekdays",        placeholder: "Mon – Sat: 9 AM – 7 PM" },
      { key: "hours_sunday",   label: "Sunday",          placeholder: "Sun: 10 AM – 5 PM"      },
      { key: "hours_holidays", label: "Public Holidays", placeholder: "Closed"                 },
    ],
  },
];

export default function SiteSettingsPage() {
  const [values, setValues]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/settings?group=site").then(r => r.json()),
      fetch("/api/admin/settings?group=social").then(r => r.json()),
      fetch("/api/admin/settings?group=hours").then(r => r.json()),
    ]).then(([site, social, hours]) => {
      const all = [...site, ...social, ...hours];
      const map: Record<string, string> = {};
      for (const s of all) map[s.key] = s.value || "";
      setValues(map);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function saveAll() {
    setSaving(true); setSaved(false); setError(null);
    const allKeys = SECTIONS.flatMap(s => s.fields.map(f => f.key));
    const group = (key: string) =>
      key.startsWith("social_") ? "social" :
      key.startsWith("hours_")  ? "hours"  : "site";
    try {
      await Promise.all(allKeys.map(key =>
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value: values[key] || "", group: group(key), label: key }),
        })
      ));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Contact info, branding, social links, and business hours</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
          <button onClick={saveAll} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors disabled:opacity-60">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600 font-medium">{error}</div>
      )}

      {/* Sections */}
      {SECTIONS.map(sec => (
        <div key={sec.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-slate-50/60">
            <sec.icon className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-gray-800">{sec.title}</h2>
          </div>
          <div className="p-5 space-y-4">
            {sec.fields.map(f => (
              <div key={f.key}>
                <label className="text-xs font-bold text-gray-600 block mb-1.5">{f.label}</label>
                {f.type === "textarea" ? (
                  <textarea
                    value={values[f.key] || ""}
                    onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                    rows={2} placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 resize-none"
                  />
                ) : (
                  <input
                    type={f.type || "text"}
                    value={values[f.key] || ""}
                    onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Save sticky bottom */}
      <div className="flex items-center gap-3 pb-4">
        <button onClick={saveAll} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl px-5 py-2.5 transition-colors disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save All Settings"}
        </button>
        {saved && <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> All settings saved</span>}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
        <p className="text-xs font-bold text-blue-700 mb-1">💡 How to use these settings</p>
        <p className="text-xs text-blue-600">
          Access any setting in your pages using the <code className="bg-blue-100 px-1 rounded font-mono">/api/admin/settings?key=site_phone</code> API
          or fetch the entire group with <code className="bg-blue-100 px-1 rounded font-mono">?group=site</code>.
        </p>
      </div>
    </div>
  );
}
