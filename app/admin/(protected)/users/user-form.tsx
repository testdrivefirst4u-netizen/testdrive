"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert, ShieldCheck, ShieldOff, Eye, EyeOff, Save, Loader2,
  CheckSquare, Square, Car, Newspaper, Users, Settings,
} from "lucide-react";

const PERM_GROUPS = [
  {
    label: "Vehicles & Inventory",
    icon: Car,
    color: "blue",
    perms: [
      { key: "vehicles",    label: "All Vehicles"  },
      { key: "brands",      label: "Brands"        },
      { key: "categories",  label: "Categories"    },
      { key: "variants",    label: "Variants"      },
      { key: "spec-groups", label: "Spec Groups"   },
      { key: "colours",     label: "Colours"       },
    ],
  },
  {
    label: "Content",
    icon: Newspaper,
    color: "emerald",
    perms: [
      { key: "news",  label: "News"  },
      { key: "blogs", label: "Blogs" },
      { key: "faqs",  label: "FAQs"  },
    ],
  },
  {
    label: "Management",
    icon: Users,
    color: "purple",
    perms: [
      { key: "leads",   label: "Leads"   },
      { key: "banners", label: "Banners" },
      { key: "media",   label: "Media"   },
      { key: "users",   label: "Users"   },
    ],
  },
  {
    label: "Configuration",
    icon: Settings,
    color: "orange",
    perms: [
      { key: "ai-settings", label: "AI Settings" },
      { key: "seo",         label: "SEO"          },
      { key: "settings",    label: "Site Settings" },
    ],
  },
];

const ALL_PERM_KEYS = PERM_GROUPS.flatMap(g => g.perms.map(p => p.key));

const ROLES = [
  { value: "EDITOR",      label: "Editor",      icon: ShieldOff,   color: "text-blue-600",   desc: "Access limited to selected pages" },
  { value: "ADMIN",       label: "Admin",        icon: ShieldCheck, color: "text-purple-600", desc: "Full access to all sections"       },
  { value: "SUPER_ADMIN", label: "Super Admin",  icon: ShieldAlert, color: "text-red-600",    desc: "Full access · Cannot be deleted"   },
];

const COLOR_MAP: Record<string, string> = {
  blue:    "border-blue-200 bg-blue-50/50",
  emerald: "border-emerald-200 bg-emerald-50/50",
  purple:  "border-purple-200 bg-purple-50/50",
  orange:  "border-orange-200 bg-orange-50/50",
};

const PILL_MAP: Record<string, string> = {
  blue:    "bg-blue-100 text-blue-700 border-blue-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  purple:  "bg-purple-100 text-purple-700 border-purple-200",
  orange:  "bg-orange-100 text-orange-700 border-orange-200",
};

interface Props {
  mode: "new" | "edit";
  callerRole: string;
  initial?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    permissions?: string[];
  };
}

export function UserForm({ mode, callerRole, initial }: Props) {
  const router  = useRouter();
  const [pending, startTransition] = useTransition();

  const [name,     setName]     = useState(initial?.name     ?? "");
  const [email,    setEmail]    = useState(initial?.email    ?? "");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [role,     setRole]     = useState(initial?.role     ?? "EDITOR");
  const [perms,    setPerms]    = useState<string[]>(initial?.permissions ?? []);
  const [error,    setError]    = useState("");

  const isTargetSuperAdmin = initial?.role === "SUPER_ADMIN";

  function togglePerm(key: string) {
    setPerms(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);
  }
  function selectAll()   { setPerms([...ALL_PERM_KEYS]); }
  function deselectAll() { setPerms([]); }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const body: any = { name, email, role, permissions: role === "EDITOR" ? perms : [] };
    if (password) body.password = password;

    const url    = mode === "new" ? "/api/admin/users" : `/api/admin/users/${initial?.id}`;
    const method = mode === "new" ? "POST" : "PUT";

    startTransition(async () => {
      const res  = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return; }
      router.push("/admin/users");
      router.refresh();
    });
  }

  const isSuperAdminLocked = isTargetSuperAdmin && callerRole !== "SUPER_ADMIN";

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Basic info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-gray-700">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              disabled={isSuperAdminLocked}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Email Address <span className="text-red-500">*</span></label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="email@example.com"
              disabled={isSuperAdminLocked}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
            Password {mode === "edit" && <span className="text-gray-400 font-normal">(leave blank to keep unchanged)</span>}
            {mode === "new" && <span className="text-red-500"> *</span>}
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required={mode === "new"}
              placeholder={mode === "edit" ? "Leave blank to keep current password" : "Min 8 characters"}
              disabled={isSuperAdminLocked}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button type="button" onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Role */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-gray-700">Role</h2>
        {isSuperAdminLocked && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            Only a Super Admin can modify another Super Admin's details.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {ROLES.filter(r => r.value !== "SUPER_ADMIN" || callerRole === "SUPER_ADMIN").map(r => {
            const Icon = r.icon;
            const active = role === r.value;
            return (
              <button key={r.value} type="button"
                disabled={isSuperAdminLocked}
                onClick={() => setRole(r.value)}
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 text-left transition-all disabled:opacity-40 disabled:cursor-not-allowed
                  ${active ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-white"}`}>
                <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${r.color}`} />
                <div>
                  <p className={`text-xs font-bold ${active ? "text-blue-700" : "text-gray-700"}`}>{r.label}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{r.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permissions (Editor only) */}
      {role === "EDITOR" && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-bold text-gray-700">Page Permissions</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select which admin sections this editor can access</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={selectAll}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                Select All
              </button>
              <button type="button" onClick={deselectAll}
                className="text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors">
                Deselect All
              </button>
            </div>
          </div>

          {perms.length === 0 && (
            <p className="text-xs text-red-400 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              No permissions selected — this editor will only see the dashboard.
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PERM_GROUPS.map(g => {
              const Icon      = g.icon;
              const groupKeys = g.perms.map(p => p.key);
              const allIn     = groupKeys.every(k => perms.includes(k));
              return (
                <div key={g.label} className={`border rounded-xl p-3.5 space-y-2 ${COLOR_MAP[g.color]}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs font-bold text-gray-700">{g.label}</span>
                    </div>
                    <button type="button"
                      onClick={() => setPerms(p => allIn
                        ? p.filter(k => !groupKeys.includes(k))
                        : [...new Set([...p, ...groupKeys])]
                      )}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors ${PILL_MAP[g.color]}`}>
                      {allIn ? "None" : "All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {g.perms.map(p => {
                      const checked = perms.includes(p.key);
                      return (
                        <button key={p.key} type="button"
                          onClick={() => togglePerm(p.key)}
                          className={`flex items-center gap-1.5 text-left px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all
                            ${checked
                              ? `${PILL_MAP[g.color]} border`
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
                            }`}>
                          {checked
                            ? <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                            : <Square className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                          }
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          {perms.length > 0 && (
            <p className="text-xs text-gray-500">
              <span className="font-bold text-gray-700">{perms.length}</span> of {ALL_PERM_KEYS.length} pages selected
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <button type="button" onClick={() => router.back()}
          className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={pending || isSuperAdminLocked}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {mode === "new" ? "Create User" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
