"use server";
import { driverSignOut } from "@/lib/auth-driver";

export async function driverSignOutAction() {
  await driverSignOut({ redirectTo: "/driver/login" });
}
