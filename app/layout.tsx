import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://testdrivefirst.com";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TestDriveFirst — New Cars, Bikes & EVs in India",
    template: "%s | TestDriveFirst",
  },
  description:
    "India's #1 auto marketplace — compare prices, specs & expert reviews for 2,000+ cars, bikes and EVs. Book test drives, find dealers, calculate EMI.",
  metadataBase: new URL(SITE_URL),
  keywords: [
    "new cars india", "buy cars online", "compare cars india", "car prices 2025",
    "bikes india", "electric vehicles india", "car dealers near me",
    "test drive booking", "emi calculator", "TestDriveFirst",
  ],
  verification: {
    google: "vFDOzY1WkTooCOTiNBPjkjeR9TYX_ps_YXZFQos9g7o",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TestDriveFirst",
    images: [{ url: `${SITE_URL}/og-home.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@testdrivefirst",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TestDriveFirst",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Hindi"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TestDriveFirst",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/cars?search={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${jakarta.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([orgJsonLd, websiteJsonLd]) }}
        />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
