'use client';

import { TextArea } from "@/components/ui/TextArea";
import { ShareModal } from "@/components/ShareModal";
import { LoadingShimmer } from "@/components/ui/LoadingShimmer";
import { StoryCard } from "@/components/StoryCard";
import { Header } from "@/components/Header";
import { Showcase } from "@/components/Showcase";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { createPost } from "@/lib/api";
import type { CreatePostResult, Platform } from "@/lib/types";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const DEFAULT_PLATFORM: Platform = "whatsapp-status";

const FALLBACK_TERMS = [
  "I'm fine",
  "We need to talk",
  "It's complicated",
  "No worries",
  "Let's circle back",
  "Per my last email",
];

const FEATURE_ITEMS = [
  {
    title: "Instant decoder",
    description:
      "Tap a link to see the meaning, origin, and local context in one clean sheet.",
  },
  {
    title: "Share-ready cards",
    description:
      "Mobile-first story cards that look good anywhere—texts, socials, or decks.",
  },
  {
    title: "Context that travels",
    description:
      "Short links carry nuance across cultures so people hear what you meant.",
  },
];

const HERO_BADGES = [
  "Instant decode",
  "Mobile story cards",
  "Cultural nuance included",
];

function HomeContent() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("prefill") || "";
  const [text, setText] = useState(prefill);
  const [platform] = useState<Platform>(DEFAULT_PLATFORM);
  const [result, setResult] = useState<CreatePostResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [suggestedTerms, setSuggestedTerms] = useState<string[]>(FALLBACK_TERMS);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestedTerms(data.suggestions);
        }
      } catch {
        // Keep fallback terms
      }
    }
    fetchSuggestions();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) {
      return;
    }

    setStatus("loading");
    try {
      const response = await createPost({
        text: text.trim(),
        platform,
      });
      setResult(response);
      setStatus("ready");
      setShowShareModal(true);
    } catch (error) {
      console.error(error);
      setStatus("idle");
    }
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-0 h-64 w-64 rounded-full bg-[var(--electric-blue)]/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-48 h-72 w-72 rounded-full bg-[var(--neon-violet)]/12 blur-[100px]" />

      <Header />

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-5 pt-24 pb-12 lg:gap-20 lg:pt-28 lg:pb-16">
        <section className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <ScrollReveal animation="fade-up" delay={100}>
            <div className="grid gap-6 text-center lg:text-left">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Decode meaning
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-[var(--text-primary)] sm:text-5xl">
                Decode what they meant.
              </h1>
              <p className="text-lg text-[var(--text-secondary)] max-w-xl mx-auto lg:mx-0">
                Turn any sentence into a story card with a one-click explanation
                people actually understand.
              </p>
              <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                <a
                  href="#create"
                  className="rounded-full bg-[var(--electric-blue)] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-black/25 transition hover:bg-[#5b9eff]"
                >
                  Create your post
                </a>
                <a
                  href="#how"
                  className="hidden rounded-full border border-[var(--border-color)] px-5 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)] sm:inline-flex"
                >
                  See how decoding works
                </a>
              </div>
              <div className="hidden flex-wrap gap-3 text-sm text-[var(--text-secondary)] md:flex">
                {HERO_BADGES.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--card-bg)] px-4 py-2 ring-1 ring-[var(--border-color)]"
                  >
                    <span className="h-2 w-2 rounded-full bg-[var(--electric-blue)]" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-left" delay={300}>
            <div className="flex justify-center">
              <StoryCard
                text="My silence is loud, but some people only hear noise."
                slug="signal"
                keyword="silence"
                footer={
                  <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/80">
                    Context ready
                  </span>
                }
              />
            </div>
          </ScrollReveal>
        </section>

        <ScrollReveal animation="fade-up" delay={100}>
          <section
            id="create"
            className="grid gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-8"
          >
          <div className="grid gap-2 sm:flex sm:items-center sm:justify-between">
            <div className="grid gap-2">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                Creator
              </p>
              <h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
                Create your post
              </h2>
              <p className="text-base text-[var(--text-secondary)]">
                Drop in the words. We generate the story card and open a
                share-ready link for you.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--card-bg)] px-3 py-2 text-xs font-medium text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]">
              <span className="h-2 w-2 rounded-full bg-[var(--electric-blue)]" />
              Auto share modal when ready
            </div>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:p-5">
              <TextArea
                label="What do you want to post?"
                placeholder="Sometimes it's better to choose the red pill."
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={280}
                aria-label="Post text"
                suffix={
                  <div className="flex items-center gap-2 text-[var(--text-primary)]">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--electric-blue)] text-base font-semibold text-white shadow-md shadow-black/25 transition hover:bg-[#5b9eff] disabled:cursor-not-allowed disabled:opacity-60"
                      title="Generate card and link"
                    >
                      ↑
                    </button>
                  </div>
                }
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedTerms.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setText(term)}
                  className="px-3 py-1.5 text-sm rounded-full border border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {status === "loading" && (
              <div className="flex flex-col gap-3 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-4">
                <LoadingShimmer className="h-10 w-32" />
                <LoadingShimmer className="h-5 w-64" />
              </div>
            )}
            {status === "ready" && result && (
              <div className="text-sm text-[var(--text-secondary)]">
                Opening share options for{" "}
                <span className="text-[var(--text-primary)]">
                  {result.keyword || "your post"}
                </span>
                .
              </div>
            )}
          </form>
        </section>
        </ScrollReveal>

        {/* Divider */}
        <ScrollReveal animation="fade" delay={100}>
          <div className="w-full border-t border-[var(--electric-blue)]/50" />
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={200}>
          <Showcase />
        </ScrollReveal>

        <ScrollReveal animation="fade-up" delay={150}>
          <section
            id="how"
            className="grid gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]/70 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur sm:p-8"
          >
            <div className="grid gap-2">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              Decoder
            </p>
            <h3 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">
              Instantly understand the meaning.
            </h3>
            <p className="text-base text-[var(--text-secondary)]">
              Others tap your card to get a fast explanation, local examples,
              and cultural context.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURE_ITEMS.map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4"
              >
                <div className="text-sm uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                  {item.title}
                </div>
                <p className="mt-2 text-base leading-relaxed text-[var(--text-primary)]">
                  {item.description}
                </p>
              </div>
            ))}
            </div>
          </section>
        </ScrollReveal>
      </div>

      <Footer />

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        term={result?.keyword || text}
        shareUrl={result?.shareUrl || ""}
        cardUrl={result?.cardUrl}
      />
    </div>
  );
}

function HomeLoading() {
  return (
    <div className="relative isolate overflow-hidden">
      <Header />
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-5">
        <div className="animate-pulse text-[var(--text-secondary)]">Loading...</div>
      </div>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeLoading />}>
      <HomeContent />
    </Suspense>
  );
}
