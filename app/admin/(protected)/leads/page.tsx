import Link from "next/link";
import { Inbox, Phone, Mail, MapPin, Clock, Car, ChevronLeft, ChevronRight, Download } from "lucide-react";
import prisma from "@/lib/prisma";
import { LeadStatusSelect } from "./lead-status-select";
import { LeadExportButton } from "./lead-export-button";

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  contact_form: { label: "Contact",    color: "bg-blue-50 text-blue-700"     },
  test_drive:   { label: "Test Drive", color: "bg-purple-50 text-purple-700" },
  newsletter:   { label: "Newsletter", color: "bg-teal-50 text-teal-700"     },
  offer_popup:  { label: "Offer Popup",color: "bg-orange-50 text-orange-700" },
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

const PAGE_SIZE = 20;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const source = params.source || "";
  const status = params.status || "";
  const page   = Math.max(1, Number(params.page) || 1);

  const where = {
    ...(source ? { source } : {}),
    ...(status ? { status } : {}),
  };

  const [leads, total, counts] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "new" } }),
      prisma.lead.count({ where: { status: "contacted" } }),
      prisma.lead.count({ where: { status: "converted" } }),
      prisma.lead.count({ where: { source: "contact_form" } }),
      prisma.lead.count({ where: { source: "test_drive" } }),
      prisma.lead.count({ where: { source: "newsletter" } }),
    ]),
  ]);

  const [totalAll, cntNew, cntContacted, cntConverted, cntContact, cntTestDrive, cntNewsletter] = counts;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (source) p.set("source", source);
    if (status) p.set("status", status);
    p.set("page", "1");
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    return `/admin/leads?${p.toString()}`;
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">{totalAll} total · {cntNew} new</p>
        </div>
        <LeadExportButton source={source} status={status} />
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "All",        value: totalAll,      q: {},                  color: "border-gray-200" },
          { label: "New",        value: cntNew,        q: { status: "new" },   color: "border-amber-300 bg-amber-50" },
          { label: "Contacted",  value: cntContacted,  q: { status: "contacted"}, color: "border-blue-200 bg-blue-50" },
          { label: "Converted",  value: cntConverted,  q: { status: "converted"}, color: "border-emerald-200 bg-emerald-50" },
        ].map((chip) => (
          <Link key={chip.label} href={buildHref(chip.q as Record<string,string>)}
            className={`bg-white rounded-xl border p-3 text-center hover:shadow-sm transition-all ${chip.color}`}>
            <p className="text-xl font-bold text-gray-900">{chip.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{chip.label}</p>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter by source:</span>
        {[
          { label: "All Sources",  value: "" },
          { label: "Contact Form", value: "contact_form",  count: cntContact    },
          { label: "Test Drive",   value: "test_drive",    count: cntTestDrive  },
          { label: "Newsletter",   value: "newsletter",    count: cntNewsletter },
        ].map((f) => (
          <Link key={f.value}
            href={buildHref({ source: f.value })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              source === f.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {f.label}
            {"count" in f && <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${source === f.value ? "bg-white/20" : "bg-gray-100 text-gray-500"}`}>{f.count}</span>}
          </Link>
        ))}

        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Status:</span>
        {[
          { label: "All",       value: ""          },
          { label: "New",       value: "new"       },
          { label: "Contacted", value: "contacted" },
          { label: "Converted", value: "converted" },
          { label: "Lost",      value: "lost"      },
        ].map((f) => (
          <Link key={f.value}
            href={buildHref({ status: f.value })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              status === f.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No leads match these filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-slate-50/60">
                  <th className="text-left px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Contact</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Vehicle / Notes</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => {
                  const src = SOURCE_LABELS[lead.source] ?? { label: lead.source, color: "bg-gray-100 text-gray-600" };
                  const statusColor = STATUS_COLORS[lead.status] ?? "bg-gray-100 text-gray-600 border-gray-200";
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-800">{lead.name}</p>
                        {lead.city && (
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {lead.city}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        <div className="space-y-0.5">
                          <a href={`tel:${lead.mobile}`}
                            className="flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-blue-600 transition-colors">
                            <Phone className="w-3 h-3 text-green-500" /> {lead.mobile}
                          </a>
                          {lead.email && (
                            <a href={`mailto:${lead.email}`}
                              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors truncate max-w-[180px]">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {lead.vehicleName && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Car className="w-3 h-3 text-gray-400" /> {lead.vehicleName}
                          </p>
                        )}
                        {lead.notes && (
                          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[180px]">{lead.notes}</p>
                        )}
                        {!lead.vehicleName && !lead.notes && <span className="text-gray-300 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${src.color}`}>{src.label}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <LeadStatusSelect leadId={lead.id} current={lead.status} colors={STATUS_COLORS} />
                      </td>
                      <td className="px-3 py-3.5">
                        <Link href={`/admin/leads/${lead.id}`}
                          className="text-[10px] font-semibold text-blue-600 hover:underline whitespace-nowrap">
                          View →
                        </Link>
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> {timeAgo(new Date(lead.createdAt))}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1) })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 transition-all">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1) })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300 transition-all">
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
