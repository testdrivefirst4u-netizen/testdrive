import prisma from "@/lib/prisma";
import { SeoManager } from "./seo-manager";

export const metadata = { title: "SEO Management | TestDriveFirst Admin" };

export default async function SeoPage() {
  const [vehicles, news, blogs, brands, settings] = await Promise.all([
    prisma.vehicle.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        brand: { select: { name: true } },
        seo: true,
      },
      orderBy: { name: "asc" },
    }),
    prisma.news.findMany({
      select: { id: true, title: true, slug: true, status: true, seo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.blog.findMany({
      select: { id: true, title: true, slug: true, status: true, seo: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true, slug: true, seo: true },
      orderBy: { name: "asc" },
    }),
    prisma.setting.findMany({ where: { group: "seo" } }),
  ]);

  const globalSettings: Record<string, string> = {};
  for (const s of settings) globalSettings[s.key] = s.value || "";

  return (
    <SeoManager
      vehicles={vehicles as any[]}
      news={news as any[]}
      blogs={blogs as any[]}
      brands={brands as any[]}
      globalSettings={globalSettings}
    />
  );
}
