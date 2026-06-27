import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Hash, Palette, Car } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "My Bookings | Walley",
  description: "Your vehicle bookings on Walley.",
};

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPrice(n: number | null | undefined): string {
  if (!n) return "—";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000)   return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(d));
}

export default async function BookingsPage() {
  const session = await auth().catch(() => null);
  if (!session?.user) redirect("/login?callbackUrl=/account/bookings");

  const bookings = await prisma.crmBooking.findMany({
    where: { lead: { email: session.user.email ?? "" } },
    include: { lead: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          My Bookings
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-300" />
          </div>
          <h2 className="font-bold text-gray-900 text-lg mb-2">No bookings yet</h2>
          <p className="text-sm text-gray-500 mb-6">
            When you book a vehicle, it will appear here.
          </p>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            Browse Vehicles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Hash className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 tracking-wider">
                      {booking.bookingNumber}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-gray-900 text-base leading-tight">
                    {booking.vehicle}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Booked on {formatDate(booking.createdAt)}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                    STATUS_STYLES[booking.status] ?? "bg-gray-50 text-gray-600 border-gray-200"
                  )}
                >
                  {statusLabel(booking.status)}
                </span>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {booking.variant && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1 flex items-center gap-1">
                      <Car className="w-3 h-3" /> Variant
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">{booking.variant}</p>
                  </div>
                )}
                {booking.color && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1 flex items-center gap-1">
                      <Palette className="w-3 h-3" /> Color
                    </p>
                    <p className="text-sm font-bold text-gray-900 truncate">{booking.color}</p>
                  </div>
                )}
                {booking.bookingAmount != null && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1">
                      Booking Amt
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(booking.bookingAmount)}
                    </p>
                  </div>
                )}
                {booking.expectedDelivery && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Est. Delivery
                    </p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatDate(booking.expectedDelivery)}
                    </p>
                  </div>
                )}
              </div>

              {/* Customer info from lead */}
              {booking.lead && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold text-gray-700">{booking.lead.customerName}</span>
                      {booking.lead.mobile && (
                        <> &middot; {booking.lead.mobile}</>
                      )}
                    </p>
                  </div>
                  {booking.vehiclePrice != null && (
                    <p className="text-xs font-bold text-blue-700">
                      Vehicle Price: {formatPrice(booking.vehiclePrice)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
