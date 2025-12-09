'use client';

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
  clubs: MultiField;
  lowTime: MultiField;
  highTime: MultiField;
  netflixPicks: MultiField;
};

const EXPRESSION_STYLES = [
  "metaphorical",
  "direct",
  "playful",
  "poetic",
  "minimal",
  "story-like",
  "abstract",
  "sarcastic",
];

const TONES = [
  "hopeful",
  "reflective",
  "melancholic",
  "sarcastic",
  "gentle",
  "detached",
  "fiery",
  "intimate",
];

const THEMES = [
  "love",
  "faith",
  "identity",
  "healing",
  "existential",
  "friendship",
  "family",
  "purpose",
  "hustle",
  "joy",
  "loss",
];

const VISUALS = [
  "minimal",
  "grainy film",
  "gradient glow",
  "photo",
  "collage",
  "neon",
  "paper texture",
  "monochrome",
];

const INTENTIONS = [
  "curious",
  "provoking",
  "touching",
  "reassuring",
  "calling out",
  "inspiring",
  "playful poke",
  "comforting",
];

const RELATIONSHIPS = [
  "single",
  "dating",
  "complicated",
  "long term",
  "healing",
  "private",
];

const FREQUENCIES = ["daily", "weekly", "monthly", "in bursts"];

const MUSIC = [
  "afrobeats",
  "hip-hop",
  "alt/indie",
  "gospel",
  "rnb/soul",
  "edm/house",
  "jazz/lofi",
  "rock",
  "pop",
  "classical",
];

const EDUCATION = [
  "student",
  "graduate",
  "self-taught",
  "mentor",
  "researcher",
  "on break",
  "learning a trade",
];

const FILM_TASTES = [
  "drama",
  "sci-fi",
  "documentary",
  "romance",
  "action",
  "animation",
  "thriller",
  "comedy",
];

const HOBBIES = [
  "reading",
  "writing",
  "fitness",
  "travel",
  "gaming",
  "cooking",
  "photography",
  "music-making",
  "fashion",
  "art",
];

const SOCIAL_HABITS = [
  "silent watcher",
  "daily poster",
  "weekend poster",
  "night owl",
  "lurker",
  "commenter",
  "story-only",
  "close friends",
];

const EMPLOYMENT = [
  "student",
  "freelancer",
  "full-time",
  "entrepreneur",
  "creative",
  "tech",
  "service",
  "looking",
  "on break",
];

const CLUBS = [
  "book club",
  "sports team",
  "music collective",
  "dance crew",
  "gaming guild",
  "faith group",
  "debate/uni club",
  "volunteer org",
  "art circle",
];

const LOW_TIME = [
  "morning rush",
  "workday",
  "school hours",
  "commute",
  "family time",
];

const HIGH_TIME = [
  "late night",
  "weekends",
  "early morning",
  "breaks",
  "after work",
];

const NETFLIX_RECENTS = [
  "Leave the World Behind",
  "The Killer",
  "Society of the Snow",
  "Damsel",
  "Hit Man",
];

