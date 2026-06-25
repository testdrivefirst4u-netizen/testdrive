import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─── Image helpers ─────────────────────────────────────────────────────────
const IMG = {
  suv1: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80",
  suv2: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&q=80",
  suv3: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
  suv4: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80",
  hatch1: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
  hatch2: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  hatch3: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  hatch4: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
  ev1: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
  ev2: "https://images.unsplash.com/photo-1571068316344-75bc76679b65?auto=format&fit=crop&w=800&q=80",
  ev3: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80",
  ev4: "https://images.unsplash.com/photo-1611016186353-9af58c69a533?auto=format&fit=crop&w=800&q=80",
  bike1: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
  bike2: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?auto=format&fit=crop&w=800&q=80",
  bike3: "https://images.unsplash.com/photo-1547549082-6bc09f2049ae?auto=format&fit=crop&w=800&q=80",
  bike4: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80",
  scooter1: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
  scooter2: "https://images.unsplash.com/photo-1601758065893-25c11630c40a?auto=format&fit=crop&w=800&q=80",
};

async function main() {
  console.log("🌱 Seeding database...\n");

  // ── Admin user ──────────────────────────────────────────────────────────
  const password = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@walley.com" },
    update: {},
    create: { name: "Super Admin", email: "admin@walley.com", password, role: "SUPER_ADMIN" },
  });
  console.log("✅ Admin: admin@walley.com / Admin@123");

  // ── Spec groups ─────────────────────────────────────────────────────────
  const specGroupDefs = [
    { name: "Performance", slug: "performance", sortOrder: 1 },
    { name: "Battery & Range", slug: "battery-range", sortOrder: 2 },
    { name: "Dimensions", slug: "dimensions", sortOrder: 3 },
    { name: "Safety", slug: "safety", sortOrder: 4 },
    { name: "Comfort & Convenience", slug: "comfort-convenience", sortOrder: 5 },
    { name: "Infotainment", slug: "infotainment", sortOrder: 6 },
  ];
  for (const sg of specGroupDefs) {
    await prisma.specGroup.upsert({ where: { slug: sg.slug }, update: {}, create: sg });
  }
  console.log("✅ Spec groups created");

  // ── Categories ──────────────────────────────────────────────────────────
  const categoryDefs = [
    { name: "Cars", slug: "cars", type: "CAR" as const, sortOrder: 1 },
    { name: "Electric Cars", slug: "electric-cars", type: "EV" as const, sortOrder: 2 },
    { name: "SUVs", slug: "suvs", type: "CAR" as const, sortOrder: 3 },
    { name: "Bikes", slug: "bikes", type: "BIKE" as const, sortOrder: 4 },
    { name: "Scooters", slug: "scooters", type: "SCOOTER" as const, sortOrder: 5 },
    { name: "Commercial Vehicles", slug: "commercial-vehicles", type: "COMMERCIAL" as const, sortOrder: 6 },
  ];
  for (const cat of categoryDefs) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }
  console.log("✅ Categories created");

  // ── Brands ──────────────────────────────────────────────────────────────
  const brandDefs = [
    { name: "Tata Motors", slug: "tata", country: "India", isPopular: true, sortOrder: 1 },
    { name: "Mahindra", slug: "mahindra", country: "India", isPopular: true, sortOrder: 2 },
    { name: "Maruti Suzuki", slug: "maruti-suzuki", country: "India", isPopular: true, sortOrder: 3 },
    { name: "Hyundai", slug: "hyundai", country: "South Korea", isPopular: true, sortOrder: 4 },
    { name: "Kia", slug: "kia", country: "South Korea", isPopular: true, sortOrder: 5 },
    { name: "Honda", slug: "honda", country: "Japan", isPopular: true, sortOrder: 6 },
    { name: "Toyota", slug: "toyota", country: "Japan", isPopular: true, sortOrder: 7 },
    { name: "MG Motor", slug: "mg-motor", country: "UK", isPopular: true, sortOrder: 8 },
    { name: "BMW", slug: "bmw", country: "Germany", isPopular: false, sortOrder: 9 },
    { name: "Mercedes-Benz", slug: "mercedes-benz", country: "Germany", isPopular: false, sortOrder: 10 },
    { name: "Bajaj", slug: "bajaj", country: "India", isPopular: true, sortOrder: 11 },
    { name: "Royal Enfield", slug: "royal-enfield", country: "India", isPopular: true, sortOrder: 12 },
    { name: "Hero MotoCorp", slug: "hero-motocorp", country: "India", isPopular: true, sortOrder: 13 },
    { name: "TVS Motor", slug: "tvs-motor", country: "India", isPopular: true, sortOrder: 14 },
    { name: "Ola Electric", slug: "ola-electric", country: "India", isPopular: true, sortOrder: 15 },
    { name: "Ather Energy", slug: "ather-energy", country: "India", isPopular: true, sortOrder: 16 },
  ];
  for (const brand of brandDefs) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {},
      create: { ...brand, status: "PUBLISHED" },
    });
  }
  console.log("✅ Brands created");

  // ── Settings ────────────────────────────────────────────────────────────
  const settings = [
    { key: "site_name", value: "Walley", label: "Site Name", group: "general" },
    { key: "site_tagline", value: "India's Automotive Marketplace", label: "Tagline", group: "general" },
    { key: "contact_email", value: "info@walley.com", label: "Contact Email", group: "general" },
    { key: "currency", value: "INR", label: "Currency", group: "general" },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log("✅ Settings created\n");

  // ── Fetch brand & category IDs ───────────────────────────────────────────
  const [tata, mahindra, maruti, hyundai, royalEnfield, olaElectric, heroMotocorp, ather] =
    await Promise.all([
      prisma.brand.findUnique({ where: { slug: "tata" } }),
      prisma.brand.findUnique({ where: { slug: "mahindra" } }),
      prisma.brand.findUnique({ where: { slug: "maruti-suzuki" } }),
      prisma.brand.findUnique({ where: { slug: "hyundai" } }),
      prisma.brand.findUnique({ where: { slug: "royal-enfield" } }),
      prisma.brand.findUnique({ where: { slug: "ola-electric" } }),
      prisma.brand.findUnique({ where: { slug: "hero-motocorp" } }),
      prisma.brand.findUnique({ where: { slug: "ather-energy" } }),
    ]);

  const [carsCat, suvsCat, evsCat, bikesCat, scootersCat] = await Promise.all([
    prisma.category.findUnique({ where: { slug: "cars" } }),
    prisma.category.findUnique({ where: { slug: "suvs" } }),
    prisma.category.findUnique({ where: { slug: "electric-cars" } }),
    prisma.category.findUnique({ where: { slug: "bikes" } }),
    prisma.category.findUnique({ where: { slug: "scooters" } }),
  ]);

  // ── Helper: upsert vehicle with relations ────────────────────────────────
  type VehicleInput = {
    slug: string;
    data: Parameters<typeof prisma.vehicle.create>[0]["data"];
    images: { url: string; alt: string; type?: string; sortOrder?: number }[];
    colours: { name: string; hexCode: string; imageUrl?: string }[];
    variants: {
      name: string;
      slug: string;
      priceMin: number;
      priceMax: number;
      priceDisplay: string;
      fuelType?: string;
      transmission?: string;
      mileage?: string;
      range?: string;
      isDefault?: boolean;
    }[];
    faqs: { question: string; answer: string; sortOrder: number }[];
  };

  async function seedVehicle({ slug, data, images, colours, variants, faqs }: VehicleInput) {
    const existing = await prisma.vehicle.findUnique({ where: { slug } });
    if (existing) {
      console.log(`  ⏭  ${slug} already exists, skipping`);
      return existing;
    }

    const vehicle = await prisma.vehicle.create({ data });

    await Promise.all([
      ...images.map((img, i) =>
        prisma.vehicleImage.create({
          data: { vehicleId: vehicle.id, ...img, sortOrder: img.sortOrder ?? i },
        })
      ),
      ...colours.map((col, i) =>
        prisma.vehicleColour.create({
          data: { vehicleId: vehicle.id, ...col, sortOrder: i },
        })
      ),
      ...variants.map((v, i) =>
        prisma.variant.create({
          data: { vehicleId: vehicle.id, ...v, sortOrder: i, status: "PUBLISHED" },
        })
      ),
      ...faqs.map((f) =>
        prisma.faq.create({
          data: { vehicleId: vehicle.id, ...f, isActive: true },
        })
      ),
    ]);

    console.log(`  ✅ ${data.name}`);
    return vehicle;
  }

  // ════════════════════════════════════════════════════════════════════════
  //  CARS & SUVs
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n🚗 Seeding Cars & SUVs...");

  // 1. Tata Nexon EV Max
  await seedVehicle({
    slug: "tata-nexon-ev-max",
    data: {
      name: "Tata Nexon EV Max",
      slug: "tata-nexon-ev-max",
      type: "EV",
      brandId: tata!.id,
      categoryId: evsCat!.id,
      bodyType: "Compact SUV",
      segment: "Compact SUV",
      isElectric: true,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 1799000,
      priceMax: 2199000,
      priceDisplay: "₹17.99 – ₹21.99 Lakh",
      batteryCapacity: "40.5 kWh",
      chargingTime: "8.6 hours (AC) / 56 min (DC)",
      fastCharging: true,
      range: "465 km",
      motorPower: "143 bhp",
      motorTorque: "250 Nm",
      topSpeed: "150 km/h",
      shortDescription:
        "India's best-selling electric SUV with a 465 km certified range and a premium cabin packed with tech.",
      description:
        "The Tata Nexon EV Max is the extended-range version of India's best-selling electric vehicle. Powered by a 40.5 kWh Ziptron battery, it delivers an MIDC-certified range of 465 km on a single charge. The permanent magnet synchronous motor produces 143 bhp and 250 Nm of instant torque, making it one of the quickest compact SUVs in India. It supports DC fast charging up to 50 kW, allowing the battery to charge from 10% to 80% in under an hour. Inside, you get a 12.3-inch touchscreen infotainment system with connected car technology, ventilated front seats, a panoramic sunroof, and a premium JBL sound system. Safety is handled by 6 airbags, ESC, hill-hold assist, and a 5-star Global NCAP rating.",
      overview:
        "The Tata Nexon EV Max represents the pinnacle of affordable electric mobility in India. With its long-range 40.5 kWh battery and rapid DC fast charging, it removes range anxiety entirely. The cabin is refined, technology-rich, and safe—making it a compelling proposition for both family buyers and eco-conscious urbanites.",
      keyHighlights: [
        "465 km MIDC-certified range",
        "5-Star Global NCAP safety rating",
        "DC fast charging (10–80% in 56 min)",
        "12.3-inch touchscreen with connected car tech",
        "Panoramic sunroof",
        "Ventilated front seats",
      ],
      pros: [
        "Excellent real-world range",
        "Fast DC charging support",
        "5-star safety rating",
        "Spacious and well-equipped cabin",
        "Lower running costs vs petrol",
      ],
      cons: [
        "Slightly expensive upfront cost",
        "DC chargers not widely available in Tier 2 cities",
        "Suspension can feel stiff on broken roads",
        "Boot space is average for the segment",
      ],
      launchDate: new Date("2022-05-11"),
      sortOrder: 1,
    },
    images: [
      { url: IMG.ev1, alt: "Tata Nexon EV Max - Front View", type: "gallery", sortOrder: 0 },
      { url: IMG.ev2, alt: "Tata Nexon EV Max - Side View", type: "gallery", sortOrder: 1 },
      { url: IMG.ev3, alt: "Tata Nexon EV Max - Interior", type: "gallery", sortOrder: 2 },
      { url: IMG.ev4, alt: "Tata Nexon EV Max - Charging", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Intensi-Teal", hexCode: "#007B7B", imageUrl: IMG.ev1 },
      { name: "Daytona Grey", hexCode: "#6B6B6B", imageUrl: IMG.ev2 },
      { name: "Calgary White", hexCode: "#F5F5F5", imageUrl: IMG.ev3 },
      { name: "Flame Red", hexCode: "#C0392B", imageUrl: IMG.ev4 },
    ],
    variants: [
      { name: "Medium Range XZ", slug: "medium-range-xz", priceMin: 1499000, priceMax: 1499000, priceDisplay: "₹14.99 Lakh", fuelType: "Electric", transmission: "Automatic", mileage: "312 km", isDefault: false },
      { name: "Long Range XZ+", slug: "long-range-xz-plus", priceMin: 1799000, priceMax: 1799000, priceDisplay: "₹17.99 Lakh", fuelType: "Electric", transmission: "Automatic", range: "465 km", isDefault: true },
      { name: "Long Range XZ+ Lux", slug: "long-range-xz-plus-lux", priceMin: 2199000, priceMax: 2199000, priceDisplay: "₹21.99 Lakh", fuelType: "Electric", transmission: "Automatic", range: "465 km", isDefault: false },
    ],
    faqs: [
      { question: "What is the real-world range of Tata Nexon EV Max?", answer: "In real-world conditions, the Nexon EV Max delivers 300–380 km depending on driving style, AC usage, and road conditions. The MIDC-certified range is 465 km.", sortOrder: 0 },
      { question: "How long does it take to charge the Nexon EV Max?", answer: "With AC home charging (7.2 kW), the battery fully charges in about 8.6 hours. With a 50 kW DC fast charger, you can go from 10% to 80% in approximately 56 minutes.", sortOrder: 1 },
      { question: "Does Tata Nexon EV Max come with a home charger?", answer: "Yes, Tata Motors provides a 7.2 kW AC wall box charger along with purchase. Installation support is also provided through their network.", sortOrder: 2 },
    ],
  });

  // 2. Tata Nexon Petrol
  await seedVehicle({
    slug: "tata-nexon",
    data: {
      name: "Tata Nexon",
      slug: "tata-nexon",
      type: "CAR",
      brandId: tata!.id,
      categoryId: suvsCat!.id,
      bodyType: "Compact SUV",
      segment: "Compact SUV",
      isElectric: false,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 799000,
      priceMax: 1499000,
      priceDisplay: "₹7.99 – ₹14.99 Lakh",
      engine: "1.2L Turbo Petrol / 1.5L Diesel",
      power: "118 bhp (Petrol) / 113 bhp (Diesel)",
      torque: "170 Nm (Petrol) / 260 Nm (Diesel)",
      mileage: "17.01 kmpl (Petrol) / 23.21 kmpl (Diesel)",
      topSpeed: "180 km/h",
      shortDescription:
        "India's first 5-star safe compact SUV with turbocharged engines, bold styling, and segment-leading features.",
      description:
        "The Tata Nexon is a 5-star Global NCAP-rated compact SUV that reshaped India's automotive landscape. Available with a 1.2L turbocharged petrol engine producing 118 bhp and a 1.5L diesel making 113 bhp, it offers both performance and efficiency. The AMT and manual transmission options cater to every buyer. With a bold design, feature-rich interior, and the industry's best safety credentials, the Nexon continues to dominate India's compact SUV segment.",
      overview:
        "The Tata Nexon sits at the sweet spot of safety, style, and value. Its 5-star Global NCAP rating is unmatched in its price band, and the feature list—panoramic sunroof, connected car tech, 10.25-inch touchscreen—rivals cars that cost much more.",
      keyHighlights: [
        "5-Star Global NCAP safety rating",
        "Turbo petrol and diesel options",
        "10.25-inch touchscreen infotainment",
        "Panoramic sunroof available",
        "AMT and manual transmission choices",
        "iRA connected car technology",
      ],
      pros: [
        "Best-in-class safety rating",
        "Punchy turbo petrol engine",
        "Good diesel fuel economy",
        "Modern, spacious interior",
        "Strong resale value",
      ],
      cons: [
        "Stiff ride quality",
        "Diesel variants are pricey",
        "Rear seat headroom tight for tall passengers",
        "No automatic diesel option",
      ],
      launchDate: new Date("2017-01-18"),
      sortOrder: 2,
    },
    images: [
      { url: IMG.suv1, alt: "Tata Nexon - Front View", type: "gallery", sortOrder: 0 },
      { url: IMG.suv2, alt: "Tata Nexon - Side Profile", type: "gallery", sortOrder: 1 },
      { url: IMG.suv3, alt: "Tata Nexon - Interior Dashboard", type: "gallery", sortOrder: 2 },
      { url: IMG.suv4, alt: "Tata Nexon - Rear View", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Flame Red", hexCode: "#C0392B", imageUrl: IMG.suv1 },
      { name: "Foliage Green", hexCode: "#4A6741", imageUrl: IMG.suv2 },
      { name: "Pristine White", hexCode: "#F5F5F5", imageUrl: IMG.suv3 },
      { name: "Daytona Grey", hexCode: "#6B6B6B", imageUrl: IMG.suv4 },
    ],
    variants: [
      { name: "XE 1.2 Turbo", slug: "xe-1-2-turbo", priceMin: 799000, priceMax: 799000, priceDisplay: "₹7.99 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "17.01 kmpl", isDefault: false },
      { name: "XM 1.2 Turbo AMT", slug: "xm-1-2-turbo-amt", priceMin: 975000, priceMax: 975000, priceDisplay: "₹9.75 Lakh", fuelType: "Petrol", transmission: "AMT", mileage: "17.01 kmpl", isDefault: true },
      { name: "XZ+ 1.5 Diesel", slug: "xz-plus-1-5-diesel", priceMin: 1280000, priceMax: 1280000, priceDisplay: "₹12.80 Lakh", fuelType: "Diesel", transmission: "Manual", mileage: "23.21 kmpl", isDefault: false },
      { name: "XZA+ 1.2 Turbo AMT", slug: "xza-plus-1-2-turbo-amt", priceMin: 1499000, priceMax: 1499000, priceDisplay: "₹14.99 Lakh", fuelType: "Petrol", transmission: "AMT", mileage: "17.01 kmpl", isDefault: false },
    ],
    faqs: [
      { question: "Which is better—Tata Nexon petrol or diesel?", answer: "The petrol is peppy for city driving with 118 bhp. The diesel offers 23 kmpl fuel efficiency and better highway torque. Choose petrol for urban use and diesel for high-mileage highway drivers.", sortOrder: 0 },
      { question: "Does Tata Nexon have a sunroof?", answer: "Yes, the Nexon's top variants (XZ+ and above) offer a panoramic sunroof. Lower trims do not include this feature.", sortOrder: 1 },
      { question: "What is the ground clearance of Tata Nexon?", answer: "The Tata Nexon has a ground clearance of 209 mm, making it capable of handling bad roads and mild off-road terrain.", sortOrder: 2 },
    ],
  });

  // 3. Maruti Swift
  await seedVehicle({
    slug: "maruti-suzuki-swift",
    data: {
      name: "Maruti Suzuki Swift",
      slug: "maruti-suzuki-swift",
      type: "CAR",
      brandId: maruti!.id,
      categoryId: carsCat!.id,
      bodyType: "Hatchback",
      segment: "Premium Hatchback",
      isElectric: false,
      isPopular: true,
      isNew: true,
      status: "PUBLISHED",
      priceMin: 679000,
      priceMax: 999000,
      priceDisplay: "₹6.79 – ₹9.99 Lakh",
      engine: "1.2L DualJet Petrol",
      power: "81 bhp",
      torque: "111.7 Nm",
      mileage: "24.8 kmpl",
      topSpeed: "165 km/h",
      shortDescription:
        "India's most-loved hatchback, reimagined with a sportier look, 24.8 kmpl efficiency, and a feature-packed cabin.",
      description:
        "The 4th generation Maruti Suzuki Swift arrives with a bold new design inspired by the Heartect architecture. Its 1.2L DualJet petrol engine with idle start/stop technology delivers a class-leading 24.8 kmpl. The Swift now features a 9-inch SmartPlay Pro+ infotainment system, a 360-degree camera, heads-up display, and a 6-speed automatic option. With 6 airbags across all variants, it's also the safest Swift ever.",
      overview:
        "The 2024 Maruti Swift is the definitive fun-to-drive hatchback for India. Its sporty stance, frugal engine, and now-generous feature list make it the go-to choice for first-time buyers and urban commuters who want reliability without compromise.",
      keyHighlights: [
        "24.8 kmpl ARAI-certified fuel efficiency",
        "9-inch SmartPlay Pro+ touchscreen",
        "6 airbags across all variants",
        "360-degree surround view camera",
        "Heads-up display (HUD)",
        "6-speed AMT available",
      ],
      pros: [
        "Exceptional fuel economy",
        "Peppy and fun to drive",
        "Strong resale value",
        "Low maintenance cost",
        "6 airbags standard",
      ],
      cons: [
        "No diesel option",
        "Rear seat is cramped for adults",
        "No sunroof",
        "Basic suspension tuning",
      ],
      launchDate: new Date("2024-05-09"),
      sortOrder: 3,
    },
    images: [
      { url: IMG.hatch1, alt: "Maruti Swift - Front View", type: "gallery", sortOrder: 0 },
      { url: IMG.hatch2, alt: "Maruti Swift - Side Profile", type: "gallery", sortOrder: 1 },
      { url: IMG.hatch3, alt: "Maruti Swift - Interior", type: "gallery", sortOrder: 2 },
      { url: IMG.hatch4, alt: "Maruti Swift - Rear View", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Speedy Blue", hexCode: "#1A5276", imageUrl: IMG.hatch1 },
      { name: "Solid White", hexCode: "#FFFFFF", imageUrl: IMG.hatch2 },
      { name: "Magma Grey", hexCode: "#555555", imageUrl: IMG.hatch3 },
      { name: "Lucent Orange", hexCode: "#E67E22", imageUrl: IMG.hatch4 },
    ],
    variants: [
      { name: "LXi", slug: "lxi", priceMin: 679000, priceMax: 679000, priceDisplay: "₹6.79 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "24.8 kmpl", isDefault: false },
      { name: "VXi", slug: "vxi", priceMin: 769000, priceMax: 769000, priceDisplay: "₹7.69 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "24.8 kmpl", isDefault: true },
      { name: "ZXi", slug: "zxi", priceMin: 869000, priceMax: 869000, priceDisplay: "₹8.69 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "24.8 kmpl", isDefault: false },
      { name: "ZXi+ AMT", slug: "zxi-plus-amt", priceMin: 999000, priceMax: 999000, priceDisplay: "₹9.99 Lakh", fuelType: "Petrol", transmission: "AMT", mileage: "24.8 kmpl", isDefault: false },
    ],
    faqs: [
      { question: "What is the fuel efficiency of the new Maruti Swift 2024?", answer: "The 2024 Maruti Swift is ARAI-certified at 24.8 kmpl with its 1.2L DualJet engine, making it one of the most fuel-efficient hatchbacks in India.", sortOrder: 0 },
      { question: "Does the new Swift come with airbags?", answer: "Yes, the 2024 Swift comes with 6 airbags (dual front, side, and curtain) across all variants, which is a significant safety upgrade over the previous generation.", sortOrder: 1 },
      { question: "Is there a diesel variant of the Maruti Swift?", answer: "No, the 2024 Maruti Swift is available only with a 1.2L petrol engine. Maruti Suzuki discontinued the diesel Swift from their lineup.", sortOrder: 2 },
    ],
  });

  // 4. Hyundai Creta
  await seedVehicle({
    slug: "hyundai-creta",
    data: {
      name: "Hyundai Creta",
      slug: "hyundai-creta",
      type: "CAR",
      brandId: hyundai!.id,
      categoryId: suvsCat!.id,
      bodyType: "Compact SUV",
      segment: "Compact SUV",
      isElectric: false,
      isPopular: true,
      isNew: true,
      status: "PUBLISHED",
      priceMin: 1099000,
      priceMax: 2099000,
      priceDisplay: "₹10.99 – ₹20.99 Lakh",
      engine: "1.5L Petrol / 1.5L Diesel / 1.5L Turbo Petrol",
      power: "113 bhp (NA) / 113 bhp (Diesel) / 158 bhp (Turbo)",
      torque: "144 Nm / 250 Nm / 253 Nm",
      mileage: "17.4 kmpl (Petrol) / 21.8 kmpl (Diesel)",
      topSpeed: "185 km/h",
      shortDescription:
        "India's best-selling compact SUV, now with panoramic sunroof, Level 2 ADAS, and a bold new design.",
      description:
        "The 2024 Hyundai Creta is the segment-defining compact SUV that raises the bar yet again. It now sports a bold new design with a connected LED light bar, and the cabin gets a dual panoramic display (dual 10.25-inch screens), 10.25-inch digital cluster, and ventilated front and rear seats. The ADAS Level 2 suite includes lane-keep assist, adaptive cruise control, forward collision warning, and blind spot monitoring. Three engine options—1.5L naturally aspirated, 1.5L diesel, and 1.5L turbo petrol—cater to every use case.",
      overview:
        "The 2024 Hyundai Creta redefines the compact SUV segment with its tech-forward cabin, robust engine lineup, and segment-first ADAS Level 2 suite. It is the car that every other compact SUV is measured against.",
      keyHighlights: [
        "Dual 10.25-inch panoramic display",
        "Level 2 ADAS safety suite",
        "Panoramic sunroof",
        "Ventilated front and rear seats",
        "1.5L turbo petrol with 158 bhp",
        "6 airbags standard",
      ],
      pros: [
        "Best-in-class feature list",
        "Multiple engine options",
        "Level 2 ADAS standard",
        "Spacious 5-seater cabin",
        "Strong brand reputation",
      ],
      cons: [
        "Top variants are expensive",
        "Turbo petrol only with DCT",
        "Large size makes city parking tricky",
        "No all-wheel drive option",
      ],
      launchDate: new Date("2024-01-16"),
      sortOrder: 4,
    },
    images: [
      { url: IMG.suv2, alt: "Hyundai Creta - Front View", type: "gallery", sortOrder: 0 },
      { url: IMG.suv1, alt: "Hyundai Creta - Side Profile", type: "gallery", sortOrder: 1 },
      { url: IMG.suv4, alt: "Hyundai Creta - Interior", type: "gallery", sortOrder: 2 },
      { url: IMG.suv3, alt: "Hyundai Creta - Rear View", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Abyss Black", hexCode: "#1A1A1A", imageUrl: IMG.suv2 },
      { name: "Atlas White", hexCode: "#FAFAFA", imageUrl: IMG.suv1 },
      { name: "Ranger Khaki", hexCode: "#8B7355", imageUrl: IMG.suv4 },
      { name: "Fiery Red", hexCode: "#D0021B", imageUrl: IMG.suv3 },
    ],
    variants: [
      { name: "E 1.5 MT Petrol", slug: "e-1-5-mt-petrol", priceMin: 1099000, priceMax: 1099000, priceDisplay: "₹10.99 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "17.4 kmpl", isDefault: false },
      { name: "EX 1.5 MT Petrol", slug: "ex-1-5-mt-petrol", priceMin: 1299000, priceMax: 1299000, priceDisplay: "₹12.99 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "17.4 kmpl", isDefault: true },
      { name: "S 1.5 MT Diesel", slug: "s-1-5-mt-diesel", priceMin: 1549000, priceMax: 1549000, priceDisplay: "₹15.49 Lakh", fuelType: "Diesel", transmission: "Manual", mileage: "21.8 kmpl", isDefault: false },
      { name: "SX(O) 1.5 Turbo DCT", slug: "sxo-1-5-turbo-dct", priceMin: 2099000, priceMax: 2099000, priceDisplay: "₹20.99 Lakh", fuelType: "Petrol", transmission: "DCT", mileage: "18.4 kmpl", isDefault: false },
    ],
    faqs: [
      { question: "Does Hyundai Creta have ADAS?", answer: "Yes, the 2024 Hyundai Creta is the first car in its segment to offer Level 2 ADAS, including adaptive cruise control, lane-keep assist, forward collision avoidance, blind spot collision warning, and more—available on SX and above variants.", sortOrder: 0 },
      { question: "What is the mileage of Hyundai Creta diesel?", answer: "The Hyundai Creta 1.5L diesel delivers an ARAI-certified 21.8 kmpl, making it one of the most fuel-efficient SUVs in the compact segment.", sortOrder: 1 },
      { question: "How many colours is the 2024 Creta available in?", answer: "The 2024 Hyundai Creta is available in 8 monotone and dual-tone colour options including Abyss Black, Atlas White, Ranger Khaki, Fiery Red, Robust Emerald, and more.", sortOrder: 2 },
    ],
  });

  // 5. Mahindra XUV700
  await seedVehicle({
    slug: "mahindra-xuv700",
    data: {
      name: "Mahindra XUV700",
      slug: "mahindra-xuv700",
      type: "CAR",
      brandId: mahindra!.id,
      categoryId: suvsCat!.id,
      bodyType: "SUV",
      segment: "Mid-size SUV",
      isElectric: false,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 1399000,
      priceMax: 2649000,
      priceDisplay: "₹13.99 – ₹26.49 Lakh",
      engine: "2.0L mStallion Turbo Petrol / 2.2L mHawk Diesel",
      power: "197 bhp (Petrol) / 182 bhp (Diesel)",
      torque: "380 Nm / 450 Nm",
      mileage: "14.9 kmpl (Petrol) / 16.6 kmpl (Diesel)",
      topSpeed: "200 km/h",
      shortDescription:
        "A full-size SUV packed with ADAS, a superscreen dual display, AWD, and available in 5 and 7-seat configurations.",
      description:
        "The Mahindra XUV700 is a technological tour de force from an Indian manufacturer. Powered by a 2.0L mStallion turbo petrol producing 197 bhp or the powerful 2.2L mHawk diesel at 182 bhp, it is the most powerful mid-size SUV in India. The cabin features dual 10.25-inch screens (AdrenoX infotainment + digital cluster), Level 2 ADAS (17 features), Sony 3D sound with 12 speakers, panoramic sunroof, and an available AWD drivetrain. Available in 5-seat and 7-seat configurations, it punches well above its price point.",
      overview:
        "The Mahindra XUV700 is arguably the best value-for-money full-size SUV in India. With 197 bhp, AWD, 17-feature ADAS, and a premium dual-screen cockpit, it beats rivals costing twice its price.",
      keyHighlights: [
        "197 bhp 2.0L turbo petrol",
        "Level 2 ADAS with 17 safety features",
        "Dual 10.25-inch AdrenoX display",
        "AWD option available",
        "5 and 7-seat configurations",
        "Sony 3D sound system (12 speakers)",
      ],
      pros: [
        "Exceptional power-to-price ratio",
        "AWD availability",
        "Class-leading ADAS features",
        "7-seat option available",
        "Premium cabin quality",
      ],
      cons: [
        "Waiting period can be long",
        "Diesel AWD is expensive",
        "Infotainment can be laggy",
        "Third-row is tight",
      ],
      launchDate: new Date("2021-10-30"),
      sortOrder: 5,
    },
    images: [
      { url: IMG.suv4, alt: "Mahindra XUV700 - Front View", type: "gallery", sortOrder: 0 },
      { url: IMG.suv3, alt: "Mahindra XUV700 - Side Profile", type: "gallery", sortOrder: 1 },
      { url: IMG.suv2, alt: "Mahindra XUV700 - Interior", type: "gallery", sortOrder: 2 },
      { url: IMG.suv1, alt: "Mahindra XUV700 - Rear View", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Midnight Black", hexCode: "#1A1A1A", imageUrl: IMG.suv4 },
      { name: "Dazzling Silver", hexCode: "#C0C0C0", imageUrl: IMG.suv3 },
      { name: "Red Rage", hexCode: "#CC0000", imageUrl: IMG.suv2 },
      { name: "Galaxy Grey", hexCode: "#505050", imageUrl: IMG.suv1 },
    ],
    variants: [
      { name: "MX Petrol MT 5-Seat", slug: "mx-petrol-mt-5", priceMin: 1399000, priceMax: 1399000, priceDisplay: "₹13.99 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "14.9 kmpl", isDefault: false },
      { name: "AX5 Diesel MT 7-Seat", slug: "ax5-diesel-mt-7", priceMin: 1799000, priceMax: 1799000, priceDisplay: "₹17.99 Lakh", fuelType: "Diesel", transmission: "Manual", mileage: "16.6 kmpl", isDefault: true },
      { name: "AX7 Diesel AT AWD", slug: "ax7-diesel-at-awd", priceMin: 2349000, priceMax: 2349000, priceDisplay: "₹23.49 Lakh", fuelType: "Diesel", transmission: "Automatic", mileage: "15.2 kmpl", isDefault: false },
      { name: "AX7L Petrol AT 7-Seat", slug: "ax7l-petrol-at-7", priceMin: 2649000, priceMax: 2649000, priceDisplay: "₹26.49 Lakh", fuelType: "Petrol", transmission: "Automatic", mileage: "13.5 kmpl", isDefault: false },
    ],
    faqs: [
      { question: "Is Mahindra XUV700 available with AWD?", answer: "Yes, the Mahindra XUV700 is available with an AWD drivetrain on select diesel and petrol AT variants. It includes terrain management modes for mud, sand, and loose surfaces.", sortOrder: 0 },
      { question: "Does XUV700 have a 7-seat option?", answer: "Yes, the XUV700 is available in both 5-seat and 7-seat configurations. The 7-seat version has a third row with folding seats.", sortOrder: 1 },
      { question: "What ADAS features does the XUV700 have?", answer: "The XUV700 offers Level 2 ADAS with 17 features including adaptive cruise control, lane-keep assist, forward collision warning, automatic emergency braking, blind spot detection, rear cross-traffic alert, driver drowsiness detection, and more.", sortOrder: 2 },
    ],
  });

  // ════════════════════════════════════════════════════════════════════════
  //  BIKES
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n🏍️  Seeding Bikes...");

  // 6. Royal Enfield Classic 350
  await seedVehicle({
    slug: "royal-enfield-classic-350",
    data: {
      name: "Royal Enfield Classic 350",
      slug: "royal-enfield-classic-350",
      type: "BIKE",
      brandId: royalEnfield!.id,
      categoryId: bikesCat!.id,
      bodyType: "Cruiser",
      segment: "350cc Cruiser",
      isElectric: false,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 193999,
      priceMax: 226500,
      priceDisplay: "₹1.94 – ₹2.27 Lakh",
      engine: "349cc Single Cylinder Air/Oil-Cooled",
      power: "20.2 bhp",
      torque: "27 Nm",
      mileage: "35 kmpl",
      topSpeed: "120 km/h",
      shortDescription:
        "The quintessential Indian cruiser motorcycle, now with a modern J-platform chassis and improved refinement.",
      description:
        "The Royal Enfield Classic 350 is the best-selling Royal Enfield model in India, and perhaps the most iconic motorcycle on Indian roads. The latest iteration runs on the J-platform with a 349cc single-cylinder air/oil-cooled engine producing 20.2 bhp and 27 Nm of torque. The new frame makes it more stable at highway speeds, while the twin-channel ABS ensures safer braking. Available in a wide range of colour schemes including chrome-adorned Signals editions, it blends heritage aesthetics with modern reliability.",
      overview:
        "The Royal Enfield Classic 350 has been reimagined from the ground up with the new J-platform. More refined, safer with dual-channel ABS, and available in stunning period-correct colour schemes, it is the quintessential motorcycle for long-distance touring and city cruising alike.",
      keyHighlights: [
        "349cc modern J-platform engine",
        "Dual-channel ABS standard",
        "Tripper navigation system available",
        "35 kmpl fuel efficiency",
        "Heritage-inspired styling",
        "Available in Signals & Dark editions",
      ],
      pros: [
        "Iconic heritage styling",
        "Improved refinement over older models",
        "Strong highway cruiser",
        "Great community and accessories ecosystem",
        "Decent resale value",
      ],
      cons: [
        "Not a performance bike",
        "Heavy for new riders",
        "Basic tech features",
        "Long dealership waiting periods",
      ],
      launchDate: new Date("2021-08-20"),
      sortOrder: 6,
    },
    images: [
      { url: IMG.bike1, alt: "Royal Enfield Classic 350 - Side View", type: "gallery", sortOrder: 0 },
      { url: IMG.bike2, alt: "Royal Enfield Classic 350 - Front View", type: "gallery", sortOrder: 1 },
      { url: IMG.bike3, alt: "Royal Enfield Classic 350 - Detail", type: "gallery", sortOrder: 2 },
      { url: IMG.bike4, alt: "Royal Enfield Classic 350 - Action Shot", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Stealth Black", hexCode: "#1A1A1A", imageUrl: IMG.bike1 },
      { name: "Chrome Red", hexCode: "#A52A2A", imageUrl: IMG.bike2 },
      { name: "Halcyon Green", hexCode: "#2E8B57", imageUrl: IMG.bike3 },
      { name: "Redditch Blue", hexCode: "#003087", imageUrl: IMG.bike4 },
    ],
    variants: [
      { name: "Redditch 349cc", slug: "redditch", priceMin: 193999, priceMax: 193999, priceDisplay: "₹1.94 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "35 kmpl", isDefault: false },
      { name: "Halcyon 349cc", slug: "halcyon", priceMin: 210000, priceMax: 210000, priceDisplay: "₹2.10 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "35 kmpl", isDefault: true },
      { name: "Dark 349cc", slug: "dark", priceMin: 226500, priceMax: 226500, priceDisplay: "₹2.27 Lakh", fuelType: "Petrol", transmission: "Manual", mileage: "35 kmpl", isDefault: false },
    ],
    faqs: [
      { question: "What is the engine size of Royal Enfield Classic 350?", answer: "The Royal Enfield Classic 350 uses a 349cc single-cylinder, air/oil-cooled engine producing 20.2 bhp at 6,100 rpm and 27 Nm of torque at 4,000 rpm.", sortOrder: 0 },
      { question: "Does the Classic 350 have ABS?", answer: "Yes, all variants of the new Royal Enfield Classic 350 come standard with dual-channel ABS (anti-lock braking system), making it significantly safer than the older UCE-powered Classic.", sortOrder: 1 },
      { question: "Is the Royal Enfield Classic 350 good for highway riding?", answer: "Yes, the Classic 350 is well-suited for highway touring. Its relaxed riding position, long-stroke engine character, and stable J-platform frame make sustained 100–110 km/h cruising comfortable and refined.", sortOrder: 2 },
    ],
  });

  // 7. Hero Splendor Plus
  await seedVehicle({
    slug: "hero-splendor-plus",
    data: {
      name: "Hero Splendor Plus",
      slug: "hero-splendor-plus",
      type: "BIKE",
      brandId: heroMotocorp!.id,
      categoryId: bikesCat!.id,
      bodyType: "Commuter",
      segment: "100cc Commuter",
      isElectric: false,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 77600,
      priceMax: 84000,
      priceDisplay: "₹77,600 – ₹84,000",
      engine: "97.2cc Single Cylinder OHC",
      power: "8.02 bhp",
      torque: "8.05 Nm",
      mileage: "60 kmpl",
      topSpeed: "90 km/h",
      shortDescription:
        "India's highest-selling motorcycle—legendary for its 60 kmpl efficiency, low cost, and rock-solid reliability.",
      description:
        "The Hero Splendor Plus is the backbone of two-wheeled India—the best-selling motorcycle in the country for over two decades. Its 97.2cc OHC engine is engineered for maximum fuel efficiency (60 kmpl ARAI) and minimal maintenance. The Splendor Plus now comes with i3S (idle stop-start system) technology, an all-black treatment option, a USB charging port, and a semi-digital instrument cluster. If you need a no-nonsense, ultra-reliable commuter, the Splendor Plus is unbeatable.",
      overview:
        "The Hero Splendor Plus defines affordable, dependable commuting in India. With class-leading 60 kmpl fuel efficiency, near-zero maintenance requirements, and a countrywide Hero service network, it is the definitive commuter motorcycle.",
      keyHighlights: [
        "60 kmpl ARAI-certified fuel efficiency",
        "i3S idle stop-start technology",
        "Semi-digital instrument cluster",
        "USB charging port",
        "Pan-India Hero service network",
        "Available in BS6 compliant",
      ],
      pros: [
        "Best-in-class fuel efficiency",
        "Extremely low maintenance cost",
        "Nationwide service network",
        "Light and easy to handle",
        "Excellent long-term reliability",
      ],
      cons: [
        "Very basic feature set",
        "Low power output",
        "No disc brake on lower variants",
        "Not suitable for highways",
      ],
      launchDate: new Date("2021-04-01"),
      sortOrder: 7,
    },
    images: [
      { url: IMG.bike3, alt: "Hero Splendor Plus - Side View", type: "gallery", sortOrder: 0 },
      { url: IMG.bike4, alt: "Hero Splendor Plus - Front View", type: "gallery", sortOrder: 1 },
      { url: IMG.bike1, alt: "Hero Splendor Plus - Detail", type: "gallery", sortOrder: 2 },
    ],
    colours: [
      { name: "Sports Red", hexCode: "#C0392B", imageUrl: IMG.bike3 },
      { name: "Heavy Grey", hexCode: "#5D5D5D", imageUrl: IMG.bike4 },
      { name: "Black", hexCode: "#1A1A1A", imageUrl: IMG.bike1 },
    ],
    variants: [
      { name: "Kick Drum", slug: "kick-drum", priceMin: 77600, priceMax: 77600, priceDisplay: "₹77,600", fuelType: "Petrol", transmission: "Manual", mileage: "60 kmpl", isDefault: false },
      { name: "Self Drum", slug: "self-drum", priceMin: 80000, priceMax: 80000, priceDisplay: "₹80,000", fuelType: "Petrol", transmission: "Manual", mileage: "60 kmpl", isDefault: true },
      { name: "Self Drum Alloy i3S", slug: "self-drum-alloy-i3s", priceMin: 84000, priceMax: 84000, priceDisplay: "₹84,000", fuelType: "Petrol", transmission: "Manual", mileage: "60 kmpl", isDefault: false },
    ],
    faqs: [
      { question: "What is the mileage of Hero Splendor Plus?", answer: "The Hero Splendor Plus delivers a 60 kmpl ARAI-certified fuel efficiency. Real-world mileage in mixed city and highway conditions typically comes in between 50–55 kmpl.", sortOrder: 0 },
      { question: "Does Hero Splendor Plus have a disc brake?", answer: "The top-spec Splendor Plus i3S variant comes with a front disc brake. Lower variants have drum brakes front and rear. All variants comply with BS6 emission norms.", sortOrder: 1 },
      { question: "Is the Hero Splendor Plus available in black?", answer: "Yes, the Splendor Plus is available in an all-black treatment called 'Splendor Black' which features blacked-out engine covers and a sleek matte finish.", sortOrder: 2 },
    ],
  });

  // ════════════════════════════════════════════════════════════════════════
  //  ELECTRIC SCOOTERS
  // ════════════════════════════════════════════════════════════════════════
  console.log("\n⚡ Seeding Electric Scooters...");

  // 8. Ola S1 Pro
  await seedVehicle({
    slug: "ola-s1-pro",
    data: {
      name: "Ola S1 Pro",
      slug: "ola-s1-pro",
      type: "SCOOTER",
      brandId: olaElectric!.id,
      categoryId: scootersCat!.id,
      bodyType: "Electric Scooter",
      segment: "Performance Electric Scooter",
      isElectric: true,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 129999,
      priceMax: 149999,
      priceDisplay: "₹1.30 – ₹1.50 Lakh",
      batteryCapacity: "3.97 kWh",
      chargingTime: "6.5 hours (standard) / 30 min (Hypercharger)",
      fastCharging: true,
      range: "195 km (IDC) / 128 km (True Range)",
      motorPower: "8.5 kW peak",
      motorTorque: "58 Nm",
      topSpeed: "120 km/h",
      shortDescription:
        "India's fastest electric scooter with 195 km IDC range, Hypercharger fast charging, and a feature-first MoveOS platform.",
      description:
        "The Ola S1 Pro is the flagship electric scooter from Ola Electric and one of the most technologically advanced two-wheelers ever made in India. With a 3.97 kWh battery delivering up to 195 km on IDC cycle and real-world range of 128 km, it handles daily city commuting with ease. The 8.5 kW motor produces 58 Nm of torque and pushes the scooter to 120 km/h. The MoveOS platform powers a 7-inch touchscreen with Google Maps, voice commands, Bluetooth, 4G connectivity, and an immersive speaker. The Hypercharger network enables fast charging at select points.",
      overview:
        "The Ola S1 Pro is a paradigm shift in Indian scooter space—nothing comes close to its combination of range, speed, features, and technology. With OTA updates and an ever-growing Hypercharger network, it gets better over time.",
      keyHighlights: [
        "195 km IDC-certified range",
        "120 km/h top speed",
        "7-inch touchscreen with MoveOS",
        "Hypercharger fast-charging support",
        "4G connectivity and Google Maps",
        "Reverse mode available",
      ],
      pros: [
        "Excellent range for city use",
        "Very fast—0–40 km/h in 2.7 sec",
        "Feature-packed touchscreen",
        "OTA software updates",
        "Fast Hypercharger network expanding",
      ],
      cons: [
        "Service experience still maturing",
        "Hyperchargers limited to major cities",
        "Suspension is firm",
        "Software bugs occasionally reported",
      ],
      launchDate: new Date("2021-08-15"),
      sortOrder: 8,
    },
    images: [
      { url: IMG.scooter1, alt: "Ola S1 Pro - Front View", type: "gallery", sortOrder: 0 },
      { url: IMG.scooter2, alt: "Ola S1 Pro - Side Profile", type: "gallery", sortOrder: 1 },
      { url: IMG.ev1, alt: "Ola S1 Pro - Dashboard", type: "gallery", sortOrder: 2 },
      { url: IMG.ev2, alt: "Ola S1 Pro - Charging", type: "gallery", sortOrder: 3 },
    ],
    colours: [
      { name: "Jet Black", hexCode: "#1A1A1A", imageUrl: IMG.scooter1 },
      { name: "Porcelain White", hexCode: "#F2F2F2", imageUrl: IMG.scooter2 },
      { name: "Neo Mint", hexCode: "#A8DADC", imageUrl: IMG.ev1 },
      { name: "Coral Glam", hexCode: "#FF6B6B", imageUrl: IMG.ev2 },
    ],
    variants: [
      { name: "S1 Air", slug: "s1-air", priceMin: 84999, priceMax: 84999, priceDisplay: "₹84,999", fuelType: "Electric", transmission: "Automatic", range: "101 km", isDefault: false },
      { name: "S1 Pro Gen 2", slug: "s1-pro-gen2", priceMin: 129999, priceMax: 129999, priceDisplay: "₹1.30 Lakh", fuelType: "Electric", transmission: "Automatic", range: "195 km", isDefault: true },
      { name: "S1 X+", slug: "s1-x-plus", priceMin: 149999, priceMax: 149999, priceDisplay: "₹1.50 Lakh", fuelType: "Electric", transmission: "Automatic", range: "195 km", isDefault: false },
    ],
    faqs: [
      { question: "What is the real-world range of the Ola S1 Pro?", answer: "The Ola S1 Pro has an IDC-certified range of 195 km. In real-world conditions with a mix of city and highway riding, the typical range is 100–130 km depending on riding mode and terrain.", sortOrder: 0 },
      { question: "How fast can the Ola S1 Pro go?", answer: "The Ola S1 Pro has a top speed of 120 km/h (Hyper mode). In Normal mode it is limited to 80 km/h and in Eco mode to 45 km/h to maximize range.", sortOrder: 1 },
      { question: "Does Ola S1 Pro support fast charging?", answer: "Yes, the Ola S1 Pro supports Hypercharger fast charging which can deliver 50 km of range in 15 minutes. Regular home charging (from the included portable charger) takes approximately 6.5 hours for a full charge.", sortOrder: 2 },
    ],
  });

  // 9. Ather 450X
  await seedVehicle({
    slug: "ather-450x",
    data: {
      name: "Ather 450X",
      slug: "ather-450x",
      type: "SCOOTER",
      brandId: ather!.id,
      categoryId: scootersCat!.id,
      bodyType: "Electric Scooter",
      segment: "Premium Electric Scooter",
      isElectric: true,
      isPopular: true,
      isNew: false,
      status: "PUBLISHED",
      priceMin: 149900,
      priceMax: 174900,
      priceDisplay: "₹1.50 – ₹1.75 Lakh",
      batteryCapacity: "3.7 kWh",
      chargingTime: "5.45 hours (home) / 10 min for 15 km (AtherGrid)",
      fastCharging: true,
      range: "150 km (IDC) / 111 km (True Range)",
      motorPower: "6.4 kW peak",
      motorTorque: "26 Nm",
      topSpeed: "90 km/h",
      shortDescription:
        "The most refined electric scooter in India, with a 7-inch touchscreen, OTA updates, and best-in-class build quality.",
      description:
        "The Ather 450X Gen 3 is widely considered the most refined and well-engineered electric scooter in India. It features a 3.7 kWh battery with a true range of 111 km, a 7-inch color touchscreen with Ather Stack (maps, ride stats, music, OTA updates), and a 6.4 kW motor delivering 26 Nm. The scooter has an aluminum die-cast frame for rigidity and uses regenerative braking to boost efficiency. Ather's own AtherGrid fast-charging network is expanding rapidly across major Indian cities.",
      overview:
        "For buyers who value refinement, build quality, and software polish above all else, the Ather 450X is the electric scooter to buy. Ather's deep ownership experience—from seamless OTA updates to the responsive Ather app—is unmatched in the Indian EV two-wheeler space.",
      keyHighlights: [
        "7-inch touchscreen with Ather Stack",
        "OTA updates and Ather app connectivity",
        "Best-in-class build quality",
        "Regenerative braking system",
        "AtherGrid fast-charging network",
        "Premium aluminum die-cast frame",
      ],
      pros: [
        "Exceptional build quality",
        "Best software and OTA experience",
        "Stable and planted ride",
        "Responsive Ather app",
        "Good AtherGrid network in cities",
      ],
      cons: [
        "Slightly lower top speed vs Ola",
        "Smaller storage space",
        "No Android Auto/CarPlay",
        "Premium pricing",
      ],
      launchDate: new Date("2022-04-25"),
      sortOrder: 9,
    },
    images: [
      { url: IMG.scooter2, alt: "Ather 450X - Side View", type: "gallery", sortOrder: 0 },
      { url: IMG.scooter1, alt: "Ather 450X - Front View", type: "gallery", sortOrder: 1 },
      { url: IMG.ev3, alt: "Ather 450X - Dashboard", type: "gallery", sortOrder: 2 },
    ],
    colours: [
      { name: "Space Grey", hexCode: "#4A4A4A", imageUrl: IMG.scooter2 },
      { name: "Mint Green", hexCode: "#98D8C8", imageUrl: IMG.scooter1 },
      { name: "Cosmic Black", hexCode: "#111111", imageUrl: IMG.ev3 },
    ],
    variants: [
      { name: "450 Plus", slug: "450-plus", priceMin: 149900, priceMax: 149900, priceDisplay: "₹1.50 Lakh", fuelType: "Electric", transmission: "Automatic", range: "108 km", isDefault: false },
      { name: "450X Pro", slug: "450x-pro", priceMin: 174900, priceMax: 174900, priceDisplay: "₹1.75 Lakh", fuelType: "Electric", transmission: "Automatic", range: "150 km", isDefault: true },
    ],
    faqs: [
      { question: "What is the true range of Ather 450X?", answer: "Ather 450X Gen 3 has a true range of 111 km in standard conditions. The IDC range is 150 km. Real-world range depends on riding mode—in Eco mode you can expect 120+ km, while Sport mode brings it down to around 85 km.", sortOrder: 0 },
      { question: "Does Ather 450X support fast charging?", answer: "Yes, Ather 450X supports AtherGrid fast charging (1.5 kW and 15 kW grids). With a 15 kW AtherGrid Point, you can add approximately 25 km of range in 10 minutes. Home charging via the included Ather Dot charger takes about 5.45 hours for a full charge.", sortOrder: 1 },
      { question: "How is the Ather 450X different from Ola S1 Pro?", answer: "The Ather 450X has superior build quality, better suspension tuning, and a more polished software experience. The Ola S1 Pro wins on top speed (120 km/h vs 90 km/h), range (195 km vs 150 km IDC), and boot storage. Ather is often preferred by buyers who prioritize refinement; Ola by those who want maximum performance and range.", sortOrder: 2 },
    ],
  });

  console.log("\n🎉 All dummy data seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Admin login: admin@walley.com / Admin@123");
  console.log("  Vehicles: 9 (5 cars, 2 bikes, 2 scooters)");
  console.log("  Brands: 16 | Categories: 6 | Spec Groups: 6");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
