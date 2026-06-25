import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Phone, Mail, MapPin, Car, Clock,
  Calendar, MessageSquare, User, Tag,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { LeadDetailClient } from "./lead-detail-client";

interface Props { params: Promise<{ id: string }> }

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  contact_form: { label: "Contact Form",  color: "bg-blue-50 text-blue-700 border-blue-200"    },
  test_drive:   { label: "Test Drive",    color: "bg-purple-50 text-purple-700 border-purple-200"},
  newsletter:   { label: "Newsletter",    color: "bg-teal-50 text-teal-700 border-teal-200"     },
  offer_popup:  { label: "Offer Popup",   color: "bg-orange-50 text-orange-700 border-orange-200"},
};

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lost:      "bg-red-50 text-red-600 border-red-200",
};

function timeAgo(date: Date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } }).catch(() => null);
  if (!lead) notFound();

  const src = SOURCE_LABELS[lead.source] ?? { label: lead.source, color: "bg-gray-100 text-gray-600 border-gray-200" };
  const statusColor = STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600 border-gray-200";

  const fields = [
    { icon: User,     label: "Full Name",    value: lead.name },
    { icon: Phone,    label: "Mobile",       value: lead.mobile,      href: `tel:${lead.mobile}` },
    { icon: Mail,     label: "Email",        value: lead.email,       href: lead.email ? `mailto:${lead.email}` : undefined },
    { icon: MapPin,   label: "City",         value: lead.city },
    { icon: Car,      label: "Vehicle",      value: lead.vehicleName },
    { icon: Tag,      label: "Vehicle Type", value: lead.vehicleType },
    { icon: Calendar, label: "Buy Timeline", value: lead.buyTime },
    { icon: Car,      label: "Sell Car",     value: lead.sellCar },
  ].filter((f) => f.value);

  return (
    <div className="space-y-5 max-w-3xl">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/leads"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors">
          <ChevronLeft className="w-4 h-4" /> All Leads
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-xs text-gray-400 truncate">{lead.name}</span>
      </div>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{lead.name}</h1>
          <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5" /> {timeAgo(new Date(lead.createdAt))}
            &nbsp;·&nbsp;{new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${src.color}`}>{src.label}</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${statusColor}`}>{lead.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

        {/* Contact details */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 text-sm mb-4">Contact Details</h2>
          <div className="space-y-3">
            {fields.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">{label}</p>
                  {href ? (
                    <a href={href} className="text-sm font-semibold text-blue-600 hover:underline break-all">{value}</a>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick contact buttons */}
          <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
            <a href={`tel:${lead.mobile}`}
              className="flex-1 flex items-center justify-center gap-2 h-9 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-xl transition-all">
              <Phone className="w-3.5 h-3.5" /> Call
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}`}
                className="flex-1 flex items-center justify-center gap-2 h-9 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all">
                <Mail className="w-3.5 h-3.5" /> Email
              </a>
            )}
            <a href={`https://wa.me/91${lead.mobile.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 h-9 bg-[#25d366] hover:bg-[#20b959] text-white font-bold text-xs rounded-xl transition-all">
              WhatsApp
            </a>
          </div>
        </div>

        {/* Status + Notes */}
        <LeadDetailClient lead={{ id: lead.id, status: lead.status, notes: lead.notes ?? "" }} statusColors={STATUS_COLORS} />
      </div>

      {/* Notes history */}
      {lead.notes && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <h2 className="font-bold text-gray-900 text-sm">Existing Notes</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-xl p-4">{lead.notes}</p>
        </div>
      )}
    </div>
  );
}
