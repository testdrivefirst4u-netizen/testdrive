import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { DeleteButton } from "@/components/admin/delete-button";
import Image from "next/image";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { vehicles: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-gray-500 mt-1">{brands.length} total brands</p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-700">
          <Link href="/admin/brands/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Brand
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Country</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Vehicles</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Popular</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {brands.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No brands yet.{" "}
                      <Link href="/admin/brands/new" className="text-red-600 hover:underline">
                        Add the first brand
                      </Link>
                    </td>
                  </tr>
                )}
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {brand.logo ? (
                          <Image src={brand.logo} alt={brand.name} width={36} height={36} className="rounded object-contain bg-gray-100 p-1" />
                        ) : (
                          <div className="w-9 h-9 rounded bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                            {brand.name[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{brand.name}</p>
                          <p className="text-xs text-gray-400">/{brand.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{brand.country || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{brand._count.vehicles}</td>
                    <td className="px-4 py-3">
                      <Badge variant={brand.status === "PUBLISHED" ? "default" : "secondary"} className={brand.status === "PUBLISHED" ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                        {brand.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {brand.isPopular && <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">Popular</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/brands/${brand.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DeleteButton id={brand.id} apiPath="/api/admin/brands" label="brand" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
