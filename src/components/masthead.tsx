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
/*  Shared: Books / Articles segmented control (Y2K chrome)           */
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
        className={`flex items-center gap-1.5 rounded-lg font-semibold transition-all duration-200 ${
          compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm"
        } ${
          active
            ? "bg-gradient-to-b from-neon-cyan/20 to-neon-cyan/5 border border-neon-cyan/40 text-neon-cyan shadow-[0_0_12px_rgba(0,240,255,0.3)]"
            : "text-chrome-dim hover:text-chrome border border-transparent"
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };
  return (
    <div
      className="inline-flex items-center rounded-xl p-1 glass"
      role="tablist"
    >
      {btn("books", "Books", <IconBook width={14} height={14} />)}
      {btn("articles", "Articles", <IconArticle width={14} height={14} />)}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Animated count-up stat                                             */
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
    <div ref={ref} className="group flex items-baseline gap-3 border-b border-white/5 py-3 last:border-0">
      <span className="font-display text-3xl font-semibold leading-none text-chrome-bright transition-colors group-hover:text-neon-cyan">
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
/*  Shelf of classic spines                                            */
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
    <div className="relative mt-6" aria-hidden={false}>
      <div className="flex items-end justify-center gap-[5px] pb-[13px]">
        {SPINES.map((s, i) => (
          <button
            key={s.t}
            type="button"
            title={`Search "${s.t.toLowerCase()}"`}
            onClick={() => onSearch(`${s.a} ${s.t.toLowerCase()}`)}
            className="row-in group/spine relative overflow-hidden rounded-t-[3px] text-left transition-transform duration-300 ease-out hover:-translate-y-3 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] focus-visible:-translate-y-3 focus-visible:outline-2 focus-visible:outline-neon-cyan"
            style={{
              width: s.w,
              height: s.h,
              background: `linear-gradient(100deg, ${s.c} 0%, ${s.c} 55%, rgba(0,0,0,0.4) 130%)`,
              boxShadow: "inset -5px 0 10px rgba(0,0,0,0.3), inset 4px 0 6px rgba(255,255,255,0.1), 0 10px 18px rgba(0,0,0,0.5)",
              animationDelay: `${300 + i * 55}ms`,
            }}
          >
            <span className="spine-label absolute left-1/2 top-2 -translate-x-1/2 font-mono text-[9px] font-semibold tracking-wider text-chrome/80 transition-colors group-hover/spine:text-neon-cyan">
              {s.t}
            </span>
            <span className="absolute inset-x-[4px] bottom-2 h-px bg-chrome/20" />
            <span className="absolute inset-x-[4px] bottom-4 h-px bg-chrome/10" />
          </button>
        ))}
      </div>
      {/* shelf board */}
      <div className="h-[10px] w-full rounded-sm bg-void-4 shadow-[0_14px_34px_rgba(0,0,0,0.6)]" />
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-chrome-dim">
        pull a spine off the shelf — it searches itself
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Marquee of the canon                                               */
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
          <span className="whitespace-nowrap px-6 font-display text-sm italic text-chrome-dim/60">{t}</span>
          <svg width="7" height="7" viewBox="0 0 8 8" className="text-neon-cyan/50">
            <rect x="1.5" y="1.5" width="5" height="5" transform="rotate(45 4 4)" fill="currentColor" />
          </svg>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee relative overflow-hidden border-t border-white/5 bg-void/70 py-3">
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
    <header className="scanlines relative overflow-hidden bg-void text-chrome">
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-40 h-[480px] w-[480px] rounded-full bg-neon-cyan/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[380px] w-[380px] rounded-full bg-neon-magenta/8 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      {/* top bar */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-3">
          <LogoMark size={34} />
          <span className="font-display text-2xl font-semibold tracking-tight">
            <span className="text-holo">Bibliothēkē</span>
          </span>
        </a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-chrome-dim md:flex">
          <a href="#catalog" className="transition-colors hover:text-neon-cyan">Catalog</a>
          <a href="#how" className="transition-colors hover:text-neon-cyan">How it works</a>
          <a href="#run" className="transition-colors hover:text-neon-cyan">Run the original</a>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-lg glass px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-chrome-dim sm:flex">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-neon-cyan" />
            sources online
          </span>
          <a
            href="https://github.com/Devanshu-17/zLibrary"
            target="_blank"
            rel="noreferrer"
            aria-label="Original repository on GitHub"
            className="rounded-lg glass p-2 text-chrome-dim transition-all hover:-translate-y-0.5 hover:border-neon-cyan/40 hover:text-neon-cyan"
          >
            <IconGithub width={16} height={16} />
          </a>
        </div>
      </div>

      {/* main grid */}
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 pb-14 pt-8 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:pt-12">
        <div>
          <p className="row-in font-mono text-[11px] uppercase tracking-[0.3em] text-neon-cyan" style={{ animationDelay: "60ms" }}>
            ◆ Digital Archive Console · Books & Articles
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
            the Python + Streamlit downloader. Search 20M+ book records and 150M+ article records across open
            catalogs, then jump straight to real files: Internet Archive copies and open-access PDFs.
          </p>

          {/* search console */}
          <form
            className="row-in mt-8 flex flex-col gap-3 sm:flex-row sm:items-stretch"
            style={{ animationDelay: "300ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              if (q) onSearch(q);
            }}
          >
            <div className="flex flex-1 items-center gap-3 rounded-xl glass-strong px-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition-all focus-within:border-neon-cyan/40 focus-within:shadow-[0_0_0_4px_rgba(0,240,255,0.1),0_10px_30px_rgba(0,0,0,0.4)]">
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
              className="btn-click group flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-neon-cyan to-[#00b8cc] px-7 text-[15px] font-bold text-void shadow-[0_10px_26px_rgba(0,240,255,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(0,240,255,0.45)] active:translate-y-0"
            >
              Search {mode === "books" ? "books" : "articles"}
              <IconArrowRight width={17} height={17} className="transition-transform group-hover:translate-x-1" />
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
                className="btn-click rounded-lg glass px-3 py-1 text-xs text-chrome-dim transition-all hover:-translate-y-0.5 hover:border-neon-cyan/40 hover:text-neon-cyan"
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
                  className="btn-click rounded-lg glass px-3 py-1 text-xs text-chrome-dim transition-all hover:-translate-y-0.5 hover:border-neon-magenta/40 hover:text-neon-magenta"
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

        {/* right column: stats + shelf */}
        <div className="row-in relative" style={{ animationDelay: "360ms" }}>
          <div className="rounded-2xl glass-strong px-5 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
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
/*  Sticky mini-search                                                 */
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
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-void/95 backdrop-blur transition-transform duration-300 ${
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
              placeholder="Search the catalog…"
              className="h-full w-full bg-transparent text-sm text-chrome-bright placeholder-chrome-dim/60 outline-none"
              aria-label="Search the catalog (sticky)"
            />
          </div>
          <button
            type="submit"
            className="btn-click h-9 rounded-lg bg-gradient-to-b from-neon-cyan to-[#00b8cc] px-4 text-sm font-bold text-void transition-transform active:scale-95"
          >
            Go
          </button>
        </form>
        <ModeTabs mode={mode} onChange={onMode} compact />
      </div>
    </div>
  );
}
