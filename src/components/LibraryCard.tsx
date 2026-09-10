import { useCallback, useEffect, useRef, useState } from "react";
import { LogoMark, IconX } from "./icons";
import { playStampSound } from "../lib/sound";
import type { Book } from "../lib/api";
import { annasUrl, googleBooksUrl, zLibraryUrl } from "../lib/api";

type StampType = "SAVED" | "ARCHIVED" | "CHECKED OUT" | null;

type SavedBook = {
  id: string;
  title: string;
  author: string;
  cover?: number;
  savedAt: number;
};

type Position = { x: number; y: number };

const STORAGE_KEY = "bibliotheke-card-pos";

function loadPos(): Position {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  // Default: bottom-right
  return { x: -1, y: -1 }; // -1 means use default
}

function savePos(pos: Position) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
  } catch { /* ignore */ }
}

export function LibraryCard({
  count,
  lastAction,
  saved,
  onRemove,
}: {
  count: number;
  lastAction: StampType;
  saved: SavedBook[];
  onRemove: (id: string) => void;
}) {
  const [stamp, setStamp] = useState<StampType>(null);
  const [stampKey, setStampKey] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [mode, setMode] = useState<"card" | "ball" | "dock">("card");
  const [dockSide, setDockSide] = useState<"left" | "right">("right");
  const [dockY, setDockY] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<number>(Date.now());
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    moved: boolean;
  }>({ dragging: false, startX: 0, startY: 0, offsetX: 0, offsetY: 0, moved: false });

  const defaultPos = { x: window.innerWidth - 200, y: window.innerHeight - 180 };
  const initialPos = loadPos();
  const [pos, setPos] = useState<Position>(
    initialPos.x === -1 ? defaultPos : initialPos
  );
  const [ballPos, setBallPos] = useState<Position>(
    initialPos.x === -1 ? { x: window.innerWidth - 80, y: window.innerHeight - 80 } : initialPos
  );

  // Stamp animation
  useEffect(() => {
    if (lastAction) {
      setStamp(lastAction);
      setStampKey((k) => k + 1);
      playStampSound();
      const t = setTimeout(() => setStamp(null), 1200);
      return () => clearTimeout(t);
    }
  }, [lastAction]);

  // Save position on change
  useEffect(() => {
    if (mode === "card") {
      savePos(pos);
    } else if (mode === "ball") {
      savePos(ballPos);
    }
  }, [pos, ballPos, mode]);

  // Auto-roll to corner after inactivity
  useEffect(() => {
    if (mode !== "ball") return;
    
    const checkInactivity = setInterval(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceInteraction > 3000 && !dragRef.current.dragging) {
        // Find nearest corner
        const ballSize = 60;
        const corners = [
          { x: 10, y: 10 }, // top-left
          { x: window.innerWidth - ballSize - 10, y: 10 }, // top-right
          { x: 10, y: window.innerHeight - ballSize - 10 }, // bottom-left
          { x: window.innerWidth - ballSize - 10, y: window.innerHeight - ballSize - 10 }, // bottom-right
        ];
        
        let nearest = corners[0];
        let minDist = Infinity;
        for (const corner of corners) {
          const dist = Math.hypot(ballPos.x - corner.x, ballPos.y - corner.y);
          if (dist < minDist) {
            minDist = dist;
            nearest = corner;
          }
        }
        
        // Animate to corner
        setBallPos(nearest);
        
        // After animation, switch to dock
        setTimeout(() => {
          const side = nearest.x < window.innerWidth / 2 ? "left" : "right";
          setDockSide(side);
          setDockY(nearest.y + ballSize / 2);
          setMode("dock");
        }, 600);
      }
    }, 500);

    return () => clearInterval(checkInactivity);
  }, [mode, ballPos]);

  // Card drag handlers
  const onCardPointerDown = useCallback((e: React.PointerEvent) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onCardPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging || mode !== "card") return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.moved = true;
    }
    const newX = Math.max(0, Math.min(window.innerWidth - 200, e.clientX - dragRef.current.offsetX));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragRef.current.offsetY));
    setPos({ x: newX, y: newY });
  }, [mode]);

  const onCardPointerUp = useCallback(() => {
    dragRef.current.dragging = false;
  }, []);

  // Ball drag handlers
  const onBallPointerDown = useCallback((e: React.PointerEvent) => {
    const ball = ballRef.current;
    if (!ball) return;
    const rect = ball.getBoundingClientRect();
    dragRef.current = {
      dragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
      moved: false,
    };
    lastInteractionRef.current = Date.now();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, []);

  const onBallPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current.dragging || mode !== "ball") return;
    lastInteractionRef.current = Date.now();
    const newX = Math.max(0, Math.min(window.innerWidth - 60, e.clientX - dragRef.current.offsetX));
    const newY = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - dragRef.current.offsetY));
    setBallPos({ x: newX, y: newY });
  }, [mode]);

  const onBallPointerUp = useCallback(() => {
    dragRef.current.dragging = false;
    lastInteractionRef.current = Date.now();
  }, []);

  const handleCardHeaderClick = () => {
    if (!dragRef.current.moved) {
      setExpanded((e) => !e);
    }
  };

  // Render based on mode
  if (mode === "card") {
    return (
      <div
        ref={cardRef}
        className="fixed z-40 select-none transition-all duration-300"
        style={{ left: pos.x, top: pos.y }}
        onPointerMove={onCardPointerMove}
        onPointerUp={onCardPointerUp}
      >
        <div className="relative w-[200px] rounded-lg border border-ink-700 bg-ink-900 shadow-[0_10px_30px_rgba(12,31,49,0.4)]">
          {/* Draggable header */}
          <div
            className="flex cursor-grab items-center gap-2 border-b border-ink-700 px-3 py-2 active:cursor-grabbing"
            onPointerDown={onCardPointerDown}
            onClick={handleCardHeaderClick}
            title="Drag to move · Click to expand"
          >
            <LogoMark size={22} />
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[8px] uppercase tracking-widest text-acc">Library Card</p>
              <p className="font-display text-[11px] font-semibold text-paper">Bibliothēkē</p>
            </div>
            <span className="font-mono text-[9px] text-moss">{count}</span>
          </div>

          {/* Stats (always visible) */}
          {!expanded && (
            <div className="px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wide text-[#7f95ab]">Saved</span>
                <span className="font-mono text-sm font-bold text-moss">{count}</span>
              </div>
            </div>
          )}

          {/* Expanded: saved books list */}
          {expanded && (
            <div className="max-h-[300px] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-ink-700/50 px-3 py-1.5">
                <span className="font-mono text-[9px] uppercase tracking-widest text-acc">
                  My Library ({count})
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
                  className="text-[#7f95ab] hover:text-paper"
                >
                  <IconX width={12} height={12} />
                </button>
              </div>
              {count === 0 ? (
                <p className="px-3 py-4 text-center font-mono text-[10px] text-[#5f7590]">
                  No books saved yet.
                  <br />
                  Click the save icon on any book.
                </p>
              ) : (
                <ul className="divide-y divide-ink-700/30">
                  {saved.map((b) => (
                    <li key={b.id} className="relative group/item px-3 py-2">
                      <div className="flex items-start gap-2">
                        <div className="h-10 w-7 shrink-0 overflow-hidden rounded bg-ink-800">
                          {b.cover ? (
                            <img
                              src={`https://covers.openlibrary.org/b/id/${b.cover}-S.jpg`}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-950">
                              <span className="text-[10px] font-bold text-acc">{b.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-paper">
                            {b.title}
                          </p>
                          <p className="truncate text-[9px] text-[#7f95ab]">{b.author}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <a
                              href={zLibraryUrl({ title: b.title, authors: [b.author] } as Book)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-paper/80 transition-colors hover:bg-acc hover:text-ink-950"
                              title="Z-Library"
                            >
                              Z-Lib
                            </a>
                            <a
                              href={annasUrl({ title: b.title, authors: [b.author] } as Book)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-paper/80 transition-colors hover:bg-acc hover:text-ink-950"
                              title="Anna's Archive"
                            >
                              Anna's
                            </a>
                            <a
                              href={googleBooksUrl({ title: b.title, authors: [b.author] } as Book)}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-paper/80 transition-colors hover:bg-acc hover:text-ink-950"
                              title="Google Books"
                            >
                              GBooks
                            </a>
                            <button
                              type="button"
                              onClick={() => onRemove(b.id)}
                              className="rounded bg-ink-700 px-1.5 py-0.5 font-mono text-[7px] font-semibold text-rust transition-colors hover:bg-rust hover:text-white"
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Stamp overlay */}
          {stamp && (
            <div
              key={stampKey}
              className="stamp-anim pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div className="rounded border-2 border-acc bg-ink-900/80 px-3 py-1 font-mono text-sm font-bold uppercase tracking-widest text-acc">
                {stamp}
              </div>
            </div>
          )}

          {/* Minimize to ball button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const cardRect = cardRef.current?.getBoundingClientRect();
              if (cardRect) {
                setBallPos({
                  x: cardRect.left + cardRect.width / 2 - 30,
                  y: cardRect.top + cardRect.height / 2 - 30,
                });
              }
              setMode("ball");
              setExpanded(false);
              lastInteractionRef.current = Date.now();
            }}
            className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-ink-700 bg-ink-900 text-[#7f95ab] transition-colors hover:border-acc hover:text-acc"
            title="Minimize to ball"
          >
            <IconX width={10} height={10} />
          </button>
        </div>
      </div>
    );
  }

  if (mode === "ball") {
    return (
      <div
        ref={ballRef}
        className="fixed z-40 select-none transition-all duration-500 ease-out"
        style={{ left: ballPos.x, top: ballPos.y }}
        onPointerDown={onBallPointerDown}
        onPointerMove={onBallPointerMove}
        onPointerUp={onBallPointerUp}
      >
        <button
          onClick={() => {
            setMode("card");
            setPos(ballPos);
          }}
          className="group/ball flex h-[60px] w-[60px] cursor-grab items-center justify-center rounded-full border-2 border-ink-700 bg-ink-900 shadow-[0_10px_30px_rgba(12,31,49,0.4)] transition-all hover:scale-110 hover:border-acc hover:shadow-[0_0_30px_rgba(240,163,47,0.3)] active:cursor-grabbing"
          title="Drag to move · Click to expand"
        >
          <div className="flex flex-col items-center gap-0.5 transition-transform duration-300 group-hover/ball:rotate-12">
            <LogoMark size={28} />
            {count > 0 && (
              <span className="font-mono text-[8px] font-bold text-moss">{count}</span>
            )}
          </div>
        </button>
      </div>
    );
  }

  // Dock mode
  return (
    <button
      onClick={() => {
        setMode("card");
        const x = dockSide === "right" ? window.innerWidth - 220 : 20;
        const y = Math.max(20, Math.min(window.innerHeight - 200, dockY - 50));
        setPos({ x, y });
      }}
      className={`fixed z-40 flex h-20 w-10 items-center justify-center border-2 border-ink-700 bg-ink-900 shadow-[0_0_20px_rgba(12,31,49,0.4)] transition-all hover:w-12 hover:border-acc ${
        dockSide === "right"
          ? "right-0 rounded-l-full border-r-0"
          : "left-0 rounded-r-full border-l-0"
      }`}
      style={{ top: dockY - 40 }}
      title="Expand library card"
    >
      <div className="flex flex-col items-center gap-1">
        <LogoMark size={24} />
        {count > 0 && (
          <span className="font-mono text-[9px] font-bold text-moss">{count}</span>
        )}
      </div>
    </button>
  );
}
