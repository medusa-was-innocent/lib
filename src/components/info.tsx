import { useState } from "react";
import { Reveal } from "./reveal";
import { IconArrowRight, IconCheck, IconCopy, IconTerminal, LogoMark } from "./icons";

const STEPS = [
  {
    n: "01",
    title: "Type once, search everything",
    body: "One box queries Open Library's 20M+ book records or CrossRef's 150M+ article records — rebuilt to run entirely in your browser with debounced search and session caching.",
  },
  {
    n: "02",
    title: "Records matched to real copies",
    body: "Book rows carry Internet Archive identifiers; article rows resolve through Unpaywall to legal open-access PDFs. No dead links, no fake buttons.",
  },
  {
    n: "03",
    title: "Download from the source",
    body: "Every button opens the actual file page: Archive.org, Google Books, Anna's Archive, Z-Library, and Open Library. Author names are auto-appended to every query.",
  },
];

const SOURCES = [
  { name: "Open Library", stat: "20M+ books · covers & borrowing", url: "https://openlibrary.org" },
  { name: "CrossRef", stat: "150M+ article records · DOIs", url: "https://www.crossref.org" },
  { name: "Internet Archive", stat: "44M+ free texts · PDF / EPUB", url: "https://archive.org" },
  { name: "Unpaywall", stat: "open-access PDF resolver", url: "https://unpaywall.org" },
];

const CMDS = [
  "git clone https://github.com/Devanshu-17/zLibrary.git",
  "cd zLibrary",
  "pip install streamlit requests pandas",
  "streamlit run app.py",
];

export function Info({ onToast }: { onToast: (m: string) => void }) {
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(CMDS.join("\n"));
      setCopied(true);
      onToast("Terminal commands copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onToast("Couldn't access clipboard");
    }
  };

  return (
    <>
      <section id="how" className="relative overflow-hidden bg-void py-14 text-chrome sm:py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan">How it works</p>
            <h2 className="mt-2 max-w-2xl font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              From search box to <span className="text-holo">saved file</span> — three moves.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-12">
            <div>
              <ol className="space-y-6">
                {STEPS.map((s, i) => (
                  <Reveal key={s.n} delay={i * 100}>
                    <li className="group flex gap-4">
                      <span className="font-display text-3xl font-light italic text-neon-cyan/70 transition-colors group-hover:text-neon-cyan">
                        {s.n}
                      </span>
                      <div className="border-l border-white/10 pl-4 transition-colors group-hover:border-neon-cyan/40">
                        <h3 className="text-base font-bold text-chrome-bright">{s.title}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-chrome-dim">{s.body}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={120}>
                <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {SOURCES.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-click group flex items-center justify-between gap-2 rounded-lg border border-panel-border px-3 py-2.5 transition-colors hover:border-neon-cyan/40"
                    >
                      <span>
                        <span className="block font-display text-sm font-semibold text-chrome-bright group-hover:text-neon-cyan">
                          {s.name}
                        </span>
                        <span className="block font-mono text-[9px] uppercase tracking-wider text-chrome-dim">
                          {s.stat}
                        </span>
                      </span>
                      <IconArrowRight
                        width={14}
                        height={14}
                        className="shrink-0 text-chrome-dim transition-transform group-hover:translate-x-0.5 group-hover:text-neon-cyan"
                      />
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={100}>
              <div id="run" className="scroll-mt-24">
                <div className="overflow-hidden rounded-lg border border-panel-border bg-void-2">
                  <div className="flex items-center justify-between border-b border-white/5 bg-void-3 px-3 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-neon-magenta" />
                      <span className="h-2.5 w-2.5 rounded-full bg-neon-lime" />
                      <span className="h-2.5 w-2.5 rounded-full bg-neon-cyan" />
                    </div>
                    <span className="flex items-center gap-1.5 font-mono text-[10px] text-chrome-dim">
                      <IconTerminal width={12} height={12} />
                      zLibrary — the original
                    </span>
                    <button
                      type="button"
                      onClick={copyAll}
                      className="btn-click flex items-center gap-1 rounded border border-panel-border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-chrome-dim transition-colors hover:border-neon-cyan hover:text-neon-cyan"
                    >
                      {copied ? <IconCheck width={10} height={10} className="text-neon-lime" /> : <IconCopy width={10} height={10} />}
                      {copied ? "copied" : "copy"}
                    </button>
                  </div>
                  <div className="space-y-1.5 px-4 py-4 font-mono text-[12px] leading-relaxed">
                    {CMDS.map((c) => (
                      <p key={c} className="text-chrome">
                        <span className="mr-2 select-none neon-cyan">➜</span>
                        <span className="mr-2 select-none text-neon-magenta">~</span>
                        {c}
                      </p>
                    ))}
                    <p className="text-chrome-dim">
                      <span className="mr-2 select-none neon-cyan">➜</span>
                      <span className="text-neon-lime">Streamlit server started on http://localhost:8501</span>
                      <span className="caret ml-1 inline-block h-3 w-1.5 translate-y-0.5 bg-neon-cyan" />
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-panel-border px-4 py-3">
                  <h3 className="flex items-center gap-2 text-xs font-bold text-chrome-bright">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-neon-cyan/10 text-neon-cyan">
                      <IconTerminal width={11} height={11} />
                    </span>
                    Why a browser rebuild?
                  </h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-chrome-dim">
                    The original script calls Z-Library's private API from Python. Browsers refuse those
                    calls (CORS) and endpoints rotate constantly. This edition searches stable public catalogs
                    and keeps direct links to Z-Library, Anna's Archive, and Google Books in every download menu.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/5 bg-void py-6 text-chrome">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-5 sm:px-8 md:flex-row md:items-center">
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <div>
              <p className="font-display text-base font-semibold leading-tight">
                <span className="text-holo">Bibliothēkē</span> <span className="text-chrome-dim">· web edition</span>
              </p>
              <p className="font-mono text-[9px] uppercase tracking-wider text-chrome-dim">
                rebuilt in react — after Devanshu-17/zLibrary
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 md:items-end">
            <a
              href="https://github.com/Devanshu-17/zLibrary"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[11px] text-chrome-dim underline decoration-white/10 underline-offset-4 transition-colors hover:text-neon-cyan"
            >
              github.com/Devanshu-17/zLibrary
            </a>
            <p className="max-w-md text-right font-mono text-[9px] leading-relaxed text-chrome-dim/60">
              catalog data © Open Library · CrossRef · Internet Archive. External links open in new tabs.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
