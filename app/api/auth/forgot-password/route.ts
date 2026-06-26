import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { rateLimit } from "@/lib/rate-limit";

function getIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

async function sendResetEmail(email: string, resetLink: string, portalLabel: string) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`[PASSWORD RESET] ${email} → ${resetLink}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:20px}
  .card{max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .head{background:linear-gradient(135deg,#1e3a8a,#1d4ed8);padding:24px 28px}
  .head h1{color:#fff;margin:0;font-size:18px;font-weight:700}
  .body{padding:28px}
  .btn{display:inline-block;background:#1d4ed8;color:#fff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;margin:16px 0}
  .note{font-size:12px;color:#94a3b8;margin-top:16px}
</style></head><body>
<div class="card">
  <div class="head"><h1>Reset Your Password</h1></div>
  <div class="body">
    <p style="color:#334155;font-size:14px;margin:0 0 8px">You requested a password reset for your <strong>${portalLabel}</strong> account.</p>
    <p style="color:#334155;font-size:14px;margin:0">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
    <a href="${resetLink}" class="btn">Reset Password →</a>
    <p class="note">If you did not request this, you can safely ignore this email.</p>
    <p class="note">Link: <a href="${resetLink}" style="color:#1d4ed8">${resetLink}</a></p>
  </div>
</div>
</body></html>`;

  await transporter.sendMail({
    from:    `"Walley" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: "Reset your Walley password",
    html,
  }).catch((e) => console.error("[RESET EMAIL]", e));
}

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!rateLimit(`forgot:${ip}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const email  = (body?.email ?? "").trim().toLowerCase();
    const portal = (body?.portal ?? "admin"); // "admin" | "dealer"
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success — never reveal if email exists
    if (!user) return NextResponse.json({ success: true });

    // Delete any existing token for this user
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

    const baseUrl    = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const resetPath  = portal === "dealer" ? "/dealer/reset-password" : "/admin/reset-password";
    const resetLink  = `${baseUrl}${resetPath}?token=${token}`;
    const label      = portal === "dealer" ? "Dealer Portal" : "Admin Panel";

    await sendResetEmail(email, resetLink, label);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[FORGOT PASSWORD]", e);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
