import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  User, Car, Heart, Bell, Shield, ChevronRight,
  LogOut, Settings, BookOpen, Calendar, Phone, Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "My Account | Walley",
  description: "Manage your Walley account — saved cars, test drive bookings, and profile settings.",
};

const QUICK_ACTIONS = [
  { Icon: Car,      label: "Saved Cars",        sub: "0 vehicles saved",       href: "/account/saved",    color: "bg-blue-50 text-blue-700"   },
  { Icon: Calendar, label: "Test Drive Bookings",sub: "View past bookings",     href: "/account/bookings", color: "bg-purple-50 text-purple-700"},
  { Icon: BookOpen, label: "My Listings",        sub: "Sell your car",          href: "/used-cars/sell",   color: "bg-emerald-50 text-emerald-700"},
  { Icon: Bell,     label: "Price Alerts",       sub: "0 active alerts",        href: "/account/alerts",   color: "bg-amber-50 text-amber-700"  },
];

export default async function AccountPage() {
  const session = await auth().catch(() => null);

  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const { name, email, image } = session.user;
  const initials = name
    ? name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-blue-900 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-xs text-blue-300 mb-7">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">My Account</span>
          </nav>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-extrabold text-xl shadow-lg flex-shrink-0 overflow-hidden">
              {image
                ? <img src={image} alt={name || "User"} className="w-full h-full object-cover" />
                : initials
              }
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold">{name || "My Account"}</h1>
              {email && (
                <div className="flex items-center gap-1.5 text-blue-200 text-sm mt-0.5">
                  <Mail className="w-3.5 h-3.5" /> {email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {QUICK_ACTIONS.map(({ Icon, label, sub, href, color }) => (
            <Link key={label} href={href}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 transition-colors">{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">

          {/* Profile details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900">Profile Details</h2>
              <Link href="/account/settings"
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <Settings className="w-3.5 h-3.5" /> Edit
              </Link>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Full Name</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{name || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Email</p>
                  <p className="font-semibold text-gray-900 text-sm truncate">{email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-green-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">Phone</p>
                  <p className="font-semibold text-gray-900 text-sm">Not added yet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Account</h3>
              <div className="space-y-1">
                {[
                  { Icon: Settings, label: "Account Settings",  href: "/account/settings" },
                  { Icon: Shield,   label: "Privacy & Security", href: "/account/security"  },
                  { Icon: Heart,    label: "Wishlist",           href: "/account/saved"     },
                  { Icon: Bell,     label: "Notifications",      href: "/account/alerts"    },
                ].map(({ Icon, label, href }) => (
                  <Link key={label} href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 group transition-colors">
                    <Icon className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors flex-1">{label}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
              <p className="font-bold text-red-700 text-sm mb-1">Sign Out</p>
              <p className="text-xs text-red-500 mb-3">You&apos;ll need to sign in again to access your account.</p>
              <Link href="/api/auth/signout"
                className="flex items-center gap-2 h-9 px-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all justify-center">
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
