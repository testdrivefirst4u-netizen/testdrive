import prisma from "@/lib/prisma";
import { VehicleForm } from "@/components/admin/vehicle-form";

export default async function NewVehiclePage() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({ where: { status: "PUBLISHED" }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, select: { id: true, name: true, type: true } }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">Add Vehicle</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new vehicle listing</p>
      </div>
      <VehicleForm brands={brands} categories={categories} />
    </div>
  );
}
