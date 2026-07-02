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
  | { ok: true }
  | { ok: false; reason: "unsupported" | "insecure_context" | "missing_key" | "permission_denied" | "permission_dismissed" | "error"; detail?: string };

export async function subscribeDriverToPush(): Promise<PushSubscribeResult> {
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return { ok: false, reason: "insecure_context" };
  }
  if (!isPushSupported()) {
    return { ok: false, reason: "unsupported" };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return { ok: false, reason: "missing_key" };
  }

  // Once a user blocks a site, the browser won't re-prompt — requestPermission()
  // just silently resolves to "denied" again. Detect that case up front.
  if (Notification.permission === "denied") {
    return { ok: false, reason: "permission_denied" };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "denied") return { ok: false, reason: "permission_denied" };
    if (permission !== "granted") return { ok: false, reason: "permission_dismissed" };

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
    if (!res.ok) return { ok: false, reason: "error", detail: `Server rejected subscription (${res.status})` };

    return { ok: true };
  } catch (e: any) {
    return { ok: false, reason: "error", detail: e?.message ?? String(e) };
  }
}
