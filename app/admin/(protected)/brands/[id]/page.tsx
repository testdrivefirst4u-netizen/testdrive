import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { BrandForm } from "@/components/admin/brand-form";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({ where: { id } });
  if (!brand) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Brand</h1>
        <p className="text-sm text-gray-500 mt-1">{brand.name}</p>
      </div>
      <BrandForm brand={brand as any} />
    </div>
  );
}
