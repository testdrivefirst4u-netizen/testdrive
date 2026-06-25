"use client";

import { useEffect } from "react";
import { addRecentlyViewed, type RecentlyViewedItem } from "@/lib/search-history";

interface Props {
  vehicle: Omit<RecentlyViewedItem, "viewedAt">;
}

/**
 * Drop this into any vehicle detail page (client component wrapper).
 * Silently records the visit to localStorage so the hero can surface
 * "Recently Viewed" in the smart-search dropdown.
 */
export function RecentlyViewedTracker({ vehicle }: Props) {
  useEffect(() => {
    addRecentlyViewed(vehicle);
  }, [vehicle.id]);

  return null;
}
