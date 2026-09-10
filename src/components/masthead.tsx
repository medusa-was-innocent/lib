import { useEffect, useRef, useState, type Ref } from "react";
import type { Mode } from "../lib/api";
import {
  IconArrowRight,
  IconArticle,
  IconBolt,
  IconBook,
  IconClock,
  IconGithub,
  IconSearch,
  IconX,
  LogoMark,
} from "./icons";

/* ---------- Mode tabs ---------- */

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
        className={`flex items-center gap-1.5 rounded-md font-semibold transition-colors duration-150 ${
          compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
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
    <div className="inline-flex items-center rounded-lg p-1 panel" role="tablist">
      {btn("books", "Books", <IconBook width={13} height={13} />)}
      {btn("articles", "Articles", <IconArticle width={13} height={13} />)}
    </div>
  );
}

/* ---------- Count-up stat ---------- */

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
    <div ref={ref} className="flex items-baseline gap-3 border-b border-white/5 py-2.5 last:border-0">
      <span className="font-display text-2xl font-semibold leading-none text-chrome-bright">
        {val}
        <span className="text-lg neon-cyan">M+</span>
      </span>
      <span className="flex flex-col">
        <span className="text-xs font-semibold text-chrome-bright">{label}</span>
        <span className="font-mono text-[9px] uppercase tracking-widest text-chrome-dim">{sub}</span>
      </span>
    </div>
  );
}

/* ---------- Masthead ---------- */

const SUGGESTIONS = ["sherlock holmes", "isaac asimov", "jane austen", "meditations", "dostoevsky"];

export function Masthead({
  mode,
  onMode,
  query,
  onQuery,
  onSearch,
  recent,
  onClearRecent,
  inputRef,
  perfMode,
  onPerfMode,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  query: string;
  onQuery: (q: string) => void;
  onSearch: (q: string) => void;
  recent: string[];
  onClearRecent: () => void;
  inputRef: Ref<HTMLInputElement>;
  perfMode: boolean;
  onPerfMode: (v: boolean) => void;
}) {
  return (
    <header className="relative overflow-hidden bg-void text-chrome">
      {/* Subtle grid (static, no animation) */}
      {!perfMode && <div className="pointer-events-none absolute inset-0 bg-grid opacity-30" />}

      {/* Top bar */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <a href="#top" className="flex items-center gap-2.5">
          <LogoMark size={32} />
          <span className="font-display text-xl font-semibold tracking-tight text-holo">
            Bibliothēkē
          </span>
        </a>
        <nav className="hidden items-center gap-6 text-sm font-medium text-chrome-dim md:flex">
          <a href="#catalog" className="transition-colors hover:text-neon-cyan">Catalog</a>
          <a href="#how" className="transition-colors hover:text-neon-cyan">How it works</a>
          <button
            type="button"
            onClick={() => onPerfMode(!perfMode)}
            title={perfMode ? "Disable performance mode" : "Enable performance mode"}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              perfMode
                ? "border-neon-lime/40 bg-neon-lime/10 text-neon-lime"
                : "border-panel-border text-chrome-dim hover:border-neon-cyan hover:text-neon-cyan"
            }`}
          >
            <IconBolt width={11} height={11} />
            {perfMode ? "Perf On" : "Perf"}
          </button>
        </nav>
        <div className="flex items-center gap-2.5">
          <a
            href="https://github.com/Devanshu-17/zLibrary"
            target="_blank"
            rel="noreferrer"
            aria-label="Original repository on GitHub"
            className="rounded-md border border-panel-border p-2 text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan"
          >
            <IconGithub width={15} height={15} />
          </a>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 pb-12 pt-6 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:pt-10">
        <div>
          <p className="row-in font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan" style={{ animationDelay: "60ms" }}>
            Digital Archive Console
          </p>
          <h1
            className="row-in mt-3 font-display text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-5xl"
            style={{ animationDelay: "140ms" }}
          >
            <span className="text-chrome">Every book on Earth,</span>
            <br />
            <span className="text-holo">one search box.</span>
          </h1>
          <p className="row-in mt-4 max-w-xl text-sm leading-relaxed text-chrome-dim" style={{ animationDelay: "220ms" }}>
            A working browser rebuild of <span className="font-mono text-xs text-chrome">Devanshu-17/zLibrary</span> —
            search 20M+ book records and 150M+ article records, then jump to real download sources.
          </p>

          {/* Search */}
          <form
            className="row-in mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-stretch"
            style={{ animationDelay: "300ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q) onSearch(q);
            }}
          >
            <div className="flex flex-1 items-center gap-2.5 rounded-lg border border-panel-border bg-void-2 px-3 transition-colors focus-within:border-neon-cyan/40">
              <IconSearch className="shrink-0 text-chrome-dim" width={17} height={17} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={mode === "books" ? "Title, author, ISBN…" : "Paper title, DOI…"}
                className="h-[46px] w-full bg-transparent text-sm text-chrome-bright placeholder-chrome-dim/60 outline-none"
                aria-label="Search the catalog"
              />
              <kbd className="hidden shrink-0 rounded border border-panel-border bg-void-3 px-1.5 py-0.5 font-mono text-[9px] text-chrome-dim sm:block">
                /
              </kbd>
            </div>
            <button
              type="submit"
              className="btn-click group flex h-[46px] shrink-0 items-center justify-center gap-2 rounded-lg bg-neon-cyan px-6 text-sm font-bold text-void transition-colors hover:bg-[#33ecff]"
            >
              Search {mode === "books" ? "books" : "articles"}
              <IconArrowRight width={15} height={15} />
            </button>
          </form>

          <div className="row-in mt-3 flex flex-wrap items-center gap-2" style={{ animationDelay: "380ms" }}>
            <ModeTabs mode={mode} onChange={onMode} />
            <span className="mx-1 hidden h-4 w-px bg-white/10 sm:block" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-chrome-dim">try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSearch(s)}
                className="btn-click rounded-md border border-panel-border px-2.5 py-1 text-xs text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan"
              >
                {s}
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <div className="row-in mt-2.5 flex flex-wrap items-center gap-2" style={{ animationDelay: "440ms" }}>
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-chrome-dim">
                <IconClock width={11} height={11} /> recent
              </span>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSearch(r)}
                  className="btn-click rounded-md border border-panel-border px-2.5 py-1 text-xs text-chrome-dim transition-colors hover:border-neon-magenta hover:text-neon-magenta"
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={onClearRecent}
                aria-label="Clear recent searches"
                className="rounded-md p-1 text-chrome-dim transition-colors hover:text-neon-magenta"
              >
                <IconX width={12} height={12} />
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="row-in relative" style={{ animationDelay: "360ms" }}>
          <div className="rounded-lg panel-strong px-4 py-2">
            <CountUp to={20} label="book records indexed" sub="open library" />
            <CountUp to={150} label="article metadata records" sub="crossref" />
            <CountUp to={44} label="free archived texts" sub="internet archive" />
          </div>
        </div>
      </div>
    </header>
  );
}

/* ---------- Sticky bar ---------- */

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
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-5 py-2 sm:px-8">
        <a href="#top" className="hidden items-center gap-2 sm:flex">
          <LogoMark size={24} />
          <span className="font-display text-base font-semibold text-holo">Bibliothēkē</span>
        </a>
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (q) onSearch(q);
          }}
        >
          <div className="flex h-8 flex-1 items-center gap-2 rounded-md border border-panel-border bg-void-2 px-2.5 transition-colors focus-within:border-neon-cyan/40">
            <IconSearch width={13} height={13} className="text-chrome-dim" />
            <input
              ref={stickyRef}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search…"
              className="h-full w-full bg-transparent text-xs text-chrome-bright placeholder-chrome-dim/60 outline-none"
              aria-label="Search"
            />
          </div>
          <button
            type="submit"
            className="btn-click h-8 rounded-md bg-neon-cyan px-3 text-xs font-bold text-void"
          >
            Go
          </button>
        </form>
        <ModeTabs mode={mode} onChange={onMode} compact />
      </div>
    </div>
  );
}
