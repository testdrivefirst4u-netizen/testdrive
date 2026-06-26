"use server";

import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DEALER_COOKIE } from "@/lib/auth-dealer.config";

const SECRET = process.env.NEXTAUTH_SECRET!;
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function dealerLoginAction(_: unknown, formData: FormData) {
  const email    = (formData.get("email")    as string | null)?.trim();
  const password =  formData.get("password") as string | null;

  if (!email || !password) return { error: "Email and password are required" };

  // 1. Find user
  let user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "Login failed. Please try again." };
  }

  if (!user?.password)                                           return { error: "Invalid email or password" };
  if (!["DEALER_ADMIN", "SALES_EXECUTIVE"].includes(user.role)) return { error: "Access denied" };

  // 2. Verify password
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password" };

  // 3. Encode JWT with the same salt proxy.ts uses for getToken
  const token = await encode({
    token: {
      sub:   user.id,
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      iat:   Math.floor(Date.now() / 1000),
      exp:   Math.floor(Date.now() / 1000) + MAX_AGE,
    },
    secret:  SECRET,
    salt:    DEALER_COOKIE,
    maxAge:  MAX_AGE,
  });

  // 4. Set the dealer session cookie (same options as auth-dealer.config.ts)
  const jar = await cookies();
  jar.set(DEALER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   MAX_AGE,
  });

  redirect("/dealer/dashboard");
}
