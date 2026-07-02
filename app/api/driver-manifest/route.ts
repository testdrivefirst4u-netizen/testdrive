import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      name: "TestDriveFirst — Driver",
      short_name: "TDF Driver",
      description: "Manage your assigned test drives, track trips, and log customer feedback.",
      start_url: "/driver/dashboard",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#059669",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
        { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
