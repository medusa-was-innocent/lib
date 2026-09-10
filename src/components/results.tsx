import { useEffect, useRef, useState } from "react";
import type { Article, Book, BookFilters, Mode } from "../lib/api";
import {
  annasUrl,
  archiveUrl,
  citeArticle,
  citeBook,
  doiUrl,
  findOaPdf,
  googleBooksUrl,
  googleSearchUrl,
  LANGS,
  langName,
  olUrl,
  searchSimilar,
  zLibraryUrl,
} from "../lib/api";
import {
  IconAlert,
  IconArticle,
  IconBook,
  IconChevron,
  IconCopy,
  IconDownload,
  IconExternal,
  IconFileDown,
  IconGlobe,
  IconQuote,
  IconRefresh,
  IconSearch,
  IconSparkle,
  IconSpinner,
  LogoMark,
} from "./icons";
import { ModeTabs } from "./masthead";

/* ------------------------------------------------------------------ */
/*  Cover with graceful fallback                                       */
/* ------------------------------------------------------------------ */

function Cover({ book }: { book: Book }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImg = !!book.cover && !failed;
  return (
    <div className="relative h-[104px] w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-ink-800 shadow-[3px_5px_0_rgba(12,31,49,0.16)] ring-1 ring-black/10">
      {showImg ? (
        <img
          src={`https://covers.openlibrary.org/b/id/${book.cover}-M.jpg`}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-ink-700 to-ink-950">
          <span className="font-display text-3xl font-semibold text-acc">{book.title.charAt(0)}</span>
          <span className="px-1.5 text-center font-mono text-[7px] uppercase leading-tight tracking-wider text-paper/60">
            {book.title.slice(0, 30)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Download source menu (per book) — Y2K chrome style                 */
/* ------------------------------------------------------------------ */

type MenuItem = { label: string; sub: string; href: string; icon: React.ReactNode };

function DownloadMenu({
  book,
  open,
  setOpen,
}: {
  book: Book;
  open: boolean;
  setOpen: (o: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const items: MenuItem[] = [];
  if (book.ia.length > 0) {
    items.push({
      label: "Internet Archive — read / download",
      sub: `${book.ia[0]} · PDF · EPUB · borrow`,
      href: archiveUrl(book.ia[0]),
      icon: <IconFileDown width={15} height={15} />,
    });
  }
  items.push(
    {
      label: "Google Search",
      sub: "web results with author",
      href: googleSearchUrl(book),
      icon: <IconSearch width={15} height={15} />,
    },
    {
      label: "Google Books",
      sub: "preview & publisher links",
      href: googleBooksUrl(book),
      icon: <IconBook width={15} height={15} />,
    },
    {
      label: "Anna's Archive",
      sub: "shadow-library aggregator",
      href: annasUrl(book),
      icon: <IconGlobe width={15} height={15} />,
    },
    {
      label: "Z-Library",
      sub: "z-library.sk — official portal",
      href: zLibraryUrl(book),
      icon: <LogoMark size={15} />,
    },
    {
      label: "Open Library record",
      sub: "borrow & preview editions",
      href: olUrl(book.id),
      icon: <IconBook width={15} height={15} />,
    }
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-click flex items-center gap-2 rounded-lg bg-moss px-4 py-2 text-sm font-bold text-white shadow-[0_4px_14px_rgba(47,158,99,0.35)] transition-all hover:bg-[#278a55] active:scale-95"
      >
        <IconDownload width={15} height={15} />
        {book.ia.length > 0 ? "Download" : "Sources"}
        <IconChevron width={13} height={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="animate-pop-in absolute left-0 top-full z-30 mt-2 w-[272px] max-w-[calc(100vw-2.5rem)] rounded-xl border border-line bg-card p-1.5 shadow-[0_18px_50px_rgba(12,31,49,0.22)] sm:left-auto sm:right-0">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="group/item flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-royal-soft/60"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-royal-soft text-royal">
                {it.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold text-ink-900 group-hover/item:text-royal-deep">
                  {it.label}
                </span>
                <span className="block truncate font-mono text-[10px] text-faint">{it.sub}</span>
              </span>
              <IconExternal width={13} height={13} className="ml-auto mt-1 shrink-0 text-faint opacity-0 transition-opacity group-hover/item:opacity-100" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Similar Books section (expandable per book)                        */
/* ------------------------------------------------------------------ */

function SimilarBooks({ seed, onToast }: { seed: Book; onToast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const toggle = async () => {
    if (!open) {
      setOpen(true);
      if (books.length === 0) {
        setLoading(true);
        abortRef.current?.abort();
        const ctl = new AbortController();
        abortRef.current = ctl;
        try {
          const similar = await searchSimilar(seed, ctl.signal);
          setBooks(similar);
          if (similar.length === 0) {
            onToast("No similar books found — try another seed");
          }
        } catch {
          /* ignore abort */
        } finally {
          setLoading(false);
        }
      }
    } else {
      setOpen(false);
    }
  };

  return (
    <div className="mt-3 border-t border-white/5 pt-3">
      <button
        type="button"
        onClick={toggle}
        className="btn-click flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-xs font-semibold text-faint transition-all hover:border-acc hover:text-acc-deep"
      >
        <IconSparkle width={13} height={13} />
        {open ? "Hide similar books" : "More Like This"}
        <IconChevron width={12} height={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="similar-expand mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="skeleton h-[100px] w-full rounded-lg" />
                <div className="skeleton h-3 w-3/4 rounded" />
                <div className="skeleton h-2.5 w-1/2 rounded" />
              </div>
            ))
          ) : books.length === 0 ? (
            <p className="col-span-full py-4 text-center font-mono text-xs text-chrome-dim">
              No similar books found for this seed.
            </p>
          ) : (
            books.map((b) => (
              <a
                key={b.id}
                href={olUrl(b.id)}
                target="_blank"
                rel="noreferrer"
                className="card-lift group/sim flex flex-col gap-1.5 rounded-lg border border-line bg-card p-2 transition-all hover:border-acc hover:shadow-[0_8px_20px_rgba(240,163,47,0.15)]"
              >
                <div className="relative h-[100px] w-full overflow-hidden rounded bg-ink-800">
                  {b.cover ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${b.cover}-M.jpg`}
                      alt={b.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/sim:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-700 to-ink-950">
                      <span className="font-display text-2xl font-semibold text-acc">{b.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-ink-900 group-hover/sim:text-royal-deep">
                  {b.title}
                </p>
                {b.authors[0] && (
                  <p className="truncate text-[10px] text-faint">{b.authors[0]}</p>
                )}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Book row                                                           */
/* ------------------------------------------------------------------ */

function BookRow({ book, index, onToast }: { book: Book; index: number; onToast: (m: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const copyCite = async () => {
    try {
      await navigator.clipboard.writeText(citeBook(book));
      onToast("Citation copied to clipboard");
    } catch {
      onToast("Couldn't access the clipboard");
    }
  };

  return (
    <li
      className={`row-in group relative grid grid-cols-[72px_1fr] gap-4 p-4 transition-colors duration-200 first:rounded-t-[14px] last:rounded-b-[14px] hover:bg-royal-soft/40 sm:grid-cols-[72px_1fr_auto] sm:gap-5 sm:p-5 ${
        menuOpen ? "z-20 bg-royal-soft/40" : ""
      }`}
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <Cover book={book} />
      <div className="min-w-0">
        <h3 className="font-display text-[17px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-royal-deep">
          {book.title}
        </h3>
        {book.authors.length > 0 && (
          <p className="mt-0.5 text-sm font-medium text-body">{book.authors.slice(0, 4).join(", ")}</p>
        )}
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-faint">
          {book.year ? book.year : "date n.d."}
          {book.publisher ? ` · ${book.publisher}` : ""}
          {book.pages ? ` · ${book.pages} p.` : ""}
          {` · ${book.editions.toLocaleString()} editions`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {book.ebook === "public" && (
            <span className="rounded-md bg-moss-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-moss">
              public-domain ebook
            </span>
          )}
          {book.ebook === "borrowable" && (
            <span className="rounded-md bg-royal-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-royal">
              borrowable ebook
            </span>
          )}
          {book.ia.length > 0 && (
            <span className="rounded-md bg-ink-900/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-600">
              on internet archive
            </span>
          )}
          {book.langs.slice(0, 2).map((l) => (
            <span key={l} className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-faint">
              {langName(l)}
            </span>
          ))}
        </div>

        {/* Similar Books */}
        <SimilarBooks seed={book} onToast={onToast} />
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between">
        <DownloadMenu book={book} open={menuOpen} setOpen={setMenuOpen} />
        <button
          type="button"
          onClick={copyCite}
          title="Copy citation"
          className="btn-click flex h-9 w-9 items-center justify-center rounded-lg border border-line text-faint transition-all hover:border-royal hover:text-royal active:scale-90"
        >
          <IconCopy width={15} height={15} />
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Article row with live Unpaywall PDF lookup                         */
/* ------------------------------------------------------------------ */

function PdfButton({ article, onToast }: { article: Article; onToast: (m: string) => void }) {
  const [state, setState] = useState<"idle" | "loading" | "found" | "none">("idle");
  const [url, setUrl] = useState<string | null>(null);

  const click = async () => {
    if (state === "loading") return;
    if (state === "found" && url) {
      window.open(url, "_blank", "noopener");
      return;
    }
    if (state === "none") {
      window.open(doiUrl(article.doi), "_blank", "noopener");
      return;
    }
    setState("loading");
    const u = await findOaPdf(article.doi);
    if (u) {
      setUrl(u);
      setState("found");
      onToast("Open-access copy found — opening it");
      window.open(u, "_blank", "noopener");
    } else {
      setState("none");
      onToast("No open-access copy — opening the DOI page");
      window.open(doiUrl(article.doi), "_blank", "noopener");
    }
  };

  const style =
    state === "found"
      ? "bg-moss text-white shadow-[0_4px_14px_rgba(47,158,99,0.35)] hover:bg-[#278a55]"
      : state === "none"
        ? "border border-line text-faint hover:border-royal hover:text-royal"
        : "bg-acc text-ink-950 shadow-[0_4px_14px_rgba(240,163,47,0.35)] hover:bg-[#ffbd52]";

  return (
    <button
      type="button"
      onClick={click}
      className={`btn-click flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors ${style}`}
    >
      {state === "loading" ? (
        <>
          <IconSpinner width={15} height={15} /> Checking Unpaywall…
        </>
      ) : state === "found" ? (
        <>
          <IconFileDown width={15} height={15} /> Open OA copy
        </>
      ) : state === "none" ? (
        <>
          <IconExternal width={15} height={15} /> No OA — open DOI
        </>
      ) : (
        <>
          <IconDownload width={15} height={15} /> Find PDF
        </>
      )}
    </button>
  );
}

function ArticleRow({
  article,
  index,
  onToast,
}: {
  article: Article;
  index: number;
  onToast: (m: string) => void;
}) {
  const copyCite = async () => {
    try {
      await navigator.clipboard.writeText(citeArticle(article));
      onToast("Citation copied to clipboard");
    } catch {
      onToast("Couldn't access the clipboard");
    }
  };

  return (
    <li
      className="row-in group grid grid-cols-1 gap-4 p-4 transition-colors duration-200 first:rounded-t-[14px] last:rounded-b-[14px] hover:bg-royal-soft/40 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5"
      style={{ animationDelay: `${Math.min(index, 10) * 45}ms` }}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-md bg-ink-900/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-ink-600">
            {article.type ?? "work"}
          </span>
          {article.year && (
            <span className="rounded-md bg-acc-soft px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-acc-deep">
              {article.year}
            </span>
          )}
        </div>
        <h3 className="mt-1.5 font-display text-[16px] font-semibold leading-snug text-ink-900 transition-colors group-hover:text-royal-deep">
          {article.title}
        </h3>
        {article.authors.length > 0 && (
          <p className="mt-0.5 text-sm font-medium text-body">
            {article.authors.slice(0, 5).join(", ")}
            {article.authors.length > 5 ? " et al." : ""}
          </p>
        )}
        <p className="mt-1.5 truncate font-mono text-[11px] text-faint">
          {article.journal ? <span className="italic">{article.journal}</span> : "source unknown"}
          <span className="text-line"> · </span>
          doi:{article.doi}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <PdfButton article={article} onToast={onToast} />
        <a
          href={doiUrl(article.doi)}
          target="_blank"
          rel="noreferrer"
          title="Open DOI landing page"
          className="btn-click flex h-9 w-9 items-center justify-center rounded-lg border border-line text-faint transition-all hover:border-royal hover:text-royal active:scale-90"
        >
          <IconExternal width={15} height={15} />
        </a>
        <button
          type="button"
          onClick={copyCite}
          title="Copy citation"
          className="btn-click flex h-9 w-9 items-center justify-center rounded-lg border border-line text-faint transition-all hover:border-royal hover:text-royal active:scale-90"
        >
          <IconQuote width={15} height={15} />
        </button>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/*  Skeletons / empty / error                                          */
/* ------------------------------------------------------------------ */

function SkeletonRows() {
  return (
    <ul className="divide-y divide-line">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-5 p-5">
          <div className="skeleton h-[104px] w-[72px] shrink-0 rounded-[4px]" />
          <div className="flex-1 space-y-3 py-1">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
            <div className="flex gap-2 pt-1">
              <div className="skeleton h-5 w-24 rounded-md" />
              <div className="skeleton h-5 w-16 rounded-md" />
            </div>
          </div>
          <div className="skeleton hidden h-9 w-28 rounded-lg sm:block" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-line text-faint">
        <IconSearch width={30} height={30} />
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-ink-900">
        Nothing on the shelves for "{query}"
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-faint">
        Try fewer words, an author's surname, or drop the filters — the catalog is big but not infinite.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="btn-click mt-6 flex items-center gap-2 rounded-lg bg-ink-900 px-5 py-2.5 text-sm font-bold text-paper transition-all hover:-translate-y-0.5 hover:bg-ink-800 active:scale-95"
      >
        <IconRefresh width={15} height={15} /> Clear filters & retry
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rust-soft text-rust">
        <IconAlert width={32} height={32} />
      </div>
      <h3 className="mt-5 font-display text-2xl font-semibold text-ink-900">The catalog hiccuped</h3>
      <p className="mt-2 max-w-md font-mono text-xs text-faint">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-click mt-6 flex items-center gap-2 rounded-lg bg-rust px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#a94e2b] active:scale-95"
      >
        <IconRefresh width={15} height={15} /> Retry search
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Pagination                                                         */
/* ------------------------------------------------------------------ */

function Pagination({
  page,
  pages,
  onPage,
}: {
  page: number;
  pages: number;
  onPage: (p: number) => void;
}) {
  if (pages <= 1) return null;
  const from = Math.max(1, page - 2);
  const to = Math.min(pages, page + 2);
  const nums: number[] = [];
  for (let i = from; i <= to; i++) nums.push(i);

  const btn =
    "btn-click flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-card px-2 font-mono text-xs font-semibold text-body transition-all hover:-translate-y-0.5 hover:border-royal hover:text-royal disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ← prev
      </button>
      {from > 1 && (
        <>
          <button type="button" className={btn} onClick={() => onPage(1)}>1</button>
          {from > 2 && <span className="px-1 font-mono text-xs text-chrome-dim">…</span>}
        </>
      )}
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          className={`btn-click flex h-9 min-w-9 items-center justify-center rounded-lg px-2 font-mono text-xs font-bold transition-all ${
            n === page
              ? "bg-ink-900 text-acc shadow-[0_4px_14px_rgba(12,31,49,0.3)]"
              : "border border-line bg-card text-body hover:-translate-y-0.5 hover:border-royal hover:text-royal"
          }`}
        >
          {n}
        </button>
      ))}
      {to < pages && (
        <>
          {to < pages - 1 && <span className="px-1 font-mono text-xs text-chrome-dim">…</span>}
          <button type="button" className={btn} onClick={() => onPage(pages)}>
            {pages.toLocaleString()}
          </button>
        </>
      )}
      <button type="button" className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>
        next →
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Results section                                                    */
/* ------------------------------------------------------------------ */

export function Results({
  mode,
  onMode,
  loading,
  error,
  query,
  page,
  total,
  books,
  articles,
  filters,
  onFilters,
  onPage,
  onRetry,
  onReset,
  onToast,
}: {
  mode: Mode;
  onMode: (m: Mode) => void;
  loading: boolean;
  error: string | null;
  query: string;
  page: number;
  total: number;
  books: Book[];
  articles: Article[];
  filters: BookFilters;
  onFilters: (f: BookFilters) => void;
  onPage: (p: number) => void;
  onRetry: () => void;
  onReset: () => void;
  onToast: (m: string) => void;
}) {
  const per = mode === "books" ? 18 : 12;
  const pages = Math.max(1, Math.min(Math.ceil(total / per), 999));
  const filtersDirty = filters.lang !== "" || filters.sort !== "relevance" || filters.ebookOnly;

  const selectCls =
    "h-9 rounded-lg border border-line bg-card px-2.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-body outline-none transition-colors hover:border-royal focus:border-royal";

  return (
    <section id="catalog" className="relative scroll-mt-16 bg-paper py-14 sm:py-16">
      <div className="pointer-events-none absolute inset-0 halftone opacity-50" />
      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        {/* head */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-royal">Catalog</p>
          <h2 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            {loading ? "Consulting the stacks…" : `Results for "${query}"`}
          </h2>
          <p className="mt-1.5 font-mono text-xs text-faint" aria-live="polite">              {loading
                ? mode === "books"
                  ? "querying openlibrary.org"
                  : "querying api.crossref.org"
                : error
                  ? "request failed"
                  : `${total.toLocaleString()} records · page ${page.toLocaleString()} of ${pages.toLocaleString()}`}
            </p>
          </div>
          <ModeTabs mode={mode} onChange={onMode} />
        </div>

        {/* filters / meta strip */}
        {mode === "books" ? (
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-xl border border-line bg-card px-4 py-3 shadow-sm">
            <span className="font-mono text-[10px] uppercase tracking-widest text-faint">Refine</span>
            <select
              aria-label="Sort results"
              className={selectCls}
              value={filters.sort}
              onChange={(e) => onFilters({ ...filters, sort: e.target.value as BookFilters["sort"] })}
            >
              <option value="relevance">Best match</option>
              <option value="editions">Most editions</option>
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
              <option value="rating">Top rated</option>
            </select>
            <select
              aria-label="Language"
              className={selectCls}
              value={filters.lang}
              onChange={(e) => onFilters({ ...filters, lang: e.target.value })}
            >
              <option value="">Any language</option>
              {Object.entries(LANGS).map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-body">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={filters.ebookOnly}
                onChange={(e) => onFilters({ ...filters, ebookOnly: e.target.checked })}
              />
              <span className="relative h-5 w-9 rounded-full bg-line transition-colors peer-checked:bg-moss peer-focus-visible:ring-2 peer-focus-visible:ring-royal after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
              Only with ebooks
            </label>
            {filtersDirty && (
              <button
                type="button"
                onClick={onReset}
                className="ml-auto font-mono text-[11px] font-semibold uppercase tracking-wide text-rust transition-colors hover:text-[#a94e2b]"
              >
                reset ×
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-line bg-card px-4 py-3 font-mono text-[11px] text-faint shadow-sm">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-acc-soft text-acc-deep">
              <IconArticle width={13} height={13} />
            </span>
            metadata via <strong className="text-body">CrossRef</strong>
            <span className="text-line">·</span>
            "Find PDF" resolves open-access copies through <strong className="text-body">Unpaywall</strong>
            <span className="text-line">·</span>
            every DOI opens its publisher page
          </div>
        )}

        {/* list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-card shadow-[0_10px_40px_rgba(12,31,49,0.07)]">
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : total === 0 ? (
            <EmptyState query={query} onReset={onReset} />
          ) : mode === "books" ? (
            <ul className="divide-y divide-line">
              {books.map((b, i) => (
                <BookRow key={`${b.id}-${page}-${i}`} book={b} index={i} onToast={onToast} />
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-line">
              {articles.map((a, i) => (
                <ArticleRow key={`${a.doi}-${i}`} article={a} index={i} onToast={onToast} />
              ))}
            </ul>
          )}
        </div>

        {!loading && !error && total > 0 && (
          <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-faint">
            {mode === "books"
              ? "covers & records · open library"
              : "scholarly metadata · crossref / unpaywall"}
          </p>
        )}

        <Pagination page={page} pages={pages} onPage={onPage} />
      </div>
    </section>
  );
}
