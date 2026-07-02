// Zomato/Swiggy-style incoming-order ringtone, synthesized with Web Audio API
// so no audio asset needs to be bundled. Loops a two-tone beep until stopped.

let audioCtx: AudioContext | null = null;
let ringInterval: ReturnType<typeof setInterval> | null = null;
let vibrateInterval: ReturnType<typeof setInterval> | null = null;

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

  try {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  } catch {
    audioCtx = null;
  }

  function ringOnce() {
    if (!audioCtx) return;
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
  if (audioCtx) { audioCtx.close().catch(() => {}); audioCtx = null; }
}
