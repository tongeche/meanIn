'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type React from "react";
import { useState } from "react";

type MultiField = string[];

type CepState = {
  expressionStyles: MultiField;
  themes: MultiField;
  toneProfile: MultiField;
  relationshipContext: string;
  emotionalIntentions: MultiField;
  writingFrequency: string;
  seedLine: string;
  visualMood: MultiField;
  favoriteQuotes: MultiField;
  avoidList: MultiField;
  musicTastes: MultiField;
  educationVibe: MultiField;
  films: MultiField;
  hobbies: MultiField;
  socialHabits: MultiField;
  employment: MultiField;
};

const EXPRESSION_STYLES = ["metaphorical", "direct", "playful", "poetic", "minimal", "story-like", "abstract", "sarcastic"];
const TONES = ["hopeful", "reflective", "melancholic", "sarcastic", "gentle", "detached", "fiery", "intimate"];
const THEMES = ["love", "faith", "identity", "healing", "existential", "friendship", "family", "purpose", "hustle", "joy", "loss"];
const VISUALS = ["minimal", "grainy film", "gradient glow", "photo", "collage", "neon", "paper texture", "monochrome"];
const INTENTIONS = ["curious", "provoking", "touching", "reassuring", "calling out", "inspiring", "playful poke", "comforting"];
const RELATIONSHIPS = ["single", "dating", "complicated", "long term", "healing", "private"];
const FREQUENCIES = ["daily", "weekly", "monthly", "in bursts"];
const MUSIC = ["afrobeats", "hip-hop", "alt/indie", "gospel", "rnb/soul", "edm/house", "jazz/lofi", "rock", "pop", "classical"];
const EDUCATION = ["student", "graduate", "self-taught", "mentor", "researcher", "on break", "learning a trade"];
const FILM_TASTES = ["drama", "sci-fi", "documentary", "romance", "action", "animation", "thriller", "comedy"];
const HOBBIES = ["reading", "writing", "fitness", "travel", "gaming", "cooking", "photography", "music-making", "fashion", "art"];
const SOCIAL_HABITS = ["silent watcher", "daily poster", "weekend poster", "night owl", "lurker", "commenter", "story-only", "close friends"];
const EMPLOYMENT = ["student", "freelancer", "full-time", "entrepreneur", "creative", "tech", "service", "looking", "on break"];

const steps = [
  { id: "01", title: "Voice & Style", icon: "sparkle" as const },
  { id: "02", title: "Themes & Intent", icon: "tag" as const },
  { id: "03", title: "Rhythm & Seed", icon: "clock" as const },
  { id: "04", title: "Quotes & Boundaries", icon: "quote" as const },
  { id: "05", title: "Culture: Media", icon: "wave" as const },
  { id: "06", title: "Culture: Life", icon: "heart" as const },
  { id: "07", title: "Social & Work", icon: "link" as const },
];

