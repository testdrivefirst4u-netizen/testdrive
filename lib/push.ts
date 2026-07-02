import webpush from "web-push";
import prisma from "@/lib/prisma";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webpush.setVapidDetails("mailto:support@testdrivefirst.com", VAPID_PUBLIC, VAPID_PRIVATE);
}

export async function sendPushToUser(userId: string, payload: { title: string; body: string; url?: string }) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subs.length) return;

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload),
          // "high" urgency tells FCM/Android to wake the device promptly even in
          // Doze/battery-saver mode — the default "normal" priority can be delayed
          // for minutes (or dropped) when the phone is idle with the screen off.
          { urgency: "high", TTL: 300 }
        );
      } catch (e: any) {
        // 410/404 means the subscription is dead — remove it
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error("[PUSH]", e?.message ?? e);
        }
      }
    })
  );
}
