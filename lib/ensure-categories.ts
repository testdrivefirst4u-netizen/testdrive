import prisma from "@/lib/prisma";

const DEFAULT_CATEGORIES = [
  // Cars
  { name: "Cars",        slug: "cars",        type: "CAR"        as const, sortOrder: 1  },
  { name: "SUV",         slug: "suv",         type: "CAR"        as const, sortOrder: 2  },
  { name: "Sedan",       slug: "sedan",       type: "CAR"        as const, sortOrder: 3  },
  { name: "Hatchback",   slug: "hatchback",   type: "CAR"        as const, sortOrder: 4  },
  { name: "MUV",         slug: "muv",         type: "CAR"        as const, sortOrder: 5  },
  { name: "Luxury Car",  slug: "luxury-car",  type: "CAR"        as const, sortOrder: 6  },
  // Bikes
  { name: "Bikes",       slug: "bikes",       type: "BIKE"       as const, sortOrder: 10 },
  { name: "Sports Bike", slug: "sports-bike", type: "BIKE"       as const, sortOrder: 11 },
  { name: "Cruiser",     slug: "cruiser",     type: "BIKE"       as const, sortOrder: 12 },
  { name: "Adventure",   slug: "adventure",   type: "BIKE"       as const, sortOrder: 13 },
  { name: "Commuter",    slug: "commuter",    type: "BIKE"       as const, sortOrder: 14 },
  // Scooters
  { name: "Scooters",    slug: "scooters",    type: "SCOOTER"    as const, sortOrder: 20 },
  // Electric (EV)
  { name: "Electric",         slug: "electric",          type: "EV" as const, sortOrder: 30 },
  { name: "Electric Car",     slug: "electric-car",      type: "EV" as const, sortOrder: 31 },
  { name: "Electric Bike",    slug: "electric-bike",     type: "EV" as const, sortOrder: 32 },
  { name: "Electric Scooter", slug: "electric-scooter",  type: "EV" as const, sortOrder: 33 },
  // Commercial
  { name: "Commercial",       slug: "commercial",        type: "COMMERCIAL" as const, sortOrder: 40 },
  { name: "Truck",            slug: "truck",             type: "COMMERCIAL" as const, sortOrder: 41 },
  { name: "Van",              slug: "van",               type: "COMMERCIAL" as const, sortOrder: 42 },
  { name: "Mini Truck",       slug: "mini-truck",        type: "COMMERCIAL" as const, sortOrder: 43 },
  { name: "Pickup",           slug: "pickup",            type: "COMMERCIAL" as const, sortOrder: 44 },
];

let seeded = false;

export async function ensureDefaultCategories() {
  if (seeded) return;
  const count = await prisma.category.count();
  if (count >= DEFAULT_CATEGORIES.length) { seeded = true; return; }

  await Promise.all(
    DEFAULT_CATEGORIES.map((cat) =>
      prisma.category.upsert({
        where: { slug: cat.slug },
        update: {},
        create: { ...cat, isActive: true },
      })
    )
  );
  seeded = true;
}
