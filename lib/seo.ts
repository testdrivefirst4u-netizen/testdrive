import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://walley.broaddcast.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Walley - India's Automotive Marketplace";

export function buildMetadata({
  title,
  description,
  keywords,
  ogImage,
  canonicalPath,
  schema,
}: {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalPath?: string;
  schema?: object;
}): Metadata {
  const canonical = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;

  return {
    title: `${title} | ${SITE_NAME}`,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots: { index: true, follow: true },
  };
}

export function vehicleJsonLd(vehicle: {
  name: string;
  brand: string;
  description?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  image?: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: vehicle.name,
    brand: { "@type": "Brand", name: vehicle.brand },
    description: vehicle.description || "",
    offers: {
      "@type": "AggregateOffer",
      lowPrice: vehicle.priceMin,
      highPrice: vehicle.priceMax,
      priceCurrency: "INR",
    },
    image: vehicle.image,
    url: `${SITE_URL}${vehicle.url}`,
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}
