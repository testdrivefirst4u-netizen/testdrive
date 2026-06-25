import prisma from "@/lib/prisma";
import { BrandTabs, type BrandItem } from "@/components/home/BrandTabs";

/* ── DB helpers ─────────────────────────────────────────── */

type RawBrand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  _count: { vehicles: number };
};

function toItem(b: RawBrand, count?: number): BrandItem {
  return {
    id:    b.id,
    name:  b.name,
    slug:  b.slug,
    logo:  b.logo,
    count: count ?? b._count.vehicles,
  };
}

const BASE_SELECT = {
  id:   true,
  name: true,
  slug: true,
  logo: true,
} as const;

const PUBLISHED = { status: "PUBLISHED" as const };

async function fetchBrands() {
  try {
    const [cars, bikes, electric, commercial] = await Promise.all([
      /* Cars — non-electric CAR type */
      prisma.brand.findMany({
        where: {
          ...PUBLISHED,
          vehicles: { some: { ...PUBLISHED, type: "CAR", isElectric: false } },
        },
        select: {
          ...BASE_SELECT,
          _count: { select: { vehicles: { where: { ...PUBLISHED, type: "CAR", isElectric: false } } } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),

      /* Bikes — BIKE or SCOOTER */
      prisma.brand.findMany({
        where: {
          ...PUBLISHED,
          vehicles: { some: { ...PUBLISHED, type: { in: ["BIKE", "SCOOTER"] } } },
        },
        select: {
          ...BASE_SELECT,
          _count: { select: { vehicles: { where: { ...PUBLISHED, type: { in: ["BIKE", "SCOOTER"] } } } } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),

      /* Electric — isElectric OR type EV */
      prisma.brand.findMany({
        where: {
          ...PUBLISHED,
          vehicles: { some: { ...PUBLISHED, OR: [{ isElectric: true }, { type: "EV" }] } },
        },
        select: {
          ...BASE_SELECT,
          _count: { select: { vehicles: { where: { ...PUBLISHED, OR: [{ isElectric: true }, { type: "EV" }] } } } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),

      /* Commercial */
      prisma.brand.findMany({
        where: {
          ...PUBLISHED,
          vehicles: { some: { ...PUBLISHED, type: "COMMERCIAL" } },
        },
        select: {
          ...BASE_SELECT,
          _count: { select: { vehicles: { where: { ...PUBLISHED, type: "COMMERCIAL" } } } },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      }),
    ]);

    return {
      cars:       cars.map(toItem),
      bikes:      bikes.map(toItem),
      electric:   electric.map(toItem),
      commercial: commercial.map(toItem),
    };
  } catch {
    return { cars: [], bikes: [], electric: [], commercial: [] };
  }
}

/* ── Server Component ───────────────────────────────────── */

export async function PopularBrands() {
  const { cars, bikes, electric, commercial } = await fetchBrands();

  if (cars.length === 0 && bikes.length === 0 && electric.length === 0 && commercial.length === 0) {
    return null;
  }

  return (
    <BrandTabs
      cars={cars}
      bikes={bikes}
      electric={electric}
      commercial={commercial}
    />
  );
}
