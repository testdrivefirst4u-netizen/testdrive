import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Compare Cars, Bikes & Vehicles Side by Side",
  description:
    "Compare new cars, bikes, and electric vehicles side by side. Check specs, prices, mileage, fuel type, and features to make the right buying decision.",
  keywords: "compare cars india, car comparison tool, side by side car comparison, bike comparison",
  canonicalPath: "/compare",
});

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
