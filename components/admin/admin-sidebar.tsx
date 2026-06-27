"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Tag, Car, List, Settings2, Zap, Newspaper,
  BookOpen, HelpCircle, Users, Image, BrainCircuit, Settings,
  Globe, ChevronDown, ChevronRight, MonitorPlay,
  ExternalLink, ShieldCheck, Inbox, Building2, Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  {
    label: "Vehicles",
    icon: Car,
    children: [
      { label: "All Vehicles",  href: "/admin/vehicles",    icon: Car      },
      { label: "Brands",        href: "/admin/brands",      icon: Tag      },
      { label: "Categories",    href: "/admin/categories",  icon: List     },
      { label: "Variants",      href: "/admin/variants",    icon: Settings2},
      { label: "Spec Groups",   href: "/admin/spec-groups", icon: Zap      },
      { label: "Colours",       href: "/admin/colours",     icon: Globe    },
    ],
  },
  {
    label: "Content",
    icon: BookOpen,
    children: [
      { label: "News",  href: "/admin/news",  icon: Newspaper },
      { label: "Blogs", href: "/admin/blogs", icon: BookOpen  },
      { label: "FAQs",  href: "/admin/faqs",  icon: HelpCircle},
    ],
  },
  { label: "Leads",        href: "/admin/leads",      icon: Inbox       },
  { label: "Newsletter",   href: "/admin/newsletter", icon: Mail        },
  { label: "Dealers",      href: "/admin/dealers",    icon: Building2   },
  { label: "Banners",      href: "/admin/banners",    icon: MonitorPlay },
  { label: "Media Library",href: "/admin/media",      icon: Image       },
  { label: "Users",        href: "/admin/users",      icon: Users       },
  { label: "AI Settings",  href: "/admin/ai-settings",icon: BrainCircuit},
  { label: "SEO",          href: "/admin/seo",        icon: Globe       },
  { label: "Site Settings",href: "/admin/settings",   icon: Settings    },
];

interface Props {
  user: { name?: string | null; email?: string | null; role: string };
  permissions?: string[];
  newLeadsCount?: number;
}

export function AdminSidebar({ user, permissions = [], newLeadsCount = 0 }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState<string[]>(["Vehicles", "Content"]);

  const isEditor = user.role === "EDITOR";
  // Extract the segment key from an href like "/admin/spec-groups" → "spec-groups"
  function canSee(href: string) {
    if (!isEditor) return true;
    const segment = href.split("/")[2] ?? "";
    if (!segment || segment === "dashboard") return true;
    return permissions.includes(segment);
  }

  function toggle(label: string) {
    setOpen((prev) => prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]);
  }

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <aside className="w-64 bg-[#0c1524] text-white flex flex-col shrink-0 border-r border-white/5 h-screen">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white/5">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-900/50">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-extrabold text-white tracking-tight">Walley</span>
            <span className="ml-2 text-[9px] font-bold text-blue-400 bg-blue-900/50 border border-blue-700/50 px-1.5 py-0.5 rounded-md">CMS</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto min-h-0 no-scrollbar">
        {nav.map((item) => {
          if (!item.children) {
            if (!canSee(item.href!)) return null;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.label} href={item.href!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                  active
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}>
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
                {item.label === "Leads" && newLeadsCount > 0 && (
                  <span className="ml-auto text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                    {newLeadsCount}
                  </span>
                )}
              </Link>
            );
          }

          const visibleChildren = item.children.filter((c) => canSee(c.href));
          if (visibleChildren.length === 0) return null;

          const isOpen    = open.includes(item.label);
          const anyActive = visibleChildren.some((c) => pathname.startsWith(c.href));

          return (
            <div key={item.label}>
              <button
                onClick={() => toggle(item.label)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm w-full transition-all duration-150",
                  anyActive ? "text-white bg-white/5" : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}>
                <item.icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                {isOpen
                  ? <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </button>

              {isOpen && (
                <div className="ml-3.5 mt-0.5 space-y-0.5 border-l border-white/10 pl-3">
                  {visibleChildren.map((child) => {
                    const active = pathname.startsWith(child.href);
                    return (
                      <Link key={child.href} href={child.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-150",
                          active
                            ? "bg-blue-600 text-white"
                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                        )}>
                        <child.icon className="w-3.5 h-3.5 shrink-0" />
                        {child.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* View site link */}
      <div className="px-3 pb-2">
        <Link href="/" target="_blank"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all">
          <ExternalLink className="w-4 h-4" />
          View Live Site
        </Link>
      </div>

      {/* User profile */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-white text-sm truncate">{user.name || "Admin"}</p>
            <p className="text-slate-400 text-[10px] truncate">{user.email}</p>
          </div>
          <div className="flex items-center gap-1 bg-blue-900/50 border border-blue-700/50 rounded-lg px-1.5 py-0.5">
            <ShieldCheck className="w-2.5 h-2.5 text-blue-400" />
            <span className="text-[9px] font-bold text-blue-300 uppercase tracking-wide">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
