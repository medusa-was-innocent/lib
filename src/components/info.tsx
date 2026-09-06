import { useState } from "react";
import { Reveal } from "./reveal";
import { IconArrowRight, IconCheck, IconCopy, IconTerminal, LogoMark } from "./icons";

const STEPS = [
  {
    n: "01",
    title: "Type once, search everything",
    body: "One box queries Open Library's 20M+ book records or CrossRef's 150M+ article records — the same search-then-fetch flow as the original Streamlit script, rebuilt to run entirely in your browser.",
  },
  {
    n: "02",
    title: "Records are matched to real copies",
    body: "Book rows carry their Internet Archive identifiers; article rows resolve through Unpaywall to legal open-access PDFs. No dead links, no fake buttons.",
  },
  {
    n: "03",
    title: "Download from the source",
    body: "Every button opens the actual file page in a new tab: Archive.org readers and PDFs, OA papers, plus one-click jumps to Open Library, Anna's Archive, Google Books and the Z-Library portal.",
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
      onToast("Couldn't access the clipboard");
    }
  };

  return (
    <>
      <section id="how" className="noise relative overflow-hidden bg-ink-950 py-16 text-paper sm:py-20">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-royal/20 blur-[130px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[320px] w-[320px] rounded-full bg-acc/10 blur-[110px]" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-acc">How it works</p>
            <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-[2.6rem] sm:leading-[1.1]">
              From search box to <span className="italic text-acc">saved file</span> — three moves.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-14">
            {/* steps + sources */}
            <div>
              <ol className="space-y-8">
                {STEPS.map((s, i) => (
                  <Reveal key={s.n} delay={i * 110}>
                    <li className="group flex gap-5">
                      <span className="font-display text-4xl font-light italic text-acc/80 transition-colors group-hover:text-acc">
                        {s.n}
                      </span>
                      <div className="border-l border-ink-700 pl-5 transition-colors group-hover:border-acc/60">
                        <h3 className="text-lg font-bold text-paper">{s.title}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#9db2c7]">{s.body}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>

              <Reveal delay={140}>
                <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {SOURCES.map((s) => (
                    <a
                      key={s.name}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900/70 px-4 py-3.5 transition-all hover:-translate-y-1 hover:border-acc"
                    >
                      <span>
                        <span className="block font-display text-base font-semibold text-paper group-hover:text-acc">
                          {s.name}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-[#7f95ab]">
                          {s.stat}
                        </span>
                      </span>
                      <IconArrowRight
                        width={16}
                        height={16}
                        className="shrink-0 text-[#7f95ab] transition-all group-hover:translate-x-1 group-hover:text-acc"
                      />
                    </a>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* terminal */}
            <Reveal delay={120}>
              <div id="run" className="scroll-mt-24">
                <div className="overflow-hidden rounded-2xl border border-ink-700 bg-ink-900 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between border-b border-ink-700 bg-ink-950/80 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rust" />
                      <span className="h-3 w-3 rounded-full bg-acc" />
                      <span className="h-3 w-3 rounded-full bg-moss" />
                    </div>
                    <span className="flex items-center gap-2 font-mono text-[11px] text-[#7f95ab]">
                      <IconTerminal width={14} height={14} />
                      zLibrary — the original (Python + Streamlit)
                    </span>
                    <button
                      type="button"
                      onClick={copyAll}
                      className="flex items-center gap-1.5 rounded-md border border-ink-600 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#9db2c7] transition-all hover:border-acc hover:text-acc active:scale-95"
                    >
                      {copied ? <IconCheck width={12} height={12} className="text-moss" /> : <IconCopy width={12} height={12} />}
                      {copied ? "copied" : "copy"}
                    </button>
                  </div>
                  <div className="space-y-2.5 px-5 py-6 font-mono text-[13px] leading-relaxed">
                    {CMDS.map((c) => (
                      <p key={c} className="text-[#c6d4e2]">
                        <span className="mr-2 select-none text-acc">➜</span>
                        <span className="mr-2 select-none text-royal">~</span>
                        {c}
                      </p>
                    ))}
                    <p className="text-[#7f95ab]">
                      <span className="mr-2 select-none text-acc">➜</span>
                      <span className="text-moss">Streamlit server started on http://localhost:8501</span>
                      <span className="caret ml-1 inline-block h-4 w-2 translate-y-0.5 bg-acc" />
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl border border-ink-700/80 bg-ink-900/60 px-5 py-4">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-paper">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-acc-soft text-acc-deep">
                      <IconTerminal width={13} height={13} />
                    </span>
                    Why a browser rebuild?
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-[#9db2c7]">
                    The original script calls Z-Library's private API straight from Python. Browsers refuse those
                    calls (CORS) and the endpoints rotate constantly — which is why the repo “doesn't work” outside
                    its own machine. This edition searches stable public catalogs instead, and keeps a direct link
                    to the Z-Library portal inside every book's download menu.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-ink-950 py-8 text-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-5 sm:px-8 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                <span className="italic text-acc">z</span>Library <span className="text-[#7f95ab]">· web edition</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#7f95ab]">
                rebuilt in react — after Devanshu-17/zLibrary (python + streamlit)
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 md:items-end">
            <a
              href="https://github.com/Devanshu-17/zLibrary"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs text-[#9db2c7] underline decoration-ink-600 underline-offset-4 transition-colors hover:text-acc"
            >
              github.com/Devanshu-17/zLibrary
            </a>
            <p className="max-w-md text-right font-mono text-[10px] leading-relaxed text-[#5f7590]">
              catalog data © Open Library · CrossRef · Internet Archive. External links open in new tabs — please
              respect your local copyright law.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
