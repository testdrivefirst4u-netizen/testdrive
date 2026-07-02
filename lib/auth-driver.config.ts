import type { NextAuthConfig } from "next-auth";

// Separate cookie name keeps driver sessions completely independent from
// dealer and admin sessions — logging in as one must never log out another.
export const DRIVER_COOKIE =
  process.env.NODE_ENV === "production"
    ? "__Secure-driver.session-token"
    : "driver.session-token";

export const driverAuthConfig: NextAuthConfig = {
  secret:    process.env.NEXTAUTH_SECRET,
  trustHost: true,
  basePath:  "/api/driver-auth",
  session:   { strategy: "jwt" },
  cookies: {
    sessionToken: {
      name: DRIVER_COOKIE,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path:     "/",
        secure:   process.env.NODE_ENV === "production",
      },
    },
  },
  pages: {
    signIn: "/driver/login",
    error:  "/driver/login",
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
