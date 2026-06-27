import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { VehicleForm } from '@/components/admin/vehicle-form';
import { ensureDefaultCategories } from '@/lib/ensure-categories';

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await ensureDefaultCategories();

  const [vehicle, brands, categories] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        colours: { orderBy: { sortOrder: 'asc' } },
        faqs: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
        seo: true,
      },
    }),
    prisma.brand.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, type: true },
    }),
  ]);

  if (!vehicle) notFound();

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Edit Vehicle</h1>
        <p className='text-sm text-gray-500 mt-1'>{vehicle.name}</p>
      </div>
      <VehicleForm
        vehicle={{
          ...vehicle,
          keyHighlights: (vehicle.keyHighlights as string[]) || [],
          pros: (vehicle.pros as string[]) || [],
          cons: (vehicle.cons as string[]) || [],
          launchDate: vehicle.launchDate?.toISOString() || null,

          variants: vehicle.variants.map((v) => ({
            ...v,
            priceDisplay: v.priceDisplay ?? undefined,
            fuelType: v.fuelType ?? undefined,
            transmission: v.transmission ?? undefined,
            mileage: v.mileage ?? undefined,
            range: v.range ?? undefined,
          })),

          images: vehicle.images.map((i) => ({
            ...i,
            fileId: i.fileId ?? undefined,
            type: i.type ?? 'gallery',
          })),

          colours: vehicle.colours.map((c) => ({
            ...c,
            hexCode: c.hexCode ?? undefined,
            imageUrl: c.imageUrl ?? undefined,
          })),

          features: vehicle.features.map((f) => ({
            ...f,
            note: f.note ?? undefined,
          })),
        }}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
