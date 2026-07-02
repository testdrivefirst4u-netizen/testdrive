function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export async function getPushSubscriptionStatus(): Promise<"granted" | "denied" | "default" | "unsupported"> {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

export type PushSubscribeResult =
  | { ok: true; pushRegistered: boolean }
  | { ok: false; reason: "unsupported" | "insecure_context" | "permission_denied" | "permission_dismissed" | "error"; detail?: string };

export async function subscribeDriverToPush(): Promise<PushSubscribeResult> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return { ok: false, reason: "insecure_context" };
  }
  if (typeof Notification === "undefined") {
    return { ok: false, reason: "unsupported" };
  }

  // Once a user blocks a site, the browser won't re-prompt — requestPermission()
  // just silently resolves to "denied" again. Detect that case up front.
  if (Notification.permission === "denied") {
    return { ok: false, reason: "permission_denied" };
  }

  // Request notification permission FIRST, independent of whether push/VAPID is
  // configured — this alone unlocks the in-app sound (native Notification on new
  // trip), so it must not be blocked by a missing server-side push setup.
  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch (e: any) {
    return { ok: false, reason: "error", detail: e?.message ?? String(e) };
  }
  if (permission === "denied") return { ok: false, reason: "permission_denied" };
  if (permission !== "granted") return { ok: false, reason: "permission_dismissed" };

  // Permission granted — sound now works. Push (works even with the app fully
  // closed) is a bonus on top, only attempted if the browser + server support it.
  if (!isPushSupported()) {
    return { ok: true, pushRegistered: false };
  }
  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return { ok: true, pushRegistered: false };
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/driver/" });
    await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    }

    const json = subscription.toJSON();
    const res = await fetch("/api/driver/push-subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });

    return { ok: true, pushRegistered: res.ok };
  } catch (e: any) {
    // Permission is granted regardless — sound still works even if push setup failed.
    console.error("[PUSH SUBSCRIBE]", e);
    return { ok: true, pushRegistered: false };
  }
}
