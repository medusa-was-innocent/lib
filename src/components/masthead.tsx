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
  dark = false,
  compact = false,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
  dark?: boolean;
  compact?: boolean;
}) {
  const btn = (m: Mode, label: string, icon: React.ReactNode) => {
    const active = mode === m;
    return (
      <button
        type="button"
        onClick={() => onChange(m)}
        className={`flex items-center gap-1.5 rounded-full font-semibold transition-colors duration-200 ${
          compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        } ${
          active
            ? "bg-acc text-ink-950 shadow-sm"
            : dark
              ? "text-[#9db2c7] hover:text-paper"
              : "text-faint hover:text-ink-900"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };
  return (
    <div
      className={`inline-flex items-center rounded-full p-1 ${
        dark ? "border border-ink-600 bg-ink-800/80" : "border border-line bg-card shadow-sm"
      }`}
      role="tablist"
    >
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
        const dur = 1500;
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
    <div ref={ref} className="flex items-baseline gap-3 border-b border-ink-700/70 py-3 last:border-0">
      <span className="font-display text-3xl font-semibold leading-none text-paper">
        {val}
        <span className="text-xl text-acc">M+</span>
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-paper/90">{label}</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#7f95ab]">{sub}</span>
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shelf                                                              */
/* ------------------------------------------------------------------ */

const SPINES: { t: string; a: string; h: number; c: string; w: number }[] = [
  { t: "THE ODYSSEY", a: "Homer", h: 178, c: "#1f6fb2", w: 30 },
  { t: "MOBY-DICK", a: "Melville", h: 158, c: "#2e6e5e", w: 36 },
  { t: "DON QUIXOTE", a: "Cervantes", h: 194, c: "#b3512f", w: 28 },
  { t: "HAMLET", a: "Shakespeare", h: 142, c: "#3d4f7c", w: 34 },
  { t: "WALDEN", a: "Thoreau", h: 154, c: "#c99a2e", w: 26 },
  { t: "MIDDLEMARCH", a: "Eliot", h: 186, c: "#7a3b4f", w: 32 },
  { t: "CANDIDE", a: "Voltaire", h: 136, c: "#38657f", w: 30 },
  { t: "THE REPUBLIC", a: "Plato", h: 168, c: "#5b7d54", w: 34 },
  { t: "INVISIBLE CITIES", a: "Calvino", h: 148, c: "#a8663b", w: 26 },
  { t: "BELOVED", a: "Morrison", h: 162, c: "#8c4a5e", w: 30 },
  { t: "ULYSSES", a: "Joyce", h: 200, c: "#2c5a80", w: 36 },
  { t: "FRANKENSTEIN", a: "Shelley", h: 152, c: "#4a5a8a", w: 28 },
  { t: "THE STRANGER", a: "Camus", h: 140, c: "#99652f", w: 32 },
  { t: "THINGS FALL APART", a: "Achebe", h: 158, c: "#356b6b", w: 26 },
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
            className="row-in group/spine relative overflow-hidden rounded-t-[3px] text-left transition-transform duration-300 ease-out hover:-translate-y-3"
            style={{
              width: s.w,
              height: s.h,
              background: `linear-gradient(100deg, ${s.c} 0%, ${s.c} 55%, rgba(0,0,0,0.28) 130%)`,
              boxShadow: "inset -5px 0 10px rgba(0,0,0,0.22), inset 4px 0 6px rgba(255,255,255,0.14), 0 10px 18px rgba(0,0,0,0.35)",
              animationDelay: `${300 + i * 55}ms`,
            }}
          >
            <span className="spine-label absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[9px] font-semibold tracking-wider text-paper/90 transition-colors group-hover/spine:text-acc">
              {s.t}
            </span>
            <span className="absolute inset-x-[4px] bottom-2 h-px bg-paper/25" />
            <span className="absolute inset-x-[4px] bottom-4 h-px bg-paper/15" />
          </button>
        ))}
      </div>
      <div className="h-[10px] w-full rounded-sm bg-ink-700 shadow-[0_14px 34px rgba(0,0,0,0.5)]" />
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-[#7f95ab]">
        pull a spine — it searches itself
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee                                                            */
/* ------------------------------------------------------------------ */

const MARQUEE = [
  "Pride and Prejudice",
  "One Hundred Years of Solitude",
  "The Brothers Karamazov",
  "Crime and Punishment",
  "To the Lighthouse",
  "The Master and Margarita",
  "Beloved",
  "The Trial",
  "The Name of the Rose",
  "Anna Karenina",
  "Things Fall Apart",
  "Gone with the Wind",
];

function Marquee() {
  const row = (ariaHidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {MARQUEE.map((t) => (
        <span key={t + (ariaHidden ? "-b" : "-a")} className="flex items-center">
          <span className="whitespace-nowrap px-6 font-display text-sm italic text-paper/55">{t}</span>
          <svg width="7" height="7" viewBox="0 0 8 8" className="text-acc/70">
            <rect x="1.5" y="1.5" width="5" height="5" transform="rotate(45 4 4)" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee relative overflow-hidden border-t border-white/10 bg-ink-950/70 py-3">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
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
    <header className="relative overflow-hidden bg-ink-900 text-paper">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-royal/25 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[380px] w-[380px] rounded-full bg-acc/12 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 halftone opacity-[0.06]" />

      {/* top bar */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark size={34} />
          <span className="font-display text-2xl font-semibold tracking-tight">
            <span className="italic text-acc">Bibliothēkē</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#a9bccf] md:flex">
          <a href="#catalog" className="transition-colors hover:text-acc">Catalog</a>
          <a href="#how" className="transition-colors hover:text-acc">How it works</a>
          <a href="#run" className="transition-colors hover:text-acc">Run the original</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-ink-600 bg-ink-800/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-[#9db2c7] sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" />
            sources online
          </span>
          <a
            href="https://github.com/Devanshu-17/zLibrary"
            target="_blank"
            rel="noreferrer"
            aria-label="Original repository on GitHub"
            className="rounded-lg border border-ink-600 bg-ink-800/70 p-2 text-[#c6d4e2] transition-colors hover:border-acc hover:text-acc"
          >
            <IconGithub width={16} height={16} />
          </a>
        </div>
      </div>

      {/* main grid */}
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-12">
        <div>
          <p className="row-in font-mono text-[11px] uppercase tracking-[0.3em] text-acc" style={{ animationDelay: "60ms" }}>
            Open catalog console · books & articles
          </p>
          <h1
            className="row-in mt-4 font-display text-[2.6rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl"
            style={{ animationDelay: "140ms" }}
          >
            Every book on Earth,
            <br />
            <span className="italic text-acc">one search box.</span>
          </h1>
          <p className="row-in mt-5 max-w-xl text-[15px] leading-relaxed text-[#a9bccf]" style={{ animationDelay: "220ms" }}>
            A working browser rebuild of <span className="font-mono text-[13px] text-paper/80">Devanshu-17/zLibrary</span> —
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
            <div className="flex flex-1 items-center gap-3 rounded-xl border border-ink-600 bg-ink-950/70 px-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition-colors focus-within:border-acc">
              <IconSearch className="shrink-0 text-[#7f95ab]" width={19} height={19} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                placeholder={mode === "books" ? "Title, author, ISBN, subject…" : "Paper title, topic, DOI…"}
                className="h-[52px] w-full bg-transparent text-[15px] text-paper placeholder-[#5f7590] outline-none"
                aria-label="Search the catalog"
              />
              <kbd className="hidden shrink-0 rounded border border-ink-600 bg-ink-800 px-1.5 py-0.5 font-mono text-[10px] text-[#9db2c7] sm:block">
                /
              </kbd>
            </div>
            <button
              type="submit"
              className="btn-click group flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-acc px-7 text-[15px] font-bold text-ink-950 shadow-[0_10px_26px_rgba(240,163,47,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[#ffbd52] active:translate-y-0"
            >
              Search {mode === "books" ? "books" : "articles"}
              <IconArrowRight width={17} height={17} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="row-in mt-4 flex flex-wrap items-center gap-2" style={{ animationDelay: "380ms" }}>
            <ModeTabs mode={mode} onChange={onMode} dark />
            <span className="mx-1 hidden h-4 w-px bg-ink-600 sm:block" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#7f95ab]">try</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSearch(s)}
                className="btn-click rounded-full border border-ink-600 bg-ink-800/60 px-3 py-1 text-xs text-[#b9c9da] transition-colors hover:border-acc hover:text-acc"
              >
                {s}
              </button>
            ))}
          </div>

          {recent.length > 0 && (
            <div className="row-in mt-3 flex flex-wrap items-center gap-2" style={{ animationDelay: "440ms" }}>
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-[#7f95ab]">
                <IconClock width={12} height={12} /> recent
              </span>
              {recent.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSearch(r)}
                  className="btn-click rounded-full border border-royal/40 bg-royal/15 px-3 py-1 text-xs text-[#a9cbe8] transition-colors hover:border-acc hover:text-acc"
                >
                  {r}
                </button>
              ))}
              <button
                type="button"
                onClick={onClearRecent}
                aria-label="Clear recent searches"
                className="rounded-full p-1 text-[#7f95ab] transition-colors hover:text-rust"
              >
                <IconX width={13} height={13} />
              </button>
            </div>
          )}
        </div>

        {/* right column */}
        <div className="row-in relative" style={{ animationDelay: "360ms" }}>
          <div className="rounded-2xl border border-ink-700 bg-ink-800/50 px-5 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
            <CountUp to={20} label="book records indexed" sub="open library" />
            <CountUp to={150} label="article metadata records" sub="crossref" />
            <CountUp to={44} label="free archived texts" sub="internet archive" />
          </div>
          <Shelf onSearch={onSearch} />
        </div>
      </div>

      <Marquee />
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
      className={`fixed inset-x-0 top-0 z-50 border-b border-ink-700 bg-ink-950/95 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-2.5 sm:px-8">
        <a href="#top" className="hidden items-center gap-2 sm:flex">
          <LogoMark size={26} />
          <span className="font-display text-lg font-semibold">
            <span className="italic text-acc">Bibliothēkē</span>
          </span>
        </a>
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const q = query.trim();
            if (q) onSearch(q);
          }}
        >
          <div className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-ink-600 bg-ink-900 px-3 transition-colors focus-within:border-acc">
            <IconSearch width={14} height={14} className="text-[#7f95ab]" />
            <input
              ref={stickyRef}
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search…"
              className="h-full w-full bg-transparent text-sm text-paper placeholder-[#5f7590] outline-none"
              aria-label="Search"
            />
          </div>
          <button
            type="submit"
            className="btn-click h-9 rounded-lg bg-acc px-4 text-sm font-bold text-ink-950 transition-colors hover:bg-[#ffbd52]"
          >
            Go
          </button>
        </form>
        <ModeTabs mode={mode} onChange={onMode} dark compact />
      </div>
    </div>
  );
}
