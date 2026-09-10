import type { Article, Book, BookFilters, Mode } from "../lib/api";
import {
  citeArticle,
  doiUrl,
  findOaPdf,
  LANGS,
} from "../lib/api";
import {
  IconAlert,
  IconArticle,
  IconChevron,
  IconCopy,
  IconDownload,
  IconExternal,
  IconFileDown,
  IconQuote,
  IconRefresh,
  IconSearch,
  IconSpinner,
} from "./icons";
import { ModeTabs } from "./masthead";
import { BookCard } from "./BookCard";
import { useState } from "react";

/* ---------- Article row ---------- */

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
      onToast("Open-access copy found");
      window.open(u, "_blank", "noopener");
    } else {
      setState("none");
      onToast("No OA copy — opening DOI");
      window.open(doiUrl(article.doi), "_blank", "noopener");
    }
  };

  const style =
    state === "found"
      ? "bg-neon-lime text-void"
      : state === "none"
        ? "border border-panel-border text-chrome-dim hover:border-neon-cyan hover:text-neon-cyan"
        : "bg-neon-cyan text-void";

  return (
    <button
      type="button"
      onClick={click}
      className={`btn-click flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-colors ${style}`}
    >
      {state === "loading" ? (
        <><IconSpinner width={12} height={12} /> Checking…</>
      ) : state === "found" ? (
        <><IconFileDown width={12} height={12} /> Open OA</>
      ) : state === "none" ? (
        <><IconExternal width={12} height={12} /> Open DOI</>
      ) : (
        <><IconDownload width={12} height={12} /> Find PDF</>
      )}
    </button>
  );
}

function ArticleRow({ article, index, onToast }: { article: Article; index: number; onToast: (m: string) => void }) {
  const copyCite = async () => {
    try {
      await navigator.clipboard.writeText(citeArticle(article));
      onToast("Citation copied");
    } catch {
      onToast("Couldn't access clipboard");
    }
  };

  return (
    <li
      className="row-in card-contain group grid grid-cols-1 gap-3 rounded-lg border border-panel-border p-4 transition-colors hover:border-neon-cyan/40 sm:grid-cols-[1fr_auto] sm:items-center sm:p-4"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-void-4 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-chrome-dim">
            {article.type ?? "work"}
          </span>
          {article.year && (
            <span className="rounded bg-neon-cyan/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-neon-cyan">
              {article.year}
            </span>
          )}
        </div>
        <h3 className="mt-1 font-display text-[15px] font-semibold leading-snug text-chrome-bright transition-colors group-hover:text-neon-cyan">
          {article.title}
        </h3>
        {article.authors.length > 0 && (
          <p className="mt-0.5 text-xs font-medium text-chrome-dim">
            {article.authors.slice(0, 5).join(", ")}
            {article.authors.length > 5 ? " et al." : ""}
          </p>
        )}
        <p className="mt-1 truncate font-mono text-[10px] text-chrome-dim/70">
          {article.journal ? <span className="italic">{article.journal}</span> : "source unknown"}
          <span className="text-white/10"> · </span>
          doi:{article.doi}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <PdfButton article={article} onToast={onToast} />
        <a
          href={doiUrl(article.doi)}
          target="_blank"
          rel="noreferrer"
          title="Open DOI"
          className="btn-click flex h-7 w-7 items-center justify-center rounded border border-panel-border text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan"
        >
          <IconExternal width={12} height={12} />
        </a>
        <button
          type="button"
          onClick={copyCite}
          title="Copy citation"
          className="btn-click flex h-7 w-7 items-center justify-center rounded border border-panel-border text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan"
        >
          <IconQuote width={12} height={12} />
        </button>
      </div>
    </li>
  );
}

/* ---------- Skeletons / empty / error ---------- */

function SkeletonRows() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="flex gap-4 rounded-lg border border-panel-border p-4">
          <div className="skeleton h-[110px] w-[76px] shrink-0 rounded" />
          <div className="flex-1 space-y-2.5 py-1">
            <div className="skeleton h-3.5 w-2/3 rounded" />
            <div className="skeleton h-2.5 w-1/3 rounded" />
            <div className="skeleton h-2.5 w-1/2 rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-panel-border text-chrome-dim">
        <IconSearch width={26} height={26} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-chrome-bright">
        Nothing found for "{query}"
      </h3>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-chrome-dim">
        Try fewer words, an author's surname, or drop the filters.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="btn-click mt-5 flex items-center gap-2 rounded-md bg-neon-cyan px-4 py-2 text-xs font-bold text-void"
      >
        <IconRefresh width={13} height={13} /> Clear filters
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neon-magenta/10 text-neon-magenta">
        <IconAlert width={28} height={28} />
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-chrome-bright">The catalog hiccuped</h3>
      <p className="mt-2 max-w-md font-mono text-[10px] text-chrome-dim">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="btn-click mt-5 flex items-center gap-2 rounded-md bg-neon-magenta px-4 py-2 text-xs font-bold text-void"
      >
        <IconRefresh width={13} height={13} /> Retry
      </button>
    </div>
  );
}

