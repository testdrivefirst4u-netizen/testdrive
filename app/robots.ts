import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://walley.broaddcast.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/admin/", "/api/auth/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
