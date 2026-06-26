import Link from "next/link";
import { Inbox, ChevronLeft, ChevronRight, Search, AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { LeadExportButton } from "./lead-export-button";
import LeadsTableClient from "./leads-table-client";

const PAGE_SIZE = 20;

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; status?: string; page?: string; brandId?: string; q?: string; unassigned?: string }>;
}) {
  const params     = await searchParams;
  const source     = params.source     || "";
  const status     = params.status     || "";
  const brandId    = params.brandId    || "";
  const q          = params.q          || "";
  const unassigned = params.unassigned === "1";
  const page       = Math.max(1, Number(params.page) || 1);

  const [allBrands, allDealers] = await Promise.all([
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.dealer.findMany({ select: { id: true, name: true, brandId: true }, orderBy: { name: "asc" } }),
  ]);

  const where: any = {
    ...(source     ? { source }         : {}),
    ...(status     ? { status }         : {}),
    ...(brandId    ? { brandId }        : {}),
    ...(unassigned ? { dealerId: null } : {}),
  };
  if (q) {
    where.OR = [
      { name:        { contains: q, mode: "insensitive" } },
      { mobile:      { contains: q } },
      { vehicleName: { contains: q, mode: "insensitive" } },
      { email:       { contains: q, mode: "insensitive" } },
    ];
  }

  const [leads, total, cntNew, cntContacted, cntConverted, cntUnassigned] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        brand:  { select: { id: true, name: true } },
        dealer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { ...where, status: "new" } }),
    prisma.lead.count({ where: { ...where, status: "contacted" } }),
    prisma.lead.count({ where: { ...where, status: "converted" } }),
    prisma.lead.count({ where: { ...where, dealerId: null } }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildHref(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (source)     p.set("source",     source);
    if (status)     p.set("status",     status);
    if (brandId)    p.set("brandId",    brandId);
    if (q)          p.set("q",          q);
    if (unassigned) p.set("unassigned", "1");
    p.set("page", "1");
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v); else p.delete(k);
    }
    return `/admin/leads?${p.toString()}`;
  }

  const exportParams = new URLSearchParams();
  if (source)     exportParams.set("source",     source);
  if (status)     exportParams.set("status",     status);
  if (brandId)    exportParams.set("brandId",    brandId);
  if (q)          exportParams.set("q",          q);
  if (unassigned) exportParams.set("unassigned", "1");

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {total} leads
            {brandId ? ` · ${allBrands.find(b => b.id === brandId)?.name}` : " · all brands"}
            {unassigned ? " · unassigned only" : ""}
          </p>
        </div>
        <LeadExportButton source={source} status={status} />
      </div>

      {/* Search */}
      <form method="GET" action="/admin/leads" className="relative">
        {source     && <input type="hidden" name="source"     value={source} />}
        {status     && <input type="hidden" name="status"     value={status} />}
        {brandId    && <input type="hidden" name="brandId"    value={brandId} />}
        {unassigned && <input type="hidden" name="unassigned" value="1" />}
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name, phone, vehicle, or email…"
          className="w-full pl-10 pr-4 h-10 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
      </form>

      {/* Brand tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Link href={buildHref({ brandId: "", page: "1" })}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
            !brandId ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
          }`}>
          All Brands
        </Link>
        {allBrands.map(b => (
          <Link key={b.id} href={buildHref({ brandId: b.id, page: "1" })}
            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
              brandId === b.id ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {b.name}
          </Link>
        ))}
      </div>

      {/* Status + Unassigned summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",      value: total,          q: { status: "", unassigned: "" }, color: "border-gray-200" },
          { label: "New",        value: cntNew,          q: { status: "new", unassigned: "" }, color: "border-amber-300 bg-amber-50" },
          { label: "Contacted",  value: cntContacted,    q: { status: "contacted", unassigned: "" }, color: "border-blue-200 bg-blue-50" },
          { label: "Converted",  value: cntConverted,    q: { status: "converted", unassigned: "" }, color: "border-emerald-200 bg-emerald-50" },
          { label: "Unassigned", value: cntUnassigned,   q: { unassigned: cntUnassigned > 0 ? "1" : "", status: "" }, color: cntUnassigned > 0 ? "border-red-200 bg-red-50" : "border-gray-200" },
        ].map(chip => (
          <Link key={chip.label} href={buildHref(chip.q as Record<string, string>)}
            className={`bg-white rounded-xl border p-3 text-center hover:shadow-sm transition-all ${chip.color}`}>
            <p className="text-xl font-bold text-gray-900">{chip.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center gap-1">
              {chip.label === "Unassigned" && chip.value > 0 && <AlertCircle className="w-3 h-3 text-red-400" />}
              {chip.label}
            </p>
          </Link>
        ))}
      </div>

      {/* Source + Status filters */}
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Source:</span>
        {[
          { label: "All",          value: "" },
          { label: "Contact Form", value: "contact_form" },
          { label: "Test Drive",   value: "test_drive" },
          { label: "Offer Popup",  value: "offer_popup" },
          { label: "Compare",      value: "compare" },
        ].map(f => (
          <Link key={f.value} href={buildHref({ source: f.value, page: "1" })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              source === f.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {f.label}
          </Link>
        ))}

        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Status:</span>
        {[
          { label: "All",       value: "" },
          { label: "New",       value: "new" },
          { label: "Contacted", value: "contacted" },
          { label: "Converted", value: "converted" },
          { label: "Lost",      value: "lost" },
        ].map(f => (
          <Link key={f.value} href={buildHref({ status: f.value, page: "1" })}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              status === f.value ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            }`}>
            {f.label}
          </Link>
        ))}
      </div>

      {/* Leads table */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        {leads.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No leads found</p>
            <p className="text-gray-300 text-xs mt-1">{q ? `No results for "${q}"` : "Try adjusting brand or filters"}</p>
          </div>
        ) : (
          <LeadsTableClient leads={leads as any} allDealers={allDealers} />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-50">
            <p className="text-xs text-gray-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 && (
                <Link href={buildHref({ page: String(page - 1) })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300">
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </Link>
              )}
              {page < totalPages && (
                <Link href={buildHref({ page: String(page + 1) })}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:border-blue-300">
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
