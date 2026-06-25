import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role        = (user as any).role;
        token.permissions = (user as any).permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role        = token.role;
        (session.user as any).permissions = token.permissions ?? [];
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage  = nextUrl.pathname === "/admin/login";
      const isApiAuth    = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuth) return true;
      if (!isAdminRoute || isLoginPage) return true;
      if (!auth) return false;

      const role = (auth.user as any)?.role;
      if (!["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role)) return false;

      // EDITOR: enforce page permissions
      if (role === "EDITOR") {
        const permissions: string[] = (auth.user as any)?.permissions ?? [];
        // segment = the admin sub-path, e.g. "vehicles" from /admin/vehicles/123
        const segment = nextUrl.pathname.split("/")[2] ?? "";
        const ALWAYS_ALLOWED = ["dashboard", "login", ""];
        if (!ALWAYS_ALLOWED.includes(segment) && !permissions.includes(segment)) {
          return Response.redirect(new URL("/admin/dashboard", nextUrl));
        }
      }

      return true;
    },
  },
};
