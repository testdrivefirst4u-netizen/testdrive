import type React from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { Heart, Calendar, Bell, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { label: "Saved Vehicles", href: "/account/saved",    Icon: Heart    },
  { label: "My Bookings",    href: "/account/bookings", Icon: Calendar },
  { label: "Price Alerts",   href: "/account/alerts",   Icon: Bell     },
];

export default async function AccountSectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth().catch(() => null);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sub-nav breadcrumb strip */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1 py-3 text-xs text-gray-500 overflow-x-auto scrollbar-hide">
            <Link href="/" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              Home
            </Link>
            <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-300" />
            <Link href="/account" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              My Account
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sticky top-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">
                Account
              </p>
              {NAV_ITEMS.map(({ label, href, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-sm font-medium group transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-gray-100 mt-3 pt-3">
                <Link
                  href="/account"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-gray-500 text-sm font-medium transition-colors"
                >
                  Back to Account
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