export default function OnboardingPage() {
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
    clubs: [],
    lowTime: [],
    highTime: [],
    netflixPicks: [],
  });
  const [status, setStatus] = useState<"idle" | "saved">("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

const steps = [
  {
    id: "01",
    title: "Voice & Style",
    prompt: "Hey, what does your voice sound like? Pick the styles and tones that feel right. You can skip anything.",
  },
  {
    id: "02",
    title: "Themes & Intent",
    prompt: "What do you talk about most, and what mood are you aiming for? Skip if you're unsure.",
  },
  {
    id: "03",
    title: "Rhythm & Seed",
    prompt: "How often do you share, and give me one line that sounds like you. Anything to avoid? You can skip.",
  },
  {
    id: "04",
    title: "Quotes & Boundaries",
    prompt: "Share a couple of favorite lines and what to avoid. Skip if you want.",
  },
  {
    id: "05",
    title: "Culture: Media",
    prompt: "Music, studies, films — pick what fits. Skip if you want.",
  },
  {
    id: "06",
    title: "Culture: Life",
    prompt: "Hobbies, clubs, even Netflix picks. Choose what matches you.",
  },
  {
    id: "07",
    title: "Your Time",
    prompt: "When are you low on time vs. energized to post?",
  },
  {
    id: "08",
    title: "Social & Work",
    prompt: "How do you use socials, and what's your work vibe? Helps set rhythm and tone. You can skip.",
  },
];

  const toggle = (key: keyof CepState, value: string) => {
    setCep((prev) => {
      const current = prev[key] as MultiField;
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
    setStatus("idle");
  };

  const setSingle = (key: keyof CepState, value: string) => {
    setCep((prev) => ({ ...prev, [key]: value }));
    setStatus("idle");
  };

  const handleSave = async () => {
    if (!supabaseBrowser) {
      setError("Supabase client not configured.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data: sessionData } = await supabaseBrowser.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Please sign in to save your profile.");
      }
      const res = await fetch("/api/creator-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cep }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Could not save profile");
      }
      setStatus("saved");
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Could not save profile");
      setStatus("idle");
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 0));
  const skipStep = () => nextStep();

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)]">
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-5 pt-24 pb-16 lg:max-w-7xl lg:pt-28">
      <header className="grid gap-2">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]">
          MeanIn chat
        </div>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)] sm:text-4xl">
          Let&apos;s learn your voice.
        </h1>
        <p className="max-w-3xl text-base text-[var(--text-secondary)]">
          We&apos;ll go one step at a time. I&apos;ll ask, you pick. Quick, friendly, and no pressure.
        </p>
      </header>

      <main className="grid gap-6">
        <div className="flex flex-wrap items-center gap-3">
          {steps.map((step, idx) => (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ring-[var(--border-color)] transition",
                currentStep === idx
                  ? "bg-[var(--electric-blue)]/15 text-[var(--text-primary)] ring-[var(--electric-blue)]/50"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
              )}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card-bg)] text-xs font-semibold ring-1 ring-[var(--border-color)]">
                {step.id}
              </span>
              <span>{step.title}</span>
            </button>
          ))}
          <span className="text-sm text-[var(--text-secondary)]">
            You decide the pace. Skip anytime.
          </span>
        </div>

        <section className="grid gap-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)] sm:p-7">
          {currentStep === 0 && (
            <>
              <ChatBubble role="assistant" text={steps[0].prompt} step={steps[0].id} />
              <ChatBubble role="user">
                <FieldBlock title="Expression style" icon="sparkle">
                  <PillGroup
                    options={EXPRESSION_STYLES}
                    selected={cep.expressionStyles}
                    onToggle={(value) => toggle("expressionStyles", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Tone profile" icon="wave">
                  <PillGroup
                    options={TONES}
                    selected={cep.toneProfile}
                    onToggle={(value) => toggle("toneProfile", value)}
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 1 && (
            <>
              <ChatBubble role="assistant" text={steps[1].prompt} step={steps[1].id} />
              <ChatBubble role="user">
                <FieldBlock title="Themes you often touch" icon="tag">
                  <PillGroup
                    options={THEMES}
                    selected={cep.themes}
                    onToggle={(value) => toggle("themes", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Emotional intent" icon="heart">
                  <PillGroup
                    options={INTENTIONS}
                    selected={cep.emotionalIntentions}
                    onToggle={(value) => toggle("emotionalIntentions", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Relationship context" icon="link">
                  <PillGroup
                    options={RELATIONSHIPS}
                    selected={cep.relationshipContext ? [cep.relationshipContext] : []}
                    onToggle={(value) =>
                      setSingle("relationshipContext", value === cep.relationshipContext ? "" : value)
                    }
                    single
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 2 && (
            <>
              <ChatBubble role="assistant" text={steps[2].prompt} step={steps[2].id} />
              <ChatBubble role="user">
                <FieldBlock title="How often you write" icon="clock">
                  <PillGroup
                    options={FREQUENCIES}
                    selected={[cep.writingFrequency]}
                    onToggle={(value) => setSingle("writingFrequency", value)}
                    single
                  />
                </FieldBlock>

                <FieldBlock
                  title="One line that sounds like you"
                  subtitle="Optional seed to help the model anchor your phrasing."
                  icon="pen"
                >
                  <textarea
                    value={cep.seedLine}
                    onChange={(e) => setSingle("seedLine", e.target.value)}
                    placeholder="e.g., The light hits different when you're healing in secret."
                    className="min-h-[90px] w-full rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)]/60"
                  />
                </FieldBlock>

                <FieldBlock title="Background vibe" subtitle="What visuals feel like you?" icon="sparkle">
                  <PillGroup
                    options={VISUALS}
                    selected={cep.visualMood}
                    onToggle={(value) => toggle("visualMood", value)}
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 3 && (
            <>
              <ChatBubble role="assistant" text={steps[3].prompt} step={steps[3].id} />
              <ChatBubble role="user">
                <FieldBlock
                  title="Favorite quotes or lines"
                  subtitle="Add short lines that capture your voice."
                  icon="quote"
                >
                  <AddablePills
                    values={cep.favoriteQuotes}
                    placeholder="Add a quote and hit Enter"
                    onAdd={(value) =>
                      setCep((prev) => ({
                        ...prev,
                        favoriteQuotes: [...prev.favoriteQuotes, value],
                      }))
                    }
                    onRemove={(value) =>
                      setCep((prev) => ({
                        ...prev,
                        favoriteQuotes: prev.favoriteQuotes.filter((item) => item !== value),
                      }))
                    }
                  />
                </FieldBlock>

                <FieldBlock
                  title="Words or tones to avoid"
                  subtitle="List clichés, topics, or vibes you don't want."
                  icon="ban"
                >
                  <AddablePills
                    values={cep.avoidList}
                    placeholder="e.g., toxic positivity"
                    onAdd={(value) =>
                      setCep((prev) => ({
                        ...prev,
                        avoidList: [...prev.avoidList, value],
                      }))
                    }
                    onRemove={(value) =>
                      setCep((prev) => ({
                        ...prev,
                        avoidList: prev.avoidList.filter((item) => item !== value),
                      }))
                    }
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 4 && (
            <>
              <ChatBubble role="assistant" text={steps[4].prompt} step={steps[4].id} />
              <ChatBubble role="user">
                <FieldBlock title="Music tastes" icon="sparkle">
                  <PillGroup
                    options={MUSIC}
                    selected={cep.musicTastes}
                    onToggle={(value) => toggle("musicTastes", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Education vibe" icon="tag">
                  <PillGroup
                    options={EDUCATION}
                    selected={cep.educationVibe}
                    onToggle={(value) => toggle("educationVibe", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Films you love" icon="wave">
                  <PillGroup
                    options={FILM_TASTES}
                    selected={cep.films}
                    onToggle={(value) => toggle("films", value)}
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 5 && (
            <>
              <ChatBubble role="assistant" text={steps[5].prompt} step={steps[5].id} />
              <ChatBubble role="user">
                <FieldBlock title="Hobbies" icon="heart">
                  <PillGroup
                    options={HOBBIES}
                    selected={cep.hobbies}
                    onToggle={(value) => toggle("hobbies", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Clubs / communities" icon="link">
                  <PillGroup
                    options={CLUBS}
                    selected={cep.clubs}
                    onToggle={(value) => toggle("clubs", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Recent Netflix picks" icon="pen">
                  <PillGroup
                    options={NETFLIX_RECENTS}
                    selected={cep.netflixPicks}
                    onToggle={(value) => toggle("netflixPicks", value)}
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 6 && (
            <>
              <ChatBubble role="assistant" text={steps[6].prompt} step={steps[6].id} />
              <ChatBubble role="user">
                <FieldBlock title="Low-time windows" subtitle="When you're busy or drained" icon="clock">
                  <PillGroup
                    options={LOW_TIME}
                    selected={cep.lowTime}
                    onToggle={(value) => toggle("lowTime", value)}
                  />
                </FieldBlock>

                <FieldBlock title="High-time windows" subtitle="When you have energy to post" icon="sparkle">
                  <PillGroup
                    options={HIGH_TIME}
                    selected={cep.highTime}
                    onToggle={(value) => toggle("highTime", value)}
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          {currentStep === 7 && (
            <>
              <ChatBubble role="assistant" text={steps[7].prompt} step={steps[7].id} />
              <ChatBubble role="user">
                <FieldBlock title="Social media habits" icon="link">
                  <PillGroup
                    options={SOCIAL_HABITS}
                    selected={cep.socialHabits}
                    onToggle={(value) => toggle("socialHabits", value)}
                  />
                </FieldBlock>

                <FieldBlock title="Employment vibe" icon="tag">
                  <PillGroup
                    options={EMPLOYMENT}
                    selected={cep.employment}
                    onToggle={(value) => toggle("employment", value)}
                  />
                </FieldBlock>
              </ChatBubble>
            </>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border-color)] pt-4">
            {currentStep > 0 && (
              <Button type="button" variant="secondary" onClick={prevStep}>
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <>
                <Button type="button" variant="secondary" onClick={skipStep}>
                  Skip
                </Button>
                <Button type="button" variant="primary" onClick={nextStep}>
                  Next
                </Button>
              </>
            )}
            {currentStep === steps.length - 1 && (
              <Button onClick={handleSave} variant="primary" loading={saving}>
                Save profile
              </Button>
            )}
            <span className="text-sm text-[var(--text-secondary)]">
              These choices power predictions and tone for your future posts.
            </span>
            {status === "saved" && (
              <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs font-semibold text-green-300">
                Saved
              </span>
            )}
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </section>
      </main>
      </div>
      <Footer />
    </div>
  );
}

function SectionHeader({ step, title }: { step: string; title: string }) {
  return (
    <div className="flex items-center gap-3 text-[var(--text-primary)]">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card-bg)] text-xs font-semibold ring-1 ring-[var(--border-color)]">
        {step}
      </span>
      <span className="text-base font-semibold">{title}</span>
    </div>
  );
}

function ChatBubble({
  role,
  text,
  step,
  children,
}: {
  role: "assistant" | "user";
  text?: string;
  step?: string;
  children?: React.ReactNode;
}) {
  const isAssistant = role === "assistant";
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-2xl border border-[var(--border-color)] p-4",
        isAssistant
          ? "bg-[var(--card-bg)]/80 text-[var(--text-primary)]"
          : "bg-[var(--bg-secondary)] text-[var(--text-primary)]",
      )}
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">
        {isAssistant ? "MeanIn" : "You"}
        {step && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--card-bg)] text-[var(--text-secondary)] ring-1 ring-[var(--border-color)]">
            {step}
          </span>
        )}
      </div>
      {text && <p className="text-base leading-relaxed text-[var(--text-primary)]">{text}</p>}
      {children}
    </div>
  );
}

function FieldBlock({
  title,
  subtitle,
  children,
  icon,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  icon?: IconName;
}) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-1">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          {icon && <Icon name={icon} />}
          <span>{title}</span>
        </div>
        {subtitle && <p className="text-sm text-[var(--text-secondary)]">{subtitle}</p>}
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
            {single ? option : option}
          </button>
        );
      })}
    </div>
  );
}

function SnapshotRow({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-[var(--text-secondary)]">{label}:</span>
      {values.length === 0 && (
        <span className="text-[var(--text-secondary)]/80">Not set</span>
      )}
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full bg-[var(--card-bg)] px-3 py-1 text-xs text-[var(--text-primary)] ring-1 ring-[var(--border-color)]"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

type IconName = "sparkle" | "wave" | "tag" | "heart" | "link" | "clock" | "pen" | "quote" | "ban";

function Icon({ name }: { name: IconName }) {
  const common = "h-4 w-4 text-[var(--text-secondary)]";
  switch (name) {
    case "sparkle":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
          <path d="M4 4l1 2-1 2-2-1-2 1 1-2-1-2 2 1 2-1z" />
          <path d="M20 15l.5 1.5L22 17l-1.5.5L20 19l-.5-1.5L18 17l1.5-.5L20 15z" />
        </svg>
      );
    case "wave":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12c2.5-3 5.5-3 8 0s5.5 3 8 0" />
          <path d="M3 6c2.5-3 5.5-3 8 0s5.5 3 8 0" />
        </svg>
      );
    case "tag":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 7l8-4 10 4-8 4-10-4v10l10 4 8-4V7" />
        </svg>
      );
    case "heart":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 21s-6.5-4.4-9-9a5.3 5.3 0 019-6 5.3 5.3 0 019 6c-2.5 4.6-9 9-9 9z" />
        </svg>
      );
    case "link":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 007.07 0l1.17-1.17a4 4 0 00-5.66-5.66L11 7" />
          <path d="M14 11a5 5 0 00-7.07 0L5.76 12.17a4 4 0 105.66 5.66L13 17" />
        </svg>
      );
    case "clock":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "pen":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case "quote":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 7h4v4H7z" />
          <path d="M7 15h4v2H7z" />
          <path d="M13 7h4v4h-4z" />
          <path d="M13 15h4v2h-4z" />
        </svg>
      );
    case "ban":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path d="M5 19 19 5" />
        </svg>
      );
    default:
      return null;
  }
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
