"use server";
import { dealerSignOut } from "@/lib/auth-dealer";

export async function dealerSignOutAction() {
  await dealerSignOut({ redirectTo: "/dealer/login" });
}
