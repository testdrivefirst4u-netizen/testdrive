import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  secret:    process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session:   { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error:  "/admin/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id          = (user as any).id;
        token.role        = (user as any).role;
        token.permissions = (user as any).permissions ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id          = token.id ?? token.sub;
        (session.user as any).role        = token.role;
        (session.user as any).permissions = token.permissions ?? [];
      }
      return session;
    },
  },
};
