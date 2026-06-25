const RECENT_SEARCHES_KEY = "walley_recent_searches";
const RECENTLY_VIEWED_KEY = "walley_recently_viewed";
const MAX_SEARCHES = 8;
const MAX_VIEWED = 5;

export interface RecentlyViewedItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  type: string;
  price: string;
  image: string;
  viewedAt: number;
}

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

/* ── Recent searches ───────────────────────────────────── */

export function getRecentSearches(): string[] {
  return safeGet<string[]>(RECENT_SEARCHES_KEY, []);
}

export function addRecentSearch(query: string) {
  if (!query.trim()) return;
  const prev = getRecentSearches().filter((s) => s.toLowerCase() !== query.toLowerCase());
  safeSet(RECENT_SEARCHES_KEY, [query, ...prev].slice(0, MAX_SEARCHES));
}

export function removeRecentSearch(query: string) {
  safeSet(RECENT_SEARCHES_KEY, getRecentSearches().filter((s) => s !== query));
}

export function clearRecentSearches() {
  safeSet(RECENT_SEARCHES_KEY, []);
}

/* ── Recently viewed ──────────────────────────────────── */

export function getRecentlyViewed(): RecentlyViewedItem[] {
  return safeGet<RecentlyViewedItem[]>(RECENTLY_VIEWED_KEY, []);
}

export function addRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  const prev = getRecentlyViewed().filter((v) => v.id !== item.id);
  safeSet(RECENTLY_VIEWED_KEY, [{ ...item, viewedAt: Date.now() }, ...prev].slice(0, MAX_VIEWED));
}

export function clearRecentlyViewed() {
  safeSet(RECENTLY_VIEWED_KEY, []);
}
