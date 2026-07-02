"use server";

import bcrypt from "bcryptjs";
import { encode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { DRIVER_COOKIE } from "@/lib/auth-driver.config";

const SECRET = process.env.NEXTAUTH_SECRET!;
const MAX_AGE = 30 * 24 * 60 * 60; // 30 days

export async function driverLoginAction(_: unknown, formData: FormData) {
  const email    = (formData.get("email")    as string | null)?.trim();
  const password =  formData.get("password") as string | null;

  if (!email || !password) return { error: "Email and password are required" };

  let user: Awaited<ReturnType<typeof prisma.user.findUnique>>;
  try {
    user = await prisma.user.findUnique({ where: { email } });
  } catch {
    return { error: "Login failed. Please try again." };
  }

  if (!user?.password)      return { error: "Invalid email or password" };
  if (user.role !== "DRIVER") return { error: "Access denied" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Invalid email or password" };

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
    salt:    DRIVER_COOKIE,
    maxAge:  MAX_AGE,
  });

  const jar = await cookies();
  jar.set(DRIVER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    secure:   process.env.NODE_ENV === "production",
    maxAge:   MAX_AGE,
  });

  redirect("/driver/dashboard");
}
