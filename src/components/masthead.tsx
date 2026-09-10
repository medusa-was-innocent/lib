import { useEffect, useRef, useState, type Ref } from "react";
import type { Mode } from "../lib/api";
import {
  IconArrowRight,
  IconArticle,
  IconBook,
  IconClock,
  IconGithub,
  IconSearch,
  IconX,
  LogoMark,
} from "./icons";

/* ------------------------------------------------------------------ */
/*  Mode tabs                                                          */
/* ------------------------------------------------------------------ */

export function ModeTabs({
  mode,
  onChange,
  compact = false,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  compact?: boolean;
}) {
  const btn = (m: Mode, label: string, icon: React.ReactNode) => {
    const active = mode === m;
    return (
      <button
        type="button"
        onClick={() => onChange(m)}
        className={`flex items-center gap-1.5 rounded-lg font-semibold transition-colors duration-150 ${
          compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        } ${
          active
            ? "bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan"
            : "text-chrome-dim hover:text-chrome border border-transparent"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };
  return (
    <div className="inline-flex items-center rounded-xl p-1 glass" role="tablist">
      {btn("books", "Books", <IconBook width={14} height={14} />)}
      {btn("articles", "Articles", <IconArticle width={14} height={14} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Count-up stat                                                      */
/* ------------------------------------------------------------------ */

function CountUp({ to, label, sub }: { to: number; label: string; sub: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1200;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  return (
    <div ref={ref} className="flex items-baseline gap-3 border-b border-white/5 py-3 last:border-0">
      <span className="font-display text-3xl font-semibold leading-none text-chrome-bright">
        {val}
        <span className="text-xl neon-cyan">M+</span>
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-chrome-bright">{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-chrome-dim">{sub}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shelf (simplified — fewer shadows)                                 */
/* ------------------------------------------------------------------ */

const SPINES: { t: string; a: string; h: number; c: string; w: number }[] = [
  { t: "THE ODYSSEY", a: "Homer", h: 178, c: "#1a3a5c", w: 30 },
  { t: "MOBY-DICK", a: "Melville", h: 158, c: "#2e4a3e", w: 36 },
  { t: "DON QUIXOTE", a: "Cervantes", h: 194, c: "#5c2a1a", w: 28 },
  { t: "HAMLET", a: "Shakespeare", h: 142, c: "#2a2a5c", w: 34 },
  { t: "WALDEN", a: "Thoreau", h: 154, c: "#5c4a1a", w: 26 },
  { t: "MIDDLEMARCH", a: "Eliot", h: 186, c: "#4a1a3a", w: 32 },
  { t: "CANDIDE", a: "Voltaire", h: 136, c: "#1a4a5c", w: 30 },
  { t: "THE REPUBLIC", a: "Plato", h: 168, c: "#3a5c2a", w: 34 },
  { t: "INVISIBLE CITIES", a: "Calvino", h: 148, c: "#5c3a1a", w: 26 },
  { t: "BELOVED", a: "Morrison", h: 162, c: "#4a2a4a", w: 30 },
  { t: "ULYSSES", a: "Joyce", h: 200, c: "#1a3a5c", w: 36 },
  { t: "FRANKENSTEIN", a: "Shelley", h: 152, c: "#2a3a5c", w: 28 },
  { t: "THE STRANGER", a: "Camus", h: 140, c: "#5c4a2a", w: 32 },
  { t: "THINGS FALL APART", a: "Achebe", h: 158, c: "#1a4a4a", w: 26 },
];

function Shelf({ onSearch }: { onSearch: (q: string) => void }) {
  return (
    <div className="relative mt-6">
      <div className="flex items-end justify-center gap-[5px] pb-[13px]">
        {SPINES.map((s, i) => (
          <button
            key={s.t}
            type="button"
            title={`Search "${s.t.toLowerCase()}"`}
            onClick={() => onSearch(`${s.a} ${s.t.toLowerCase()}`)}
            className="row-in group/spine relative overflow-hidden rounded-t-[3px] text-left transition-transform duration-200 ease-out hover:-translate-y-2"
            style={{
              width: s.w,
              height: s.h,
              background: `linear-gradient(100deg, ${s.c} 0%, ${s.c} 60%, rgba(0,0,0,0.35) 100%)`,
              boxShadow: "inset -4px 0 8px rgba(0,0,0,0.25), 0 6px 12px rgba(0,0,0,0.4)",
              animationDelay: `${300 + i * 40}ms`,
            }}
          >
            <span className="spine-label absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[9px] font-semibold tracking-wider text-chrome/70 transition-colors group-hover/spine:text-neon-cyan">
              {s.t}
            </span>
          </button>
        ))}
      </div>
      <div className="h-[8px] w-full rounded-sm bg-void-4" />
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-chrome-dim">
        pull a spine — it searches itself
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Masthead                                                           */
/* ------------------------------------------------------------------ */

const SUGGESTIONS = ["sherlock holmes", "isaac asimov", "jane austen", "meditations", "dostoevsky", "the republic"];

export function Masthead({
  mode,
  onMode,
  query,
  onQuery,
  onSearch,
  recent,
  onClearRecent,
  inputRef,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  query: string;
  onQuery: (q: string) => void;
  onSearch: (q: string) => void;
  recent: string[];
  onClearRecent: () => void;
  inputRef: Ref<HTMLInputElement>;
}) {
  return (
    <header className="relative overflow-hidden bg-void text-chrome">
      {/* single subtle glow */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-[400px] w-[400px] rounded-full bg-neon-cyan/8 blur-[100px]" />

      {/* top bar */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark size={34} />
          <span className="font-display text-2xl font-semibold tracking-tight text-holo">
            Bibliothēkē
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-chrome-dim md:flex">
          <a href="#catalog" className="transition-colors hover:text-neon-cyan">Catalog</a>
          <a href="#how" className="transition-colors hover:text-neon-cyan">How it works</a>
          <a href="#run" className="transition-colors hover:text-neon-cyan">Run the original</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-lg glass px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-chrome-dim sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
            online
          </span>
          <a
            href="https://github.com/Devanshu-17/zLibrary"
            target="_blank"
            rel="noreferrer"
            aria-label="Original repository on GitHub"
            className="rounded-lg glass p-2 text-chrome-dim transition-colors hover:text-neon-cyan"
          >
            <IconGithub width={16} height={16} />
          </a>
        </div>
      </div>

      {/* main grid */}
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-12">
        <div>
          <p className="row-in font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan" style={{ animationDelay: "60ms" }}>
            ◆ Digital Archive Console
          </p>
          <h1
            className="row-in mt-4 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl"
            style={{ animationDelay: "140ms" }}
          >
            <span className="text-chrome">Every book on Earth,</span>
            <br />
            <span className="text-holo">one search box.</span>
          </h1>
          <p className="row-in mt-5 max-w-xl text-[15px] leading-relaxed text-chrome-dim" style={{ animationDelay: "220ms" }}>
            A working browser rebuild of <span className="font-mono text-[13px] text-chrome">Devanshu-17/zLibrary</span> —
            search 20M+ book records and 150M+ article records, then jump to real download sources.
          </p>

          {/* search */}
          <form
            className="row-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch"
            style={{ animationDelay: "300ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q) onSearch(q);
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-xl glass-strong px-4 transition-colors focus-within:border-neon-cyan/40">
              <IconSearch className="shrink-0 text-chrome-dim" width={19} height={19} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={mode === "books" ? "Title, author, ISBN, subject…" : "Paper title, topic, DOI…"}
                className="h-[52px] w-full bg-transparent text-[15px] text-chrome-bright placeholder-chrome-dim/60 outline-none"
                aria-label="Search the catalog"
              />
              <kbd className="hidden shrink-0 rounded glass px-1.5 py-0.5 font-mono text-[10px] text-chrome-dim sm:block">
                /
              </kbd>
            </div>
            <button
              type="submit"
              className="btn-click flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-neon-cyan px-7 text-[15px] font-bold text-void transition-colors hover:bg-[#33f5ff]"
            >
              Search {mode === "books" ? "books" : "articles"}
              <IconArrowRight width={17} height={17} />
            </button>
          </form>

          <div className="row-in mt-4 flex flex-wrap items-center gap-2" style={{ animationDelay: "380ms" }}>
            <ModeTabs mode={mode} onChange={onMode} />
            <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-chrome-dim">try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSearch(s)}
                className="btn-click rounded-lg glass px-3 py-1 text-xs text-chrome-dim transition-colors hover:text-neon-cyan"
              >
                {s}
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <div className="row-in mt-3 flex flex-wrap items-center gap-2" style={{ animationDelay: "440ms" }}>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-chrome-dim">
                <IconClock width={12} height={12} /> recent
              </span>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSearch(r)}
                  className="btn-click rounded-lg glass px-3 py-1 text-xs text-chrome-dim transition-colors hover:text-neon-magenta"
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={onClearRecent}
                aria-label="Clear recent searches"
                className="rounded-lg p-1 text-chrome-dim transition-colors hover:text-neon-magenta"
              >
                <IconX width={13} height={13} />
              </button>
            </div>
          )}
        </div>

        {/* right column */}
        <div className="row-in relative" style={{ animationDelay: "360ms" }}>
          <div className="rounded-2xl glass-strong px-5 py-2">
            <CountUp to={20} label="book records indexed" sub="open library" />
            <CountUp to={150} label="article metadata records" sub="crossref" />
            <CountUp to={44} label="free archived texts" sub="internet archive" />
          </div>
          <Shelf onSearch={onSearch} />
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky bar                                                         */
/* ------------------------------------------------------------------ */

export function StickyBar({
  visible,
  mode,
  onMode,
  query,
  onQuery,
  onSearch,
  stickyRef,
}: {
  visible: boolean;
  mode: Mode;
  onMode: (m: Mode) => void;
  query: string;
  onQuery: (q: string) => void;
  onSearch: (q: string) => void;
  stickyRef: Ref<HTMLInputElement>;
}) {
  return (
    <div
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-void/95 transition-transform duration-200 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5 sm:px-8">
        <a href="#top" className="hidden items-center gap-2 sm:flex">
          <LogoMark size={26} />
          <span className="font-display text-lg font-semibold text-holo">Bibliothēkē</span>
        </a>
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (q) onSearch(q);
          }}
        >
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg glass px-3 transition-colors focus-within:border-neon-cyan/40">
            <IconSearch width={14} height={14} className="text-chrome-dim" />
            <input
              ref={stickyRef}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search…"
              className="h-full w-full bg-transparent text-sm text-chrome-bright placeholder-chrome-dim/60 outline-none"
              aria-label="Search"
            />
          </div>
          <button
            type="submit"
            className="btn-click h-9 rounded-lg bg-neon-cyan px-4 text-sm font-bold text-void"
          >
            Go
          </button>
        </form>
        <ModeTabs mode={mode} onChange={onMode} compact />
      </div>
    </div>
  );
}
