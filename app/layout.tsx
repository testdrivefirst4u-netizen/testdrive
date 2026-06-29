import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TestDriveFirst — Cars • Bikes • Commercials",
    template: "%s | TestDriveFirst",
  },
  description:
    "Compare prices, specs & features across 500+ cars, bikes & EVs. Book test drives, find dealers, calculate EMI. India's most trusted auto platform.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://testdrivefirst.com"),
  keywords: ["new cars india", "buy cars online", "compare cars", "car prices", "bikes", "electric vehicles", "car dealers", "test drive", "TestDriveFirst"],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "TestDriveFirst",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={`${jakarta.className} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
