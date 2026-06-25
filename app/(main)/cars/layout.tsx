import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "New Cars in India 2025-26 - Prices, Reviews & Comparisons",
  description:
    "Explore 2,000+ new cars in India. Compare prices, read expert reviews, check specs, and find the best deals on SUVs, sedans, hatchbacks, and luxury cars.",
  keywords:
    "new cars india 2025, car prices india, best cars india, suv india, car reviews, maruti swift, hyundai creta, tata nexon",
  canonicalPath: "/cars",
});

export default function CarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
