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
      <div className="relative w-[180px] rounded-lg border border-ink-700 bg-ink-900 p-3 shadow-[0_10px_30px_rgba(12,31,49,0.4)]">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-ink-700 pb-2">
          <LogoMark size={24} />
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[9px] uppercase tracking-widest text-acc">Library Card</p>
            <p className="font-display text-xs font-semibold text-paper">Bibliothēkē</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wide text-[#7f95ab]">Books saved</span>
            <span className="font-mono text-sm font-bold text-moss">{count}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] uppercase tracking-wide text-[#7f95ab]">Status</span>
            <span className="font-mono text-[10px] font-semibold text-paper">Active</span>
          </div>
        </div>

        {/* Stamp overlay */}
        {stamp && (
          <div
            key={stampKey}
            className="stamp-anim pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <div className="rounded border-2 border-acc px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-acc">
              {stamp}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
