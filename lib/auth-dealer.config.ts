import type { NextAuthConfig } from "next-auth";

// Separate cookie name keeps dealer sessions completely independent from admin sessions.
// If dealer logs in, admin cookie is untouched — and vice versa.
export const DEALER_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-dealer.session-token"
    : "dealer.session-token";

export const dealerAuthConfig: NextAuthConfig = {
  secret:    process.env.NEXTAUTH_SECRET,
  trustHost: true,
  basePath:  "/api/dealer-auth",
  session:   { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: DEALER_COOKIE,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path:     "/",
        secure:   process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/dealer/login",
    error:  "/dealer/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id   = token.id ?? token.sub;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
