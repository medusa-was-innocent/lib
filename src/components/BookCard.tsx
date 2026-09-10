import { useEffect, useRef, useState } from "react";
import type { Book } from "../lib/api";
import {
  annasUrl,
  archiveUrl,
  googleBooksUrl,
  googleSearchUrl,
  olUrl,
  searchSimilar,
  zLibraryUrl,
} from "../lib/api";
import {
  IconBook,
  IconChevron,
  IconCopy,
  IconDownload,
  IconExternal,
  IconFileDown,
  IconGlobe,
  IconSave,
  IconSearch,
  IconSparkle,
} from "./icons";
import { useReducedMotion } from "../lib/perf";
import { citeBook } from "../lib/api";

/* ---------- Cover with lazy loading + fallback ---------- */

function Cover({ book }: { book: Book }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImg = !!book.cover && !failed;

  return (
    <div className="book-shake relative h-[110px] w-[76px] shrink-0 overflow-hidden rounded-[4px] bg-void-4 ring-1 ring-white/10">
      {showImg ? (
        <img
          src={`https://covers.openlibrary.org/b/id/${book.cover}-S.jpg`}
          alt={`Cover of ${book.title}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`h-full w-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-gradient-to-br from-void-3 to-void-5">
          <span className="font-display text-3xl font-semibold neon-cyan">{book.title.charAt(0)}</span>
          <span className="px-1.5 text-center font-mono text-[7px] uppercase leading-tight tracking-wider text-chrome-dim">
            {book.title.slice(0, 30)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ---------- Download menu ---------- */

type MenuItem = { label: string; sub: string; href: string; icon: React.ReactNode };

function DownloadMenu({ book, open, setOpen }: { book: Book; open: boolean; setOpen: (o: boolean) => void }) {
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
      label: "Internet Archive",
      sub: `${book.ia[0]} · PDF · EPUB`,
      href: archiveUrl(book.ia[0]),
      icon: <IconFileDown width={14} height={14} />,
    });
  }
  items.push(
    {
      label: "Google Search",
      sub: "web results with author",
      href: googleSearchUrl(book),
      icon: <IconSearch width={14} height={14} />,
    },
    {
      label: "Google Books",
      sub: "preview & publisher links",
      href: googleBooksUrl(book),
      icon: <IconBook width={14} height={14} />,
    },
    {
      label: "Anna's Archive",
      sub: "shadow-library aggregator",
      href: annasUrl(book),
      icon: <IconGlobe width={14} height={14} />,
    },
    {
      label: "Z-Library",
      sub: "z-library.sk portal",
      href: zLibraryUrl(book),
      icon: <IconExternal width={14} height={14} />,
    },
    {
      label: "Open Library",
      sub: "borrow & preview editions",
      href: olUrl(book.id),
      icon: <IconBook width={14} height={14} />,
    }
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="btn-click flex items-center gap-2 rounded-lg bg-neon-lime px-3 py-1.5 text-xs font-bold text-void"
      >
        <IconDownload width={13} height={13} />
        {book.ia.length > 0 ? "Download" : "Sources"}
        <IconChevron width={11} height={11} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="animate-pop-in absolute left-0 top-full z-30 mt-2 w-[260px] max-w-[calc(100vw-2rem)] rounded-lg panel-strong p-1.5 sm:left-auto sm:right-0">
          {items.map((it) => (
            <a
              key={it.label}
              href={it.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              className="group/item flex items-start gap-2.5 rounded-md px-2.5 py-2 transition-colors hover:bg-white/5"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-void-4 text-chrome-dim">
                {it.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-chrome-bright group-hover/item:text-neon-cyan">
                  {it.label}
                </span>
                <span className="block truncate font-mono text-[9px] text-chrome-dim">{it.sub}</span>
              </span>
              <IconExternal width={11} height={11} className="ml-auto mt-1 shrink-0 text-chrome-dim opacity-0 transition-opacity group-hover/item:opacity-100" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Similar books section ---------- */

function SimilarBooks({ seed, onToast }: { seed: Book; onToast: (m: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const reduced = useReducedMotion();

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
            onToast("No similar books found");
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
        className="btn-click flex items-center gap-2 rounded-md border border-panel-border px-2.5 py-1 text-[11px] font-semibold text-chrome-dim transition-colors hover:border-neon-magenta hover:text-neon-magenta focus-ring"
      >
        <IconSparkle width={11} height={11} />
        {open ? "Hide similar" : "More Like This"}
        <IconChevron width={10} height={10} className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="similar-expand mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6" style={{ contentVisibility: "auto" }}>
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="skeleton h-[90px] w-full rounded" />
                <div className="skeleton h-2.5 w-3/4 rounded" />
                <div className="skeleton h-2 w-1/2 rounded" />
              </div>
            ))
          ) : books.length === 0 ? (
            <p className="col-span-full py-3 text-center font-mono text-[10px] text-chrome-dim">
              No similar books found for this seed.
            </p>
          ) : (
            books.map((b) => (
              <a
                key={b.id}
                href={olUrl(b.id)}
                target="_blank"
                rel="noreferrer"
                className="group/sim flex flex-col gap-1 rounded border border-panel-border p-1.5 transition-colors hover:border-neon-magenta focus-ring"
              >
                <div className="relative h-[90px] w-full overflow-hidden rounded bg-void-4">
                  {b.cover ? (
                    <img
                      src={`https://covers.openlibrary.org/b/id/${b.cover}-S.jpg`}
                      alt={b.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-void-3 to-void-5">
                      <span className="font-display text-xl font-semibold neon-magenta">{b.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-[10px] font-semibold leading-tight text-chrome-bright group-hover/sim:text-neon-magenta">
                  {b.title}
                </p>
                {b.authors[0] && (
                  <p className="truncate text-[9px] text-chrome-dim">{b.authors[0]}</p>
                )}
              </a>
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Main BookCard ---------- */

export function BookCard({
  book,
  index,
  onToast,
  isSaved,
  onToggleSave,
}: {
  book: Book;
  index: number;
  onToast: (m: string) => void;
  isSaved: boolean;
  onToggleSave: (b: Book) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();

  const copyCite = async () => {
    try {
      await navigator.clipboard.writeText(citeBook(book));
      onToast("Citation copied");
    } catch {
      onToast("Couldn't access clipboard");
    }
  };

  return (
    <li
      className="book-lift card-contain row-in group relative grid grid-cols-[76px_1fr] gap-4 rounded-lg border border-panel-border p-4 transition-colors hover:border-neon-cyan/40 sm:grid-cols-[76px_1fr_auto] sm:gap-5 sm:p-5 focus-within:border-neon-cyan/40"
      style={{ animationDelay: `${Math.min(index, 10) * 30}ms` }}
    >
      <Cover book={book} />
      <div className="min-w-0">
        <h3 className="font-display text-[16px] font-semibold leading-snug text-chrome-bright transition-colors group-hover:text-neon-cyan">
          {book.title}
        </h3>
        {book.authors.length > 0 && (
          <p className="mt-0.5 text-sm font-medium text-chrome-dim">{book.authors.slice(0, 4).join(", ")}</p>
        )}
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-chrome-dim/70">
          {book.year ? book.year : "date n.d."}
          {book.publisher ? ` · ${book.publisher}` : ""}
          {book.pages ? ` · ${book.pages} p.` : ""}
          {` · ${book.editions.toLocaleString()} editions`}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {book.ebook === "public" && (
            <span className="rounded bg-neon-lime/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-neon-lime">
              public-domain
            </span>
          )}
          {book.ebook === "borrowable" && (
            <span className="rounded bg-neon-cyan/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-neon-cyan">
              borrowable
            </span>
          )}
          {book.ia.length > 0 && (
            <span className="rounded bg-void-4 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wide text-chrome-dim">
              on archive.org
            </span>
          )}
        </div>

        <SimilarBooks seed={book} onToast={onToast} />
      </div>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1 sm:flex-col sm:items-end sm:justify-between">
        <DownloadMenu book={book} open={menuOpen} setOpen={setMenuOpen} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleSave(book)}
            title={isSaved ? "Remove from library" : "Save to library"}
            className={`btn-click flex h-8 w-8 items-center justify-center rounded border transition-colors focus-ring ${
              isSaved
                ? "border-neon-magenta bg-neon-magenta/10 text-neon-magenta"
                : "border-panel-border text-chrome-dim hover:border-neon-magenta hover:text-neon-magenta"
            }`}
          >
            <IconSave width={13} height={13} />
          </button>
          <button
            type="button"
            onClick={copyCite}
            title="Copy citation"
            className="btn-click flex h-8 w-8 items-center justify-center rounded border border-panel-border text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan focus-ring"
          >
            <IconCopy width={13} height={13} />
          </button>
        </div>
      </div>
    </li>
  );
}
