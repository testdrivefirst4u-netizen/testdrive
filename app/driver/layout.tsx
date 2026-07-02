import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  manifest: "/api/driver-manifest",
};

export const viewport: Viewport = {
  themeColor: "#059669",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
