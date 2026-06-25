import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  const isApiAuth = pathname.startsWith("/api/auth");

  if (isApiAuth) return NextResponse.next();

  if (isAdminRoute && !isLoginPage) {
    if (!req.auth) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = (req.auth.user as any)?.role;
    if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
