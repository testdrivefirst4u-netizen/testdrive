import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { DEALER_COOKIE } from "@/lib/auth-dealer.config";

const SECRET = process.env.NEXTAUTH_SECRET!;

// Admin uses NextAuth's default cookie; dealer uses its own isolated cookie.
// This means logging into one portal never touches the other portal's session.
function getAdminCookieName(secure: boolean) {
  return secure ? "__Secure-authjs.session-token" : "authjs.session-token";
}

const PUBLIC_PATHS = [
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
  "/dealer/login",
  "/dealer/forgot-password",
  "/dealer/reset-password",
];

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Auth API endpoints always pass through
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/api/dealer-auth")) {
    return NextResponse.next();
  }

  // Public (unauthenticated) pages
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const secure = req.nextUrl.protocol === "https:";

  // ── Admin panel + admin APIs ──────────────────────────────────────────────
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const cookieName = getAdminCookieName(secure);
    const token = await getToken({ req, secret: SECRET, cookieName, salt: cookieName }).catch(() => null);

    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const url = new URL("/admin/login", req.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }

    const role = token.role as string | undefined;
    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  }

  // ── Dealer portal ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/dealer")) {
    const token = await getToken({
      req,
      secret:     SECRET,
      cookieName: DEALER_COOKIE,
      salt:       DEALER_COOKIE,
    }).catch(() => null);

    if (!token) {
      return NextResponse.redirect(new URL("/dealer/login", req.url));
    }

    const role = token.role as string | undefined;
    if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(role ?? "")) {
      return NextResponse.redirect(new URL("/dealer/login", req.url));
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dealer/:path*", "/api/admin/:path*"],
};
