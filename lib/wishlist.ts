const WISHLIST_KEY = "walley_wishlist";

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandSlug: string;
  type: string;
  price: string;
  image: string;
  addedAt: number;
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

export function getWishlist(): WishlistItem[] {
  return safeGet<WishlistItem[]>(WISHLIST_KEY, []);
}

export function isWishlisted(id: string): boolean {
  return getWishlist().some((item) => item.id === id);
}

export function toggleWishlist(item: Omit<WishlistItem, "addedAt">): boolean {
  const current = getWishlist();
  const exists = current.some((w) => w.id === item.id);
  if (exists) {
    safeSet(WISHLIST_KEY, current.filter((w) => w.id !== item.id));
    return false;
  }
  safeSet(WISHLIST_KEY, [{ ...item, addedAt: Date.now() }, ...current].slice(0, 20));
  return true;
}
