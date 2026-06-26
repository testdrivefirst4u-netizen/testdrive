import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { dealerAuthConfig } from "@/lib/auth-dealer.config";

export const {
  handlers: dealerHandlers,
  signIn:   dealerSignIn,
  signOut:  dealerSignOut,
  auth:     dealerAuth,
} = NextAuth({
  ...dealerAuthConfig,
  session: {
    strategy: "jwt",
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    CredentialsProvider({
      name: "dealer-credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.password) return null;
        if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(user.role)) return null;

        const valid = await bcrypt.compare(credentials.password as string, user.password);
        if (!valid) return null;

        return {
          id:    user.id,
          name:  user.name,
          email: user.email,
          role:  user.role,
        };
      },
    }),
  ],
});