export default function PreferencesPage() {
  const [cep, setCep] = useState<CepState>({
    expressionStyles: [],
    themes: [],
    toneProfile: [],
    relationshipContext: "",
    emotionalIntentions: [],
    writingFrequency: "daily",
    seedLine: "",
    visualMood: [],
    favoriteQuotes: [],
    avoidList: [],
    musicTastes: [],
    educationVibe: [],
    films: [],
    hobbies: [],
    socialHabits: [],
    employment: [],
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  const toggle = (key: keyof CepState, value: string) => {
    setCep((prev) => {
      const current = prev[key] as MultiField;
      const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const setSingle = (key: keyof CepState, value: string) => {
    setCep((prev) => ({ ...prev, [key]: value }));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const skipStep = () => nextStep();

  if (completed) {
    return (
      <div className="relative min-h-screen bg-[#0c0f1a] text-[var(--text-primary)]">
        <Header />
        <div className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-5 py-24 text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--card-bg)] ring-2 ring-[var(--electric-blue)]/60">
            <Icon name="sparkle" />
          </div>
          <h1 className="text-3xl font-semibold text-white">Preferences saved</h1>
          <p className="mt-3 max-w-xl text-sm text-[var(--text-secondary)]">
            You’re all set. Jump in and start creating, or tweak your preferences anytime.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/creators"
              className="rounded-full bg-[#eb2fa3] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#d82892]"
            >
              Start creating
            </Link>
            <button
              type="button"
              onClick={() => setCompleted(false)}
              className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)]"
            >
              Edit preferences
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0c0f1a] text-[var(--text-primary)]">
      <Header />
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 pt-24 pb-16">
        <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
          <aside className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 text-center shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--card-bg)] ring-2 ring-[var(--border-color)]">
              <Icon name={steps[currentStep].icon} />
            </div>
            <div className="text-lg font-semibold text-[var(--text-primary)]">{steps[currentStep].title}</div>
          </aside>

          <section className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-[0_12px_32px_rgba(0,0,0,0.25)]">
            <div className="mb-6 flex items-center justify-between">
              <div className="grid gap-1">
                <h2 className="text-xl font-semibold text-[var(--text-primary)]">{steps[currentStep].title}</h2>
              </div>
            </div>

            <div className="grid gap-4">
              {currentStep === 0 && (
                <>
                  <FieldBlock title="Expression style">
                    <PillGroup options={EXPRESSION_STYLES} selected={cep.expressionStyles} onToggle={(v) => toggle("expressionStyles", v)} />
                  </FieldBlock>
                  <FieldBlock title="Tone profile">
                    <PillGroup options={TONES} selected={cep.toneProfile} onToggle={(v) => toggle("toneProfile", v)} />
                  </FieldBlock>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <FieldBlock title="Themes you often touch">
                    <PillGroup options={THEMES} selected={cep.themes} onToggle={(v) => toggle("themes", v)} />
                  </FieldBlock>
                  <FieldBlock title="Emotional intent">
                    <PillGroup options={INTENTIONS} selected={cep.emotionalIntentions} onToggle={(v) => toggle("emotionalIntentions", v)} />
                  </FieldBlock>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <FieldBlock title="How often you write">
                    <PillGroup options={FREQUENCIES} selected={[cep.writingFrequency]} onToggle={(v) => setSingle("writingFrequency", v)} single />
                  </FieldBlock>
                  <FieldBlock title="One line that sounds like you" subtitle="Optional seed to help anchor your phrasing.">
                    <textarea
                      value={cep.seedLine}
                      onChange={(e) => setSingle("seedLine", e.target.value)}
                      placeholder="e.g., The light hits different when you're healing in secret."
                      className="min-h-[90px] w-full rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)]/60"
                    />
                  </FieldBlock>
                </>
              )}

              {currentStep === 3 && (
                <>
                  <FieldBlock title="Favorite quotes or lines" subtitle="Add short lines that capture your voice.">
                    <AddablePills
                      values={cep.favoriteQuotes}
                      placeholder="Add a quote and hit Enter"
                      onAdd={(v) => setCep((prev) => ({ ...prev, favoriteQuotes: [...prev.favoriteQuotes, v] }))}
                      onRemove={(v) => setCep((prev) => ({ ...prev, favoriteQuotes: prev.favoriteQuotes.filter((i) => i !== v) }))}
                    />
                  </FieldBlock>
                  <FieldBlock title="Words or tones to avoid" subtitle="List clichés, topics, or vibes you don't want.">
                    <AddablePills
                      values={cep.avoidList}
                      placeholder="e.g., toxic positivity"
                      onAdd={(v) => setCep((prev) => ({ ...prev, avoidList: [...prev.avoidList, v] }))}
                      onRemove={(v) => setCep((prev) => ({ ...prev, avoidList: prev.avoidList.filter((i) => i !== v) }))}
                    />
                  </FieldBlock>
                </>
              )}

              {currentStep === 4 && (
                <>
                  <FieldBlock title="Music tastes">
                    <PillGroup options={MUSIC} selected={cep.musicTastes} onToggle={(v) => toggle("musicTastes", v)} />
                  </FieldBlock>
                  <FieldBlock title="Education vibe">
                    <PillGroup options={EDUCATION} selected={cep.educationVibe} onToggle={(v) => toggle("educationVibe", v)} />
                  </FieldBlock>
                </>
              )}

              {currentStep === 5 && (
                <FieldBlock title="Hobbies">
                  <PillGroup options={HOBBIES} selected={cep.hobbies} onToggle={(v) => toggle("hobbies", v)} />
                </FieldBlock>
              )}

              {currentStep === 6 && (
                <>
                  <FieldBlock title="Social media habits">
                    <PillGroup options={SOCIAL_HABITS} selected={cep.socialHabits} onToggle={(v) => toggle("socialHabits", v)} />
                  </FieldBlock>
                  <FieldBlock title="Employment vibe">
                    <PillGroup options={EMPLOYMENT} selected={cep.employment} onToggle={(v) => toggle("employment", v)} />
                  </FieldBlock>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)]"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={skipStep}
                className="rounded-full border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)]"
              >
                Skip
              </button>
              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="rounded-full bg-[#eb2fa3] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#d82892]"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCompleted(true)}
                  className="rounded-full bg-[#eb2fa3] px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#d82892]"
                >
                  Finish
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}

