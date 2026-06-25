import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Electric Vehicles in India 2025-26 - EV Prices, Range & Reviews",
  description:
    "Discover the best electric cars, scooters, and bikes in India. Compare EV prices, range, charging time, and government subsidies. Go green with zero-emission vehicles.",
  keywords:
    "electric vehicles india, ev cars india, electric scooters, ola electric, ather 450x, tata nexon ev, electric car price, best ev india",
  canonicalPath: "/ev",
});

export default function EVLayout({ children }: { children: React.ReactNode }) {
  return children;
}
