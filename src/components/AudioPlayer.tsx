import { useEffect, useState } from "react";
import { startAmbient, stopAmbient, isAmbientPlaying, unlockAudio } from "../lib/sound";

export function AudioPlayer() {
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    unlockAudio();
    if (playing) {
      stopAmbient();
      setPlaying(false);
    } else {
      startAmbient();
      setPlaying(true);
    }
  };

  // Sync state on mount
  useEffect(() => {
    setPlaying(isAmbientPlaying());
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      className="fixed right-4 top-4 z-50 flex h-10 items-center gap-2 rounded-full border border-ink-600 bg-ink-900/90 px-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:border-acc hover:shadow-[0_4px_20px_rgba(240,163,47,0.2)]"
      title={playing ? "Pause ambient music" : "Play ambient music"}
      aria-label={playing ? "Pause ambient music" : "Play ambient music"}
    >
      {/* Wave strings */}
      <div className="flex items-center gap-[2px] h-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-[2px] rounded-full bg-acc transition-all ${
              playing
                ? "animate-wave"
                : "h-2"
            }`}
            style={{
              animationDelay: playing ? `${i * 0.1}s` : undefined,
              height: playing ? undefined : "8px",
            }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#9db2c7]">
        {playing ? "playing" : "play"}
      </span>
    </button>
  );
}