type IconName = (typeof steps)[number]["icon"];

function Icon({ name }: { name: IconName }) {
  const common = "h-4 w-4 text-[var(--text-primary)]";
  switch (name) {
    case "sparkle":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
          <path d="m12 2 2.1 6.2H20l-5 3.7 1.9 6.1L12 15.6l-4.9 3.4L9 11.9 4 8.2h5.9L12 2Z" />
        </svg>
      );
    case "tag":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
          <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82ZM7.5 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l4 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "quote":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
          <path d="M5 10a4 4 0 0 1 4-4h1v8H5Zm9 0a4 4 0 0 1 4-4h1v8h-5Z" />
        </svg>
      );
    case "wave":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M3 12c3-2 6-2 9 0s6 2 9 0" strokeLinecap="round" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="currentColor" aria-hidden>
          <path d="M12 21s-7-4.7-7-10.2A5.8 5.8 0 0 1 12 5a5.8 5.8 0 0 1 7 5.8C19 16.3 12 21 12 21Z" />
        </svg>
      );
    case "link":
      return (
        <svg viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="m10 14-1 1a5 5 0 1 1-7-7l1-1" strokeLinecap="round" />
          <path d="m14 10 1-1a5 5 0 1 1 7 7l-1 1" strokeLinecap="round" />
          <path d="m8 12 4-4m0 8 4-4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function StepBlock({ prompt, step, children }: { prompt: string; step: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]/80 p-4 shadow-inner">
      <div className="text-sm text-[var(--text-secondary)]">
        <span className="mr-2 rounded-full bg-[var(--card-bg)] px-2 py-1 text-xs font-semibold ring-1 ring-[var(--border-color)]">
          MeanIn {step}
        </span>
        {prompt}
      </div>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function FieldBlock({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
      <div className="grid gap-1">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{title}</div>
        {subtitle && <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  selected,
  onToggle,
  single,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  single?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm transition",
              isActive
                ? "border-[var(--electric-blue)] bg-[var(--electric-blue)]/10 text-[var(--text-primary)]"
                : "border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function AddablePills({
  values,
  placeholder,
  onAdd,
  onRemove,
}: {
  values: string[];
  placeholder?: string;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const handleAdd = () => {
    const value = draft.trim();
    if (!value) return;
    if (values.includes(value)) {
      setDraft("");
      return;
    }
    onAdd(value);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onRemove(value)}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--card-bg)] px-3 py-1 text-sm text-[var(--text-primary)] ring-1 ring-[var(--border-color)] hover:ring-[var(--electric-blue)]"
          >
            <span>{value}</span>
            <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">✕</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)]/50"
        />
        <Button type="button" variant="secondary" onClick={handleAdd}>
          Add
        </Button>
      </div>
    </div>
  );
}
