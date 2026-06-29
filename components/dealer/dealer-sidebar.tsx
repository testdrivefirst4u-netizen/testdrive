'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { dealerSignOutAction } from '@/app/dealer/actions';
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  Car,
  LogOut,
  User,
  Tag,
  ChevronRight,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const NAV = [
  { href: '/dealer/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dealer/leads',      label: 'My Leads',   icon: Car },
  { href: '/dealer/follow-ups', label: 'Follow-ups', icon: CalendarClock },
  { href: '/dealer/offers',     label: 'My Offers',  icon: Tag },
  { href: '/dealer/team',       label: 'My Team',    icon: Users, adminOnly: true },
  { href: '/dealer/profile',    label: 'My Profile', icon: User },
];

export default function DealerSidebar({
  role,
  userName,
}: {
  role: string;
  userName: string;
}) {
  const path = usePathname();

  // New-lead badge
  const [unread,    setUnread]    = useState(0);
  const [lastCheck, setLastCheck] = useState(() => {
    if (typeof window === 'undefined')
      return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    return (
      localStorage.getItem('dealer_last_check') ??
      new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    );
  });

  // Follow-up badge (overdue + today)
  const [fuUrgent, setFuUrgent] = useState(0);

  useEffect(() => {
    async function pollLeads() {
      try {
        const res = await fetch(`/api/dealer/notifications?since=${lastCheck}`);
        if (res.ok) {
          const data = await res.json();
          setUnread(data.unread ?? 0);
        }
      } catch {}
    }

    async function pollFollowUps() {
      try {
        const res = await fetch('/api/dealer/followups/summary');
        if (res.ok) {
          const data = await res.json();
          setFuUrgent((data.overdue ?? 0) + (data.today ?? 0));
        }
      } catch {}
    }

    pollLeads();
    pollFollowUps();

    const id1 = setInterval(pollLeads,     30_000);
    const id2 = setInterval(pollFollowUps, 60_000);
    return () => { clearInterval(id1); clearInterval(id2); };
  }, [lastCheck]);

  function markRead() {
    const now = new Date().toISOString();
    localStorage.setItem('dealer_last_check', now);
    setLastCheck(now);
    setUnread(0);
  }

  const initials = userName
    ? userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'D';

  const roleLabel = role.toLowerCase().replace(/_/g, ' ');

  return (
    <aside className="w-60 bg-white border-r border-gray-100 flex flex-col h-full shrink-0 shadow-sm">
      {/* Logo + portal badge */}
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 bg-gradient-to-b from-indigo-50/60 to-white">
        <Link href="/" className="block">
          <Image
            src="/images/logo.png"
            alt="TestDriveFirst"
            width={500}
            height={120}
            className="h-14 sm:h-20 lg:h-24 w-auto object-contain"
            priority
          />
        </Link>
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-full px-2 py-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            Dealer Portal
          </span>
          <span className="text-[10px] text-gray-400 capitalize">{roleLabel}</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2.5 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 px-3 pt-2 pb-1.5">
          Menu
        </p>
        <div className="space-y-0.5">
          {NAV.filter((item) => !item.adminOnly || role === 'DEALER_ADMIN').map((item) => {
            const active      = path.startsWith(item.href);
            const isLeads     = item.href === '/dealer/leads';
            const isFollowUps = item.href === '/dealer/follow-ups';

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={isLeads ? markRead : undefined}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    }`}
                  />
                  {item.label}
                </span>

                {/* New leads badge */}
                {isLeads && unread > 0 ? (
                  <span className="text-[10px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none animate-pulse">
                    {unread > 99 ? '99+' : unread}
                  </span>
                ) : isLeads && active ? (
                  <ChevronRight className="w-3.5 h-3.5 text-white/50" />

                /* Follow-ups urgent badge */
                ) : isFollowUps && fuUrgent > 0 ? (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                    active ? 'bg-white/20 text-white' : 'bg-red-500 text-white animate-pulse'
                  }`}>
                    {fuUrgent > 99 ? '99+' : fuUrgent}
                  </span>
                ) : active ? (
                  <ChevronRight className="w-3.5 h-3.5 text-white/50" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* User card + sign out */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-800 truncate">{userName}</p>
            <p className="text-[10px] text-gray-400 capitalize">{roleLabel}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Online" />
        </div>
        <form action={dealerSignOutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150 font-medium"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
