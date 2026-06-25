import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Bikes & Scooters in India 2025-26 - Prices, Reviews & Specs",
  description:
    "Explore the best bikes and scooters in India. Compare prices, mileage, specs, and reviews for commuter bikes, sport bikes, electric scooters, and cruisers.",
  keywords:
    "bikes india 2025, scooters india, royal enfield, bajaj, honda activa, ola s1 pro, electric bikes, bike prices india",
  canonicalPath: "/bikes",
});

export default function BikesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
