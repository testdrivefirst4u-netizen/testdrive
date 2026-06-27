import Link from "next/link";
import { Plus, Pencil, Search, Copy, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import Image from "next/image";

interface SearchParams { page?: string; status?: string; type?: string; search?: string }

export default async function VehiclesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const page = parseInt(sp.page || "1");
  const limit = 20;

  const where: any = {};
  if (sp.status) where.status = sp.status;
  if (sp.type) where.type = sp.type;
  if (sp.search) where.OR = [
    { name: { contains: sp.search, mode: "insensitive" } },
    { slug: { contains: sp.search, mode: "insensitive" } },
    { brand: { name: { contains: sp.search, mode: "insensitive" } } },
  ];

  const [vehicles, total, counts] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        brand: { select: { name: true } },
        category: { select: { name: true } },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true } },
      },
    }),
    prisma.vehicle.count({ where }),
    Promise.all([
      prisma.vehicle.count({}),
      prisma.vehicle.count({ where: { status: "PUBLISHED" } }),
      prisma.vehicle.count({ where: { status: "DRAFT" } }),
      prisma.vehicle.count({ where: { status: "ARCHIVED" } }),
    ]),
  ]);

  const [allCount, pubCount, draftCount, archCount] = counts;

  const typeColors: Record<string, string> = {
    CAR: "bg-blue-100 text-blue-700",
    BIKE: "bg-purple-100 text-purple-700",
    SCOOTER: "bg-orange-100 text-orange-700",
    EV: "bg-green-100 text-green-700",
    COMMERCIAL: "bg-gray-100 text-gray-700",
  };

  const statusLabels = [
    { label: "All", status: "", count: allCount },
    { label: "Published", status: "PUBLISHED", count: pubCount },
    { label: "Draft", status: "DRAFT", count: draftCount },
    { label: "Archived", status: "ARCHIVED", count: archCount },
  ];

  const totalPages = Math.ceil(total / limit);
  const buildHref = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    if (sp.search) p.set("search", sp.search);
    if (sp.status) p.set("status", sp.status);
    if (sp.type) p.set("type", sp.type);
    Object.entries(overrides).forEach(([k, v]) => v ? p.set(k, v) : p.delete(k));
    const s = p.toString();
    return `/admin/vehicles${s ? `?${s}` : ""}`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} result{total !== 1 && "s"}{sp.search ? ` for "${sp.search}"` : ""}</p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700 shadow-sm">
          <Link href="/admin/vehicles/new">
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle
          </Link>
        </Button>
      </div>

      {/* Search + Type filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <form method="GET" action="/admin/vehicles" className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            name="search"
            defaultValue={sp.search || ""}
            placeholder="Search vehicles or brands…"
            className="pl-9 h-9 text-sm"
          />
          {sp.status && <input type="hidden" name="status" value={sp.status} />}
          {sp.type && <input type="hidden" name="type" value={sp.type} />}
        </form>

        {/* Type tabs */}
        <div className="flex gap-1">
          {["", "CAR", "BIKE", "SCOOTER", "EV", "COMMERCIAL"].map((t) => (
            <Link key={t} href={buildHref({ type: t, page: "1" })}>
              <Button
                variant={sp.type === t || (!sp.type && !t) ? "default" : "outline"}
                size="sm"
                className={`text-xs h-8 px-3 ${sp.type === t || (!sp.type && !t) ? "bg-gray-900 hover:bg-gray-800" : ""}`}
              >
                {t || "All Types"}
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2">
        {statusLabels.map((f) => (
          <Link key={f.label} href={buildHref({ status: f.status, page: "1" })}>
            <button
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                (sp.status === f.status || (!sp.status && !f.status))
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {f.label} <span className="ml-1 opacity-70 text-xs">({f.count})</span>
            </button>
          </Link>
        ))}
      </div>

      {/* Table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Vehicle</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Brand</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Variants</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Updated</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vehicles.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <p className="font-medium">No vehicles found</p>
                        {sp.search ? (
                          <p className="text-sm">Try a different search term</p>
                        ) : (
                          <Link href="/admin/vehicles/new" className="text-red-600 text-sm hover:underline">Add the first vehicle →</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/70 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-9 shrink-0">
                          {(v.images[0]?.url || v.featuredImage) ? (
                            <Image src={v.images[0]?.url || v.featuredImage!} alt={v.name} fill className="rounded-md object-cover bg-gray-100" />
                          ) : (
                            <div className="w-12 h-9 bg-gray-100 rounded-md flex items-center justify-center text-gray-300 text-xs">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-gray-900 truncate">{v.name}</p>
                            {(v as any).featured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
                          </div>
                          <p className="text-xs text-gray-400 truncate">/{v.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-sm">{v.brand.name}</td>
                    <td className="px-4 py-3">
                      <Badge className={`${typeColors[v.type] || "bg-gray-100 text-gray-600"} hover:opacity-80 text-xs`}>{v.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium text-sm">{v.priceDisplay || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{v._count.variants}</td>
                    <td className="px-4 py-3">
                      <Badge className={
                        v.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-100 text-xs" :
                        v.status === "DRAFT" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 text-xs" :
                        "bg-gray-100 text-gray-600 hover:bg-gray-100 text-xs"
                      }>
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(v.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0" title="Edit">
                          <Link href={`/admin/vehicles/${v.id}`}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        <DeleteButton id={v.id} apiPath="/api/admin/vehicles" label="vehicle" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
              <span>Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</span>
              <div className="flex gap-1">
                {page > 1 && (
                  <Link href={buildHref({ page: String(page - 1) })}>
                    <Button variant="outline" size="sm" className="h-8">← Prev</Button>
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : i === 0 ? 1 : i === 6 ? totalPages : page - 3 + i;
                  return (
                    <Link key={p} href={buildHref({ page: String(p) })}>
                      <Button variant={p === page ? "default" : "outline"} size="sm" className={`h-8 w-8 ${p === page ? "bg-red-600 hover:bg-red-700" : ""}`}>
                        {p}
                      </Button>
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link href={buildHref({ page: String(page + 1) })}>
                    <Button variant="outline" size="sm" className="h-8">Next →</Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
