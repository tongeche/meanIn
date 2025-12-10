'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";

type TemplateMeaning = {
  baseMeaning: string;
  contextualMeaning?: string;
  localContext?: string;
  localExample?: string;
  origin?: string;
  relatedTerms?: string[];
};

const sampleMeaning: TemplateMeaning = {
  baseMeaning: "“Per my last email” politely nudges someone to revisit what you already shared.",
  contextualMeaning: "A soft reminder to keep the thread on track without sounding harsh.",
  localContext: "Common in work chats to avoid repeating details.",
  localExample: "Per my last email, the deadline is Friday at noon.",
  origin: "A staple of corporate etiquette—efficient, but sometimes read as passive-aggressive.",
  relatedTerms: ["reminder", "follow-up", "work chat"],
};

export default function DecodeTemplatePage() {
  const [expanded, setExpanded] = useState({
    context: false,
    local: false,
    history: false,
  });
  const [animateText, setAnimateText] = useState(false);
  const [progress, setProgress] = useState({
    context: 0,
    local: 0,
    history: 0,
  });

  const sections = useMemo(
    () => ({
      context: sampleMeaning.contextualMeaning || "",
      local:
        (sampleMeaning.localContext || "") +
        (sampleMeaning.localExample ? ` ${sampleMeaning.localExample}` : ""),
      history: sampleMeaning.origin || "",
    }),
    [],
  );

  useEffect(() => {
    const targets = {
      context: sections.context.length,
      local: sections.local.length,
      history: sections.history.length,
    };

    if (!animateText) {
      setProgress(targets);
      return;
    }

    setProgress({ context: 0, local: 0, history: 0 });
    const step = 3;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = { ...prev };
        let done = true;
        (Object.keys(targets) as Array<keyof typeof targets>).forEach((key) => {
          const target = targets[key];
          if (target > 0 && next[key] < target) {
            next[key] = Math.min(target, next[key] + step);
            if (next[key] < target) done = false;
          }
        });
        if (done) clearInterval(interval);
        return next;
      });
    }, 18);

    return () => clearInterval(interval);
  }, [animateText, sections.context.length, sections.local.length, sections.history.length]);

  const animatedSlice = (key: keyof typeof progress, text?: string | null) => {
    if (!text) return "";
    if (!animateText) return text;
    return text.slice(0, progress[key]);
  };

  const toggleSection = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openSection = (key: keyof typeof expanded) => setExpanded((prev) => ({ ...prev, [key]: true }));
  const closeSection = (key: keyof typeof expanded) => setExpanded((prev) => ({ ...prev, [key]: false }));

  return (
    <div className="relative isolate min-h-screen">
      <Header />
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 pt-24 pb-12">
        <header className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              Template
            </div>
            <button
              type="button"
              onClick={() => setAnimateText((prev) => !prev)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                animateText
                  ? "border-[#5b9eff]/60 bg-[#5b9eff]/10 text-white"
                  : "border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-secondary)]"
              }`}
              title="Toggle typewriter animation"
            >
              <span className="text-sm">✴</span>
              Animate text
            </button>
          </div>
          <div className="flex items-center gap-4 rounded-2xl bg-[var(--card-bg)] px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:px-6 sm:py-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5b9eff]/15 text-2xl">
              <span className="select-none">🦉</span>
            </div>
            <div className="grid gap-1">
              <p className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                “Per my last email”
              </p>
            </div>
          </div>
        </header>

        <section className="grid gap-4">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <div className="grid gap-3 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-[var(--text-secondary)]">What it means</div>
              </div>
              <p className="text-xl font-medium leading-relaxed text-[var(--text-primary)] sm:text-2xl">
                {sampleMeaning.baseMeaning}
              </p>
            </div>

            {sampleMeaning.contextualMeaning && (
              <div className="border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => toggleSection("context")}
                  onMouseEnter={() => openSection("context")}
                  onMouseLeave={() => closeSection("context")}
                  className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                >
                  <div className="text-sm font-semibold text-[var(--text-secondary)]">What they meant here</div>
                  <svg
                    className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                      expanded.context ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expanded.context ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 pb-4 sm:px-5">
                    <p className="text-base leading-relaxed text-[var(--text-primary)]">
                      {animatedSlice("context", sampleMeaning.contextualMeaning)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(sampleMeaning.localContext || sampleMeaning.localExample) && (
              <div className="border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => toggleSection("local")}
                  onMouseEnter={() => openSection("local")}
                  onMouseLeave={() => closeSection("local")}
                  className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                >
                  <div className="text-sm font-semibold text-[var(--text-secondary)]">Local context & usage</div>
                  <svg
                    className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                      expanded.local ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expanded.local ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="grid gap-3 px-4 pb-4 sm:px-5">
                    {sampleMeaning.localContext && (
                      <div className="grid gap-1">
                        <div className="text-xs font-medium text-[var(--text-secondary)]">Local context</div>
                        <p className="text-base text-[var(--text-primary)]">
                          {animatedSlice("local", sampleMeaning.localContext)}
                        </p>
                      </div>
                    )}
                    {sampleMeaning.localExample && (
                      <div className="grid gap-1">
                        <div className="text-xs font-medium text-[var(--text-secondary)]">Example</div>
                        <p className="text-base italic text-[var(--text-primary)]">
                          {animatedSlice("local", sampleMeaning.localExample)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {sampleMeaning.origin && (
              <div className="border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => toggleSection("history")}
                  onMouseEnter={() => openSection("history")}
                  onMouseLeave={() => closeSection("history")}
                  className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                >
                  <div className="text-sm font-semibold text-[var(--text-secondary)]">History, sources & usage</div>
                  <svg
                    className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                      expanded.history ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    expanded.history ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-4 pb-4 sm:px-5">
                    <p className="text-sm leading-relaxed text-[var(--text-primary)] sm:text-base">
                      {animatedSlice("history", sampleMeaning.origin)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {sampleMeaning.relatedTerms && sampleMeaning.relatedTerms.length > 0 && (
              <div className="border-t border-[var(--border-color)] px-4 py-4 sm:px-5">
                <div className="text-sm font-semibold text-[var(--text-secondary)]">Try these</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sampleMeaning.relatedTerms.map((term) => (
                    <button
                      key={term}
                      className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-secondary)] ring-1 ring-[var(--border-color)] transition hover:ring-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
