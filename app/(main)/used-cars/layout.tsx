import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Buy & Sell Used Cars in India - Certified Pre-Owned Vehicles",
  description:
    "Buy and sell used cars in India at the best prices. Browse 50,000+ certified pre-owned vehicles with inspection reports, warranty, and easy financing options.",
  keywords:
    "used cars india, second hand cars, certified pre-owned cars, buy used cars, sell used car, car valuation india",
  canonicalPath: "/used-cars",
});

export default function UsedCarsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