/* ---------- Pagination ---------- */

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  const from = Math.max(1, page - 2);
  const to = Math.min(pages, page + 2);
  const nums: number[] = [];
  for (let i = from; i <= to; i++) nums.push(i);

  const btn =
    "btn-click flex h-8 min-w-8 items-center justify-center rounded-md border border-panel-border px-2 font-mono text-[11px] font-semibold text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        ←
      </button>
      {from > 1 && (
        <>
          <button type="button" className={btn} onClick={() => onPage(1)}>1</button>
          {from > 2 && <span className="px-1 font-mono text-[10px] text-chrome-dim">…</span>}
        </>
      )}
      {nums.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          className={`btn-click flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-mono text-[11px] font-bold transition-colors ${
            n === page
              ? "bg-neon-cyan text-void"
              : "border border-panel-border text-chrome-dim hover:border-neon-cyan hover:text-neon-cyan"
          }`}
        >
          {n}
        </button>
      ))}
      {to < pages && (
        <>
          {to < pages - 1 && <span className="px-1 font-mono text-[10px] text-chrome-dim">…</span>}
          <button type="button" className={btn} onClick={() => onPage(pages)}>
            {pages > 999 ? "999+" : pages}
          </button>
        </>
      )}
      <button type="button" className={btn} disabled={page >= pages} onClick={() => onPage(page + 1)}>
        →
      </button>
    </div>
  );
}

/* ---------- Results section ---------- */

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
  isSaved,
  onToggleSave,
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
  isSaved: (id: string) => boolean;
  onToggleSave: (b: Book) => void;
}) {
  const per = mode === "books" ? 18 : 12;
  const pages = Math.max(1, Math.min(Math.ceil(total / per), 999));
  const filtersDirty = filters.lang !== "" || filters.sort !== "relevance" || filters.ebookOnly;

  const selectCls =
    "h-8 rounded-md border border-panel-border bg-void-2 px-2 font-mono text-[10px] font-semibold uppercase tracking-wide text-chrome-dim outline-none transition-colors hover:border-neon-cyan focus:border-neon-cyan";

  return (
    <section id="catalog" className="relative scroll-mt-16 bg-void-2 py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* Head */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">Catalog</p>
            <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-chrome-bright sm:text-3xl">
              {loading ? "Consulting the stacks…" : `Results for "${query}"`}
            </h2>
            <p className="mt-1 font-mono text-[10px] text-chrome-dim" aria-live="polite">
              {loading
                ? mode === "books"
                  ? "querying openlibrary.org"
                  : "querying api.crossref.org"
                : error
                  ? "request failed"
                  : `${total.toLocaleString()} records · page ${page} of ${pages}`}
            </p>
          </div>
          <ModeTabs mode={mode} onChange={onMode} />
        </div>

        {/* Filters */}
        {mode === "books" ? (
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg panel-strong px-3 py-2.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-chrome-dim">Refine</span>
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
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
            <label className="flex cursor-pointer select-none items-center gap-1.5 text-xs font-medium text-chrome-dim">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={filters.ebookOnly}
                onChange={(e) => onFilters({ ...filters, ebookOnly: e.target.checked })}
              />
              <span className="relative h-4 w-7 rounded-full bg-void-4 transition-colors peer-checked:bg-neon-lime after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-chrome-bright after:transition-transform peer-checked:after:translate-x-3" />
              Ebooks only
            </label>
            {filtersDirty && (
              <button
                type="button"
                onClick={onReset}
                className="ml-auto font-mono text-[10px] font-semibold uppercase tracking-wide text-neon-magenta transition-colors hover:text-[#ff33ee]"
              >
                reset ×
              </button>
            )}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center gap-2 rounded-lg panel-strong px-3 py-2.5 font-mono text-[10px] text-chrome-dim">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-neon-cyan/10 text-neon-cyan">
              <IconArticle width={11} height={11} />
            </span>
            metadata via <strong className="text-chrome-bright">CrossRef</strong>
            <span className="text-white/10">·</span>
            PDF via <strong className="text-chrome-bright">Unpaywall</strong>
          </div>
        )}

        {/* List */}
        <div className="mt-5 space-y-3">
          {loading ? (
            <SkeletonRows />
          ) : error ? (
            <ErrorState message={error} onRetry={onRetry} />
          ) : total === 0 ? (
            <EmptyState query={query} onReset={onReset} />
          ) : mode === "books" ? (
            <ul className="space-y-3">
              {books.map((b, i) => (
                <BookCard
                  key={`${b.id}-${page}-${i}`}
                  book={b}
                  index={i}
                  onToast={onToast}
                  isSaved={isSaved(b.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </ul>
          ) : (
            <ul className="space-y-3">
              {articles.map((a, i) => (
                <ArticleRow key={`${a.doi}-${i}`} article={a} index={i} onToast={onToast} />
              ))}
            </ul>
          )}
        </div>

        {!loading && !error && total > 0 && (
          <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.25em] text-chrome-dim">
            {mode === "books" ? "covers & records · open library" : "metadata · crossref / unpaywall"}
          </p>
        )}

        <Pagination page={page} pages={pages} onPage={onPage} />
      </div>
    </section>
  );
}
