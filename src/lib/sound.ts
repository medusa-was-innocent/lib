/* Lightweight stamp sound using Web Audio API.
   No external files — synthesized on demand.
   Only plays after user interaction (browser autoplay policy). */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  return ctx;
}

/** Resume audio context (must be called from a user gesture). */
export function unlockAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") {
    c.resume().catch(() => {});
  }
}

/** Play a short retro stamp sound: a quick low thump + high click. */
export function playStampSound(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    c.resume().catch(() => {});
    return;
  }

  const now = c.currentTime;

  // Low thump
  const osc1 = c.createOscillator();
  const gain1 = c.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(120, now);
  osc1.frequency.exponentialRampToValueAtTime(40, now + 0.12);
  gain1.gain.setValueAtTime(0.35, now);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc1.connect(gain1).connect(c.destination);
  osc1.start(now);
  osc1.stop(now + 0.16);

  // High click
  const osc2 = c.createOscillator();
  const gain2 = c.createGain();
  osc2.type = "square";
  osc2.frequency.setValueAtTime(1800, now);
  osc2.frequency.exponentialRampToValueAtTime(400, now + 0.04);
  gain2.gain.setValueAtTime(0.08, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
  osc2.connect(gain2).connect(c.destination);
  osc2.start(now);
  osc2.stop(now + 0.06);
}

/** Play a subtle save chime. */
export function playSaveSound(): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    c.resume().catch(() => {});
    return;
  }

  const now = c.currentTime;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);
  osc.frequency.setValueAtTime(1320, now + 0.08);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
  osc.connect(gain).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.26);
}

/* ---------- Ambient library music (Web Audio API) ---------- */

let ambientNodes: {
  oscillators: OscillatorNode[];
  gains: GainNode[];
  masterGain: GainNode;
  lfos: OscillatorNode[];
} | null = null;

/** Start ambient library pad — warm, evolving tone. */
export function startAmbient(): void {
  const c = getCtx();
  if (!c || ambientNodes) return;
  if (c.state === "suspended") {
    c.resume().catch(() => {});
  }

  const masterGain = c.createGain();
  masterGain.gain.value = 0;
  masterGain.connect(c.destination);

  // Warm pad: multiple detuned sine/triangle oscillators
  const freqs = [110, 164.81, 220, 329.63]; // A2, E3, A3, E4
  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];
  const lfos: OscillatorNode[] = [];

  freqs.forEach((freq, i) => {
    const osc = c.createOscillator();
    osc.type = i % 2 === 0 ? "sine" : "triangle";
    osc.frequency.value = freq;

    const gain = c.createGain();
    gain.gain.value = 0.08;

    // LFO for gentle volume modulation
    const lfo = c.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.1 + i * 0.05; // very slow
    const lfoGain = c.createGain();
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain).connect(gain.gain);

    osc.connect(gain).connect(masterGain);
    osc.start();
    lfo.start();

    oscillators.push(osc);
    gains.push(gain);
    lfos.push(lfo);
  });

  // Fade in
  masterGain.gain.linearRampToValueAtTime(0.15, c.currentTime + 2);

  ambientNodes = { oscillators, gains, masterGain, lfos };
}

/** Stop ambient music with fade out. */
export function stopAmbient(): void {
  const c = getCtx();
  if (!c || !ambientNodes) return;

  const { oscillators, masterGain, lfos } = ambientNodes;

  // Fade out
  masterGain.gain.linearRampToValueAtTime(0, c.currentTime + 1);

  setTimeout(() => {
    oscillators.forEach((o) => { try { o.stop(); } catch {} });
    lfos.forEach((l) => { try { l.stop(); } catch {} });
    ambientNodes = null;
  }, 1100);
}

/** Check if ambient is currently playing. */
export function isAmbientPlaying(): boolean {
  return ambientNodes !== null;
}
