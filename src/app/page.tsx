'use client';

import { TextArea } from "@/components/ui/TextArea";
import { ShareModal } from "@/components/ShareModal";
import { LoadingShimmer } from "@/components/ui/LoadingShimmer";
import { Header } from "@/components/Header";
import { Showcase } from "@/components/Showcase";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { createPost } from "@/lib/api";
import type { CreatePostResult, Platform } from "@/lib/types";
import Image from "next/image";
import { useState, useEffect, Suspense, useRef } from "react";
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

const PRODUCT_FEATURES = [
  {
    title: "Creator",
    subtitle: "Work management",
    copy: "Drive projects forward with smart-picked story cards.",
    accent: "from-[#5b9eff] via-[#7aa8ff] to-[#a479ff]",
  },
  {
    title: "Decode",
    subtitle: "Signal clarity",
    copy: "Explain any line with instant, localized context.",
    accent: "from-[#58f0c8] via-[#5b9eff] to-[#a479ff]",
  },
  {
    title: "CRM",
    subtitle: "Audience ready",
    copy: "Automate follow-ups with ready-to-share meanings.",
    accent: "from-[#f58529] via-[#dd2a7b] to-[#8134af]",
  },
  {
    title: "Service",
    subtitle: "Assist & reply",
    copy: "Resolve nuance questions with guided responses.",
    accent: "from-[#25f4ee] via-[#5b9eff] to-[#a479ff]",
  },
];

