import type React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
// import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { CompareBar } from "@/components/compare-bar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Header />
      <main className="min-h-screen pb-16 md:pb-0">{children}</main>
      <Footer />
      {/* Floating / fixed UI */}
      <MobileBottomNav />
      {/* <WhatsAppWidget /> */}
      <CompareBar />
    </Providers>
  );
}
