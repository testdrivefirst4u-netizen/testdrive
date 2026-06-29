"use client";

import { CompareProvider } from "@/lib/compare-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <CompareProvider>{children}</CompareProvider>;
}
