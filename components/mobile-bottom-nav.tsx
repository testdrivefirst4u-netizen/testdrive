"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, GitCompare, MapPin, User } from "lucide-react";

const NAV = [
  { href: "/",        label: "Home",    icon: Home },
  { href: "/cars",    label: "Search",  icon: Search },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/dealers", label: "Dealers", icon: MapPin },
  { href: "/account", label: "Account", icon: User },
];

export function MobileBottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around h-16 px-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 group"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  active
                    ? "bg-blue-600 shadow-lg shadow-blue-200"
                    : "group-hover:bg-gray-100"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 transition-colors ${
                    active ? "text-white" : "text-gray-400 group-hover:text-gray-700"
                  }`}
                  style={{ width: "18px", height: "18px" }}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  active ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
