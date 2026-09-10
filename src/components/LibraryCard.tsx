import { useEffect, useState } from "react";
import { LogoMark } from "./icons";
import { playStampSound } from "../lib/sound";

type StampType = "SAVED" | "ARCHIVED" | "CHECKED OUT" | null;

export function LibraryCard({ count, lastAction }: { count: number; lastAction: StampType }) {
  const [stamp, setStamp] = useState<StampType>(null);
  const [stampKey, setStampKey] = useState(0);

  useEffect(() => {
    if (lastAction) {
      setStamp(lastAction);
      setStampKey((k) => k + 1);
      playStampSound();
      const t = setTimeout(() => setStamp(null), 1200);
      return () => clearTimeout(t);
    }
  }, [lastAction]);

  return (
    <div className="fixed bottom-4 right-4 z-40 hidden sm:block">
      <div className="relative w-[180px] rounded-lg border border-neon-cyan/30 bg-void-2 p-3 shadow-[0_0_20px_rgba(0,229,255,0.1)]">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <LogoMark size={24} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-neon-cyan">Library Card</p>
            <p className="font-display text-xs font-semibold text-chrome-bright">Bibliothēkē</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wide text-chrome-dim">Books saved</span>
            <span className="font-mono text-sm font-bold neon-lime">{count}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wide text-chrome-dim">Status</span>
            <span className="font-mono text-[10px] font-semibold text-chrome-bright">Active</span>
          </div>
        </div>

        {/* Stamp overlay */}
        {stamp && (
          <div
            key={stampKey}
            className="stamp-anim pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded border-2 border-neon-magenta px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-neon-magenta">
              {stamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
