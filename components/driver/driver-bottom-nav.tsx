"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Car, History } from "lucide-react";

const NAV = [
  { href: "/driver/dashboard", label: "Trips",   icon: Car },
  { href: "/driver/trips",     label: "History", icon: History },
];

export default function DriverBottomNav() {
  const path = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 bg-white border-t border-gray-100 shadow-[0_-2px_8px_rgba(0,0,0,0.04)] flex">
      {NAV.map((item) => {
        const active = path.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
              active ? "text-emerald-600" : "text-gray-400"
            }`}
          >
            <item.icon className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
