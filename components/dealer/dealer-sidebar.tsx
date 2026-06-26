"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dealerSignOutAction } from "@/app/dealer/actions";
import { LayoutDashboard, Users, CalendarClock, Car, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/dealer/dashboard",      label: "Dashboard",     icon: LayoutDashboard },
  { href: "/dealer/leads",          label: "My Leads",      icon: Car },
  { href: "/dealer/follow-ups",     label: "Follow-ups",    icon: CalendarClock },
  { href: "/dealer/team",           label: "My Team",       icon: Users, adminOnly: true },
  { href: "/dealer/profile",        label: "My Profile",    icon: User },
];

export default function DealerSidebar({ role, userName }: { role: string; userName: string }) {
  const path = usePathname();
  const [unread, setUnread]     = useState(0);
  const [lastCheck, setLastCheck] = useState(() => {
    if (typeof window === "undefined") return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return localStorage.getItem("dealer_last_check") ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  });

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/dealer/notifications?since=${lastCheck}`);
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unread ?? 0);
        }
      } catch {}
    }
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [lastCheck]);

  function markRead() {
    const now = new Date().toISOString();
    localStorage.setItem("dealer_last_check", now);
    setLastCheck(now);
    setUnread(0);
  }

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-full shrink-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Dealer Portal</p>
            <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{role.toLowerCase().replace(/_/g, " ")}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV
          .filter(item => !item.adminOnly || role === "DEALER_ADMIN")
          .map(item => {
            const active = path.startsWith(item.href);
            const isLeads = item.href === "/dealer/leads";
            return (
              <Link key={item.href} href={item.href}
                onClick={isLeads ? markRead : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-indigo-50 text-indigo-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}>
                <span className="flex items-center gap-2.5">
                  <item.icon className={`w-4 h-4 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                  {item.label}
                </span>
                {isLeads && unread > 0 && (
                  <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-gray-100">
        <div className="px-3 py-2 mb-2">
          <p className="text-xs font-semibold text-gray-700 truncate">{userName}</p>
        </div>
        <form action={dealerSignOutAction}>
          <button type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
