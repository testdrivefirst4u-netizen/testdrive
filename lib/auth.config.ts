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
      if (user) token.role = (user as any).role;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role;
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isLoginPage = nextUrl.pathname === "/admin/login";
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuth) return true;
      if (!isAdminRoute || isLoginPage) return true;

      if (!auth) return false;
      const role = (auth.user as any)?.role;
      return ["SUPER_ADMIN", "ADMIN", "EDITOR"].includes(role);
    },
  },
};
