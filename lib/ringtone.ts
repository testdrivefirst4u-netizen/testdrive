// Zomato/Swiggy-style incoming-order ringtone, synthesized with Web Audio API
// so no audio asset needs to be bundled. Loops a two-tone beep until stopped.
//
// Browsers only allow an AudioContext to actually produce sound after it has
// been resumed from a genuine user gesture (click/tap) — a background poll
// firing startRingtone() is not enough on its own. So we keep ONE persistent
// context alive for the whole page session (never recreate/close it), and
// unlock it as early as possible via unlockAudio() on the first tap.

let audioCtx: AudioContext | null = null;
let ringInterval: ReturnType<typeof setInterval> | null = null;
let vibrateInterval: ReturnType<typeof setInterval> | null = null;

function getOrCreateContext(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    audioCtx = null;
  }
  return audioCtx;
}

// Call from a real click/touch handler (e.g. the very first tap anywhere on
// the driver dashboard) so the context is already unlocked by the time a
// trip alert needs to ring.
export function unlockAudio() {
  const ctx = getOrCreateContext();
  if (ctx?.state === "suspended") ctx.resume().catch(() => {});
}

function playBeep(ctx: AudioContext, freq: number, startTime: number, duration: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(0.3, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function startRingtone() {
  if (ringInterval) return; // already ringing

  const ctx = getOrCreateContext();
  if (ctx?.state === "suspended") ctx.resume().catch(() => {});

  function ringOnce() {
    if (!audioCtx || audioCtx.state !== "running") return; // still locked — silently skip, vibration still fires
    const now = audioCtx.currentTime;
    playBeep(audioCtx, 880, now, 0.18);
    playBeep(audioCtx, 1100, now + 0.22, 0.18);
  }

  ringOnce();
  ringInterval = setInterval(ringOnce, 900);

  if (navigator.vibrate) {
    navigator.vibrate([300, 150, 300]);
    vibrateInterval = setInterval(() => navigator.vibrate([300, 150, 300]), 900);
  }
}

export function stopRingtone() {
  if (ringInterval) { clearInterval(ringInterval); ringInterval = null; }
  if (vibrateInterval) { clearInterval(vibrateInterval); vibrateInterval = null; }
  if (navigator.vibrate) navigator.vibrate(0);
  // Deliberately don't close audioCtx — keep it alive & unlocked for the next ring.
}
