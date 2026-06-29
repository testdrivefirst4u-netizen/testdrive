import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://testdrivefirst.com";

const DEFAULT_DISALLOW = [
  "/admin/",
  "/dealer/",
  "/api/admin/",
  "/api/dealer/",
  "/api/auth/",
  "/account/",
  "/_next/",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: "seo_robots_txt" } });
    if (setting?.value) {
      const lines    = setting.value.split("\n").map((l: string) => l.trim()).filter(Boolean);
      const disallow = lines.filter((l: string) => l.startsWith("Disallow:")).map((l: string) => l.replace("Disallow:", "").trim());
      const sitemap  = lines.find((l: string) => l.startsWith("Sitemap:"))?.replace("Sitemap:", "").trim();
      return {
        rules: [{ userAgent: "*", allow: "/", disallow: disallow.length ? disallow : DEFAULT_DISALLOW }],
        sitemap: sitemap || `${SITE_URL}/sitemap.xml`,
      };
    }
  } catch {}

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DEFAULT_DISALLOW,
      },
      // Allow Googlebot full access to images and media
      {
        userAgent: "Googlebot-Image",
        allow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