const HERO_TABS = [
  { label: "Projects", badge: "New" },
  { label: "Marketing" },
  { label: "Sales" },
  { label: "Operations" },
  { label: "Product" },
  { label: "Support" },
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
  const [showCreator, setShowCreator] = useState(false);
  const placeholderMessage = "Sometimes it's better to choose the red pill.";
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const createRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setTypedPlaceholder(placeholderMessage.slice(0, index));
      index = (index + 1) % (placeholderMessage.length + 12); // extra ticks for pause
    }, 110);
    return () => clearInterval(interval);
  }, [placeholderMessage]);

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

  useEffect(() => {
    const startParam = searchParams.get("start");
    if (startParam === "create") {
      setShowCreator(true);
      setTimeout(() => createRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, [searchParams]);

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

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-14 px-5 pt-20 pb-12 lg:gap-20 lg:pt-24 lg:pb-16">
        {/* Hero */}
        {!showCreator && (
          <ScrollReveal animation="fade-up" delay={80} className="order-0">
            <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10">
              <div className="pointer-events-none absolute -left-6 -top-10 h-24 w-24 rounded-full bg-[var(--electric-blue)]/30 blur-3xl" />
              <div className="pointer-events-none absolute right-0 bottom-0 h-32 w-32 rounded-full bg-[var(--neon-violet)]/25 blur-[80px]" />

              <div className="relative flex flex-col items-center gap-10 text-center">
                <div className="space-y-6 max-w-3xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                    <span className="h-2 w-2 rounded-full bg-[#5b9eff]" />
                    Meaning platform
                  </div>
                  <div className="space-y-3">
                    <h1 className="text-3xl leading-tight text-[var(--text-primary)] sm:text-4xl lg:text-[2.8rem] lg:leading-[1.1] font-semibold">
                      From decoding words to doing the work for you
                    </h1>
                    <p className="text-base text-[var(--text-secondary)]">
                      Agentic tools that turn everyday phrases into ready-to-share stories, actions, and follow-ups.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      className="rounded-full bg-gradient-to-r from-[#5b9eff] via-[#7aa8ff] to-[#a479ff] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(0,0,0,0.28)] transition hover:shadow-[0_16px_40px_rgba(0,0,0,0.32)]"
                      onClick={() => {
                        setShowCreator(true);
                        setTimeout(() => createRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
                      }}
                    >
                      Get started
                    </button>
                    <button className="rounded-full border border-[var(--border-color)] bg-[var(--card-bg)]/60 px-5 py-3 text-sm font-semibold text-[var(--text-primary)] backdrop-blur hover:border-white/30">
                      See a demo
                    </button>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-xs text-[var(--text-secondary)]">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <span
                          key={i}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--bg-primary)] bg-gradient-to-br from-[#5b9eff] to-[#a479ff] text-[11px] font-semibold text-white"
                        >
                          {i}
                        </span>
                      ))}
                    </div>
                    <span>3K+ phrases decoded</span>
                  </div>
                </div>

              </div>
            </section>
          </ScrollReveal>
        )}

        {showCreator && (
          <ScrollReveal animation="fade-up" delay={100} className="order-1 lg:order-1">
            <section
              ref={createRef}
              id="create"
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#5b9eff33] via-[#a479ff44] to-[#58f0c833] p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.32)]"
            >
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-[#5b9eff22] via-[#a479ff22] to-[#58f0c822]" />
              <span className="pointer-events-none absolute -top-2 -left-2 h-3 w-3 rounded-full bg-gradient-to-r from-[#5b9eff] to-[#a479ff] blur-[1px] animate-pulse" />
              <span className="pointer-events-none absolute -top-2 -right-2 h-3 w-3 rounded-full bg-gradient-to-r from-[#58f0c8] to-[#5b9eff] blur-[1px] animate-pulse" />
              <span className="pointer-events-none absolute -bottom-2 -left-1 h-3 w-3 rounded-full bg-gradient-to-r from-[#a479ff] to-[#5b9eff] blur-[1px] animate-pulse" />
              <span className="pointer-events-none absolute -bottom-2 -right-1 h-3 w-3 rounded-full bg-gradient-to-r from-[#5b9eff] to-[#58f0c8] blur-[1px] animate-pulse" />
              <div className="relative grid gap-6 rounded-[14px] bg-[var(--bg-primary)]/85 p-6 backdrop-blur sm:p-8">
                <div className="grid gap-2">
                  <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">Creator</p>
                  <h2 className="text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">Create your post</h2>
                  <p className="text-base text-[var(--text-secondary)]">
                    Drop in the words. We generate the story card and open a share-ready link for you.
                  </p>
                </div>

                <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                  <div className="rounded-xl bg-[var(--card-bg)]/90 p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
                    <TextArea
                      label="What do you want to post?"
                      placeholder={typedPlaceholder || placeholderMessage}
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

                  <div className="flex flex-wrap gap-3">
                    {suggestedTerms.map((term, idx) => {
                      const palette = ["bg-[#00CA72]/30", "bg-[#FF71CD]/30", "bg-[#17E3E3]/30", "bg-[#6161FF]/30"];
                      const borderPalette = ["border-[#00CA72]", "border-[#FF71CD]", "border-[#17E3E3]", "border-[#6161FF]"];
                      const bgClass = palette[idx % palette.length];
                      const borderClass = borderPalette[idx % borderPalette.length];
                      return (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setText(term)}
                        className={`px-3 py-1.5 text-sm rounded-full border ${borderClass} ${bgClass} text-[var(--text-primary)] transition-all hover:shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:border-white/70`}
                      >
                        {term}
                      </button>
                      );
                    })}
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
              </div>
            </section>
          </ScrollReveal>
        )}

        {!showCreator && (
          <ScrollReveal animation="fade-up" delay={200} className="order-3">
            <Showcase />
          </ScrollReveal>
        )}

        {!showCreator && (
          <ScrollReveal animation="fade-up" delay={180} className="order-4">
            <section className="grid gap-8 lg:gap-10 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
              <div className="relative overflow-hidden rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.22)] order-1 lg:order-2 lg:h-full">
                <Image
                  src="/products.jpg"
                  alt="MeanIn team using products"
                  width={1200}
                  height={900}
                  className="h-full w-full object-cover lg:h-full"
                  priority
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-black/10" />
              </div>
              <div className="grid gap-6 order-2 lg:order-1">
                <div className="grid gap-2">
                  
                  <h3 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)]">
                    Solve status challenges
                  </h3>
                  <p className="text-base text-[var(--text-secondary)] max-w-xl">
                    Each tool solves a messaging need, and together they keep your stories, replies, and decodes consistent across every platform.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {PRODUCT_FEATURES.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/70 p-4 shadow-[0_10px_28px_rgba(0,0,0,0.18)]"
                      style={{
                        boxShadow:
                          "inset 0 0 0 1px rgba(255,255,255,0.02), 0 8px 22px rgba(0,0,0,0.22)",
                      }}
                    >
                      <div
                        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${item.accent} px-3 py-1 text-xs font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.22)]`}
                      >
                        <span className="uppercase tracking-[0.18em] text-[10px]">{item.subtitle}</span>
                      </div>
                      <div className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{item.title}</div>
                      <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">{item.copy}</p>
                      <button className="mt-3 text-sm font-semibold text-[var(--electric-blue)] hover:text-white transition">
                        Learn more →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {!showCreator && (
          <ScrollReveal animation="fade-up" delay={150} className="order-5">
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
        )}
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

const Page = () => (
  <Suspense fallback={<HomeLoading />}>
    <HomeContent />
  </Suspense>
);

export default Page;
