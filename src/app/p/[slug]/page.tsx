'use client';

import { createCard, fetchDecode } from "@/lib/api";
import { LoadingShimmer } from "@/components/ui/LoadingShimmer";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import type { DecodeResponse } from "@/lib/types";
import { useRouter } from "next/navigation";
import { use as usePromise, useEffect, useState } from "react";

// Highlight keyword in text with Neon Violet
function highlightKeyword(text: string, keyword: string): React.ReactNode {
  if (!keyword) return <>&ldquo;{text}&rdquo;</>;
  
  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);
  
  if (index === -1) return <>&ldquo;{text}&rdquo;</>;
  
  const before = text.slice(0, index);
  const match = text.slice(index, index + keyword.length);
  const after = text.slice(index + keyword.length);
  
  return (
    <>
      &ldquo;{before}
      <span style={{ color: '#8B5CFF' }}>{match}</span>
      {after}&rdquo;
    </>
  );
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

const avatarOptions = [
  { emoji: "🦊", bg: "#ff6b3d" },
  { emoji: "🐸", bg: "#4ade80" },
  { emoji: "🦉", bg: "#a78bfa" },
  { emoji: "🐻", bg: "#f59e0b" },
  { emoji: "🐰", bg: "#f472b6" },
  { emoji: "🦁", bg: "#fbbf24" },
];

function pickAvatar(slug: string) {
  const hash = slug.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return avatarOptions[hash % avatarOptions.length];
}

export default function DecodePage({ params }: PageProps) {
  const { slug } = usePromise(params);
  const router = useRouter();
  const [data, setData] = useState<DecodeResponse | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [createText, setCreateText] = useState("");
  const [shareStatus, setShareStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [shareMessage, setShareMessage] = useState("");
  const [expanded, setExpanded] = useState({
    base: true,
    context: false,
    local: false,
    history: false,
  });
  const avatar = pickAvatar(slug);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!mounted) return;
      setStatus("loading");
      try {
        const response = await fetchDecode(slug);
        if (mounted) {
          setData(response);
          setStatus("ready");
        }
      } catch (error) {
        console.error(error);
        if (mounted) {
          setStatus("error");
        }
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (status === "ready") {
      setExpanded({
        base: true,
        context: false,
        local: false,
        history: false,
      });
    }
  }, [status]);

  const meaning = data?.meaning;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleShare = async () => {
    setShareStatus("loading");
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: "MeanIn",
          text: "Check this out",
          url: shareUrl,
        });
        setShareMessage("Shared via native sheet.");
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage("Link copied to clipboard.");
      } else {
        setShareMessage(`Share link: ${shareUrl}`);
      }
      setShareStatus("done");
    } catch (error) {
      console.error(error);
      setShareMessage("Could not share. Try again.");
      setShareStatus("error");
    }
  };

  const toggleSection = (key: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="relative isolate min-h-screen">
      <Header />
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-5 pt-24 pb-12">
        <header className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Decode
            </p>
          </div>
        {status === "ready" && data && (
          <div className="flex items-center gap-4 rounded-2xl bg-[var(--card-bg)] px-4 py-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:px-6 sm:py-5">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl"
              style={{ backgroundColor: avatar.bg }}
            >
              <span className="select-none">{avatar.emoji}</span>
            </div>
            <div className="grid gap-1">
              <p className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                {highlightKeyword(data.post.text, data.post.keywordText)}
              </p>
            </div>
          </div>
        )}
      </header>

      {status === "error" && (
        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4 text-[var(--text-primary)]">
          {"We couldn't load that post. Try again or create your own."}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <section className="grid gap-4">
          {status === "loading" && <LoadingShimmer className="h-24" />}
          {status === "ready" && meaning && (
            <div className="overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
              <div className="grid gap-3 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSection("base")}
                    className="flex flex-1 items-center justify-between text-left"
                  >
                    <div className="text-sm font-semibold text-[var(--text-secondary)]">
                      What it means
                    </div>
                    <svg
                      className={`h-4 w-4 text-[var(--text-secondary)] transition-transform ${
                        expanded.base ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={shareStatus === "loading"}
                    title="Share this decode"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                  </button>
                </div>
                {expanded.base && (
                  <p className="text-xl font-medium leading-relaxed text-[var(--text-primary)] sm:text-2xl">
                    {meaning.baseMeaning}
                  </p>
                )}
              </div>

              {meaning.contextualMeaning && (
                <div className="border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => toggleSection("context")}
                    className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                  >
                    <div className="text-sm font-semibold text-[var(--text-secondary)]">
                      What they meant here
                    </div>
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
                  {expanded.context && (
                    <div className="px-4 pb-4 sm:px-5">
                      <p className="text-base leading-relaxed text-[var(--text-primary)]">
                        {meaning.contextualMeaning}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {(meaning.localContext || meaning.localExample) && (
                <div className="border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => toggleSection("local")}
                    className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                  >
                    <div className="text-sm font-semibold text-[var(--text-secondary)]">
                      Local context & usage
                    </div>
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
                  {expanded.local && (
                    <div className="grid gap-3 px-4 pb-4 sm:px-5">
                      {meaning.localContext && (
                        <div className="grid gap-1">
                          <div className="text-xs font-medium text-[var(--text-secondary)]">Local context</div>
                          <p className="text-base text-[var(--text-primary)]">{meaning.localContext}</p>
                        </div>
                      )}
                      {meaning.localExample && (
                        <div className="grid gap-1">
                          <div className="text-xs font-medium text-[var(--text-secondary)]">Example</div>
                          <p className="text-base italic text-[var(--text-primary)]">{meaning.localExample}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {meaning.origin && (
                <div className="border-t border-[var(--border-color)]">
                  <button
                    type="button"
                    onClick={() => toggleSection("history")}
                    className="flex w-full items-center justify-between px-4 py-4 text-left sm:px-5"
                  >
                    <div className="text-sm font-semibold text-[var(--text-secondary)]">
                      History, sources & usage
                    </div>
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
                  {expanded.history && (
                    <div className="px-4 pb-4 sm:px-5">
                      <p className="text-sm leading-relaxed text-[var(--text-primary)] sm:text-base">
                        {meaning.origin}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {meaning.relatedTerms && meaning.relatedTerms.length > 0 && (
                <div className="border-t border-[var(--border-color)] px-4 py-4 sm:px-5">
                  <div className="text-sm font-semibold text-[var(--text-secondary)]">Try these</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {meaning.relatedTerms.map((term) => (
                      <a
                        key={term}
                        href={`/?prefill=${encodeURIComponent(term)}`}
                        className="rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-sm text-[var(--text-secondary)] ring-1 ring-[var(--border-color)] transition hover:ring-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                        title={`Create a post with "${term}"`}
                      >
                        {term}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {shareMessage && (
          <div className="text-center text-sm text-[var(--text-secondary)]">
            {shareMessage}
          </div>
        )}

        <section className="grid gap-4 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
          <div className="text-sm uppercase tracking-[0.12em] text-[var(--text-secondary)]">
            Create your own
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={createText}
              onChange={(e) => setCreateText(e.target.value)}
              placeholder="What do you want to post?"
              className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)]"
            />
            <button
              type="button"
              onClick={() => router.push(`/?prefill=${encodeURIComponent(createText)}`)}
              className="rounded-lg bg-[var(--electric-blue)] px-5 py-3 font-medium text-white transition hover:bg-[#5b9eff]"
            >
              Go
            </button>
          </div>
        </section>
      </div>
      </div>

      <Footer />
    </div>
  );
}
