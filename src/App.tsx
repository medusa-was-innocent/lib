import { useCallback, useEffect, useRef, useState } from "react";
import type { Article, Book, BookFilters, Mode } from "./lib/api";
import { searchArticles, searchBooks } from "./lib/api";
import { Masthead, StickyBar } from "./components/masthead";
import { Results } from "./components/results";
import { Info } from "./components/info";
import { IconCheck } from "./components/icons";

const DEFAULT_FILTERS: BookFilters = { lang: "", sort: "relevance", ebookOnly: false };
const PRELOAD = "sherlock holmes";
const RECENT_KEY = "bibliotheke-recent";

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [mode, setMode] = useState<Mode>("books");
  const [query, setQuery] = useState(PRELOAD);
  const [active, setActive] = useState<{ mode: Mode; q: string }>({ mode: "books", q: PRELOAD });
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<BookFilters>(DEFAULT_FILTERS);

  const [books, setBooks] = useState<Book[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recent, setRecent] = useState<string[]>(loadRecent);
  const [toast, setToast] = useState<{ id: number; msg: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const stickyRef = useRef<HTMLInputElement>(null);
  const reqRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);
  const scrolledRef = useRef(false);
  const cacheRef = useRef(new Map<string, { books: Book[]; articles: Article[]; total: number }>());

  /* ---------- fetch orchestration ---------- */

  const run = useCallback(async (m: Mode, q: string, p: number, f: BookFilters) => {
    const id = ++reqRef.current;
    const key = [m, q, p, f.lang, f.sort, f.ebookOnly].join("|");
    const hit = cacheRef.current.get(key);
    if (hit) {
      setBooks(hit.books);
      setArticles(hit.articles);
      setTotal(hit.total);
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    const ctl = new AbortController();
    abortRef.current = ctl;
    setLoading(true);
    setError(null);

    try {
      if (m === "books") {
        const r = await searchBooks(q, p, f, ctl.signal);
        if (id !== reqRef.current) return;
        setBooks(r.items);
        setArticles([]);
        setTotal(r.total);
        cacheRef.current.set(key, { books: r.items, articles: [], total: r.total });
      } else {
        const r = await searchArticles(q, p, ctl.signal);
        if (id !== reqRef.current) return;
        setArticles(r.items);
        setBooks([]);
        setTotal(r.total);
        cacheRef.current.set(key, { books: [], articles: r.items, total: r.total });
      }
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string };
      if (id !== reqRef.current || e?.name === "AbortError") return;
      setBooks([]);
      setArticles([]);
      setTotal(0);
      setError(e?.message ?? "Network error — check your connection and retry.");
    } finally {
      if (id === reqRef.current) setLoading(false);
    }
  }, []);

  /* preload the catalog so the page opens alive */
  useEffect(() => {
    run("books", PRELOAD, 1, DEFAULT_FILTERS);
  }, [run]);

  /* ---------- actions ---------- */

  const showToast = useCallback((msg: string) => setToast({ id: Date.now(), msg }), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
    } catch {
      /* private mode — ignore */
    }
  }, [recent]);

  const search = useCallback(
    (raw: string, m: Mode = mode) => {
      const q = raw.trim();
      if (!q) return;
      setQuery(q);
      setActive({ mode: m, q });
      setPage(1);
      setRecent((r) => [q, ...r.filter((x) => x.toLowerCase() !== q.toLowerCase())].slice(0, 6));
      run(m, q, 1, filters);
      requestAnimationFrame(() => {
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [mode, filters, run]
  );

  const switchMode = useCallback(
    (m: Mode) => {
      if (m === mode) return;
      setMode(m);
      setActive((a) => ({ mode: m, q: a.q }));
      setPage(1);
      run(m, active.q, 1, filters);
    },
    [mode, active.q, filters, run]
  );

  const gotoPage = useCallback(
    (p: number) => {
      setPage(p);
      run(mode, active.q, p, filters);
      requestAnimationFrame(() => {
        document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [mode, active.q, filters, run]
  );

  const applyFilters = useCallback(
    (f: BookFilters) => {
      setFilters(f);
      setPage(1);
      run(mode, active.q, 1, f);
    },
    [mode, active.q, run]
  );

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    run(mode, active.q, 1, DEFAULT_FILTERS);
  }, [mode, active.q, run]);

  /* ---------- chrome: sticky bar + "/" shortcut ---------- */

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 560;
      scrolledRef.current = past;
      setScrolled(past);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      e.preventDefault();
      (scrolledRef.current ? stickyRef.current : inputRef.current)?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- render ---------- */

  return (
    <div id="top" className="min-h-screen bg-void font-body text-chrome">
      <Masthead
        mode={mode}
        onMode={switchMode}
        query={query}
        onQuery={setQuery}
        onSearch={search}
        recent={recent}
        onClearRecent={() => {
          setRecent([]);
          showToast("Recent searches cleared");
        }}
        inputRef={inputRef}
      />

      <StickyBar
        visible={scrolled}
        mode={mode}
        onMode={switchMode}
        query={query}
        onQuery={setQuery}
        onSearch={search}
        stickyRef={stickyRef}
      />

      <Results
        mode={mode}
        onMode={switchMode}
        loading={loading}
        error={error}
        query={active.q}
        page={page}
        total={total}
        books={books}
        articles={articles}
        filters={filters}
        onFilters={applyFilters}
        onPage={gotoPage}
        onRetry={() => run(mode, active.q, page, filters)}
        onReset={resetFilters}
        onToast={showToast}
      />

      <Info onToast={showToast} />

      {toast && (
        <div
          key={toast.id}
          role="status"
          className="animate-toast-in fixed bottom-6 right-6 z-[80] flex items-center gap-3 rounded-xl glass-strong px-4 py-3 text-sm font-semibold text-chrome-bright shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neon-lime/20 text-neon-lime">
            <IconCheck width={13} height={13} />
          </span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
