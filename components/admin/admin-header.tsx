"use client";

import { signOut } from "next-auth/react";
import { Bell, LogOut, ExternalLink, Search, ChevronDown, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface Props {
  user: { name?: string | null; email?: string | null; role: string };
}

function getBreadcrumb(pathname: string): { label: string; href?: string }[] {
  const segs = pathname.replace("/admin", "").split("/").filter(Boolean);
  const crumbs: { label: string; href?: string }[] = [{ label: "Admin", href: "/admin/dashboard" }];
  let path = "/admin";
  segs.forEach((seg, i) => {
    path += `/${seg}`;
    const label = seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    crumbs.push(i < segs.length - 1 ? { label, href: path } : { label });
  });
  return crumbs;
}

export function AdminHeader({ user }: Props) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumb(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "A";

  return (
    <header className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between shrink-0 z-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-gray-400 hover:text-gray-700 transition-colors font-medium">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-gray-800 font-semibold">{crumb.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-9 w-56 focus-within:border-blue-400 focus-within:bg-white transition-all">
          <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
          />
        </div>

        {/* View site */}
        <Link href="/" target="_blank"
          className="hidden md:flex items-center gap-1.5 h-9 px-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all font-medium">
          <ExternalLink className="w-3.5 h-3.5" /> View Site
        </Link>

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 h-9 px-2 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
              {user.name || "Admin"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <div className="py-1">
                  <Link href="/admin/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <Settings className="w-4 h-4" /> Settings
                  </Link>
                  <Link href="/" target="_blank"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                    <ExternalLink className="w-4 h-4" /> View Site
                  </Link>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/admin/login" }); }}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
