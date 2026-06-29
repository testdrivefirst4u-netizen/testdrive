import type { Metadata } from "next";

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || "https://testdrivefirst.com";
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "TestDriveFirst";
const LOGO_URL  = `${SITE_URL}/logo.png`;

const PUBLISHER = {
  "@type": "Organization",
  name: SITE_NAME,
  logo: { "@type": "ImageObject", url: LOGO_URL },
};

export function buildMetadata({
  title,
  description,
  keywords,
  ogImage,
  canonicalPath,
  type = "website",
  publishedAt,
  modifiedAt,
  author,
}: {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalPath?: string;
  type?: "website" | "article";
  publishedAt?: string | Date;
  modifiedAt?: string | Date;
  author?: string;
}): Metadata {
  const canonical  = canonicalPath ? `${SITE_URL}${canonicalPath}` : SITE_URL;
  const imageEntry = ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [];

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
      images: imageEntry,
      locale: "en_IN",
      ...(type === "article"
        ? {
            type: "article" as const,
            ...(publishedAt ? { publishedTime: new Date(publishedAt).toISOString() } : {}),
            ...(modifiedAt  ? { modifiedTime:  new Date(modifiedAt).toISOString()  } : {}),
            ...(author      ? { authors: [author] }                                  : {}),
          }
        : { type: "website" as const }),
    },
    twitter: {
      card:        "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : [],
    },
    robots: { index: true, follow: true },
  };
}

/* ── Structured Data Helpers ─────────────────────────────────── */

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
    name:   vehicle.name,
    brand:  { "@type": "Brand", name: vehicle.brand },
    description: vehicle.description || "",
    offers: {
      "@type":         "AggregateOffer",
      lowPrice:        vehicle.priceMin,
      highPrice:       vehicle.priceMax,
      priceCurrency:   "INR",
      availability:    "https://schema.org/InStock",
    },
    image: vehicle.image,
    url:   `${SITE_URL}${vehicle.url}`,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type":    "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type":    "ListItem",
      position:   index + 1,
      name:       item.name,
      item:       `${SITE_URL}${item.url}`,
    })),
  };
}

export function newsArticleJsonLd(article: {
  title: string;
  description?: string | null;
  slug: string;
  coverImage?: string | null;
  author?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    "@context":       "https://schema.org",
    "@type":          "NewsArticle",
    headline:         article.title,
    description:      article.description || "",
    image:            article.coverImage || `${SITE_URL}/og-home.jpg`,
    url:              `${SITE_URL}/news/${article.slug}`,
    datePublished:    article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    dateModified:     article.updatedAt   ? new Date(article.updatedAt).toISOString()   : undefined,
    author:           { "@type": "Person", name: article.author || SITE_NAME },
    publisher:        PUBLISHER,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/news/${article.slug}` },
  };
}

export function blogPostingJsonLd(post: {
  title: string;
  description?: string | null;
  slug: string;
  coverImage?: string | null;
  author?: string | null;
  publishedAt?: Date | string | null;
  updatedAt?: Date | string | null;
}) {
  return {
    "@context":       "https://schema.org",
    "@type":          "BlogPosting",
    headline:         post.title,
    description:      post.description || "",
    image:            post.coverImage || `${SITE_URL}/og-home.jpg`,
    url:              `${SITE_URL}/blog/${post.slug}`,
    datePublished:    post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
    dateModified:     post.updatedAt   ? new Date(post.updatedAt).toISOString()   : undefined,
    author:           { "@type": "Person", name: post.author || SITE_NAME },
    publisher:        PUBLISHER,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type":    "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type":           "Question",
      name:              f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
