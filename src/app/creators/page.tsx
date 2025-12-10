'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { TextArea } from "@/components/ui/TextArea";
import { LoadingShimmer } from "@/components/ui/LoadingShimmer";
import { ShareModal } from "@/components/ShareModal";
import { createPost } from "@/lib/api";
import type { CreatePostResult, Platform } from "@/lib/types";
import { supabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

export default function CreatorsLanding() {
  const DEFAULT_PLATFORM: Platform = "whatsapp-status";
  const FALLBACK_TERMS = [
    "I'm fine",
    "We need to talk",
    "It's complicated",
    "No worries",
    "Let's circle back",
    "Per my last email",
  ];

  const [text, setText] = useState("");
  const [platform] = useState<Platform>(DEFAULT_PLATFORM);
  const [result, setResult] = useState<CreatePostResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [suggestedTerms] = useState<string[]>(FALLBACK_TERMS);
  const [showShareModal, setShowShareModal] = useState(false);
  const [predictions, setPredictions] = useState<string[]>([]);
  const [predicting, setPredicting] = useState(false);
  const [predictError, setPredictError] = useState("");
  const [dayMood, setDayMood] = useState("");
  const [autoPredicted, setAutoPredicted] = useState(false);
  const MOODS = [
    "Great day",
    "Alright",
    "Low energy",
    "Stressed",
    "Excited",
    "Reflective",
    "Busy",
  ];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) return;
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

  const handlePredict = useCallback(
    async (seedOverride?: string) => {
      if (!supabaseBrowser) {
        setPredictError("Supabase client not configured.");
        return;
      }
      setPredicting(true);
      setPredictError("");
      try {
        const { data: sessionData } = await supabaseBrowser.auth.getSession();
        const token = sessionData.session?.access_token;
        if (!token) {
          throw new Error("Please sign in to get suggestions.");
        }
        const seedPayload = seedOverride || text || dayMood;
        const res = await fetch("/api/creator-predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ seed: seedPayload }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Could not fetch suggestions");
        }
        setPredictions(data.suggestions || []);
      } catch (error) {
        console.error(error);
        setPredictError(error instanceof Error ? error.message : "Could not fetch suggestions");
      } finally {
        setPredicting(false);
      }
    },
    [dayMood, text],
  );

  useEffect(() => {
    if (!autoPredicted) {
      setAutoPredicted(true);
      void handlePredict();
    }
  }, [autoPredicted, handlePredict]);

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header />
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-5 pt-24 pb-16 lg:max-w-7xl lg:pt-28">
        <section className="grid gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:p-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]">
            Create a post
          </div>
          <p className="text-base text-[var(--text-secondary)]">
            Drop a line and we&apos;ll generate a share-ready link and card, tuned to your profile.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-[var(--text-secondary)]">How was your day?</span>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => {
                    setDayMood(mood);
                    void handlePredict(mood);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm transition",
                    dayMood === mood
                      ? "border-[var(--electric-blue)] bg-[var(--electric-blue)]/10 text-[var(--text-primary)]"
                      : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]",
                  )}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  void handlePredict();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)] disabled:opacity-60"
                disabled={predicting}
              >
                {predicting ? "Predicting..." : "Predict a status"}
              </button>
            {predictError && <span className="text-sm text-red-400">{predictError}</span>}
          </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  void handlePredict();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)] disabled:opacity-60"
                disabled={predicting}
              >
                {predicting ? "Predicting..." : "Predict for me"}
              </button>
            {predictError && <span className="text-sm text-red-400">{predictError}</span>}
          </div>
          <form className="grid gap-4" onSubmit={handleSubmit}>
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

        <section className="grid gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]/70 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.22)] backdrop-blur sm:p-8">
          <div className="flex items-center justify-between">
            <div className="grid gap-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]">
                AI suggestions
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Cards tuned to your vibe
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Quick-start lines you can reuse or edit, based on your profile.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="hidden rounded-full border border-[var(--border-color)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)] sm:inline-flex"
            >
              Refine profile
            </Link>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {predictions.map((line, idx) => (
              <div
                key={`${line}-${idx}`}
                className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3"
              >
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">{line}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setText(line)}
                    className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)]"
                  >
                    Use
                  </button>
                  <button
                    type="button"
                    onClick={() => setText(`${line} `)}
                    className="rounded-full border border-[var(--border-color)] px-3 py-1 text-xs font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)]"
                  >
                    Edit
                  </button>
                </div>
              </div>
          ))}
          {predictions.length === 0 && (
            <div className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-secondary)]">
              Tap Predict a status above to get fresh suggestions.
            </div>
          )}
        </div>
      </section>
      </main>
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
