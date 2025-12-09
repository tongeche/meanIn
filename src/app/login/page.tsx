'use client';

import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    if (!supabaseBrowser) {
      setStatus("error");
      setError("Supabase client not configured.");
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabaseBrowser.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
      } else {
        const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
      setStatus("success");
      router.push("/onboarding");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5">
      <div className="grid gap-2 text-center">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--text-secondary)]">MeanIn</p>
        <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Sign {mode === "signup" ? "up" : "in"} to save your profile and try onboarding.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
      >
        <label className="grid gap-1 text-sm text-[var(--text-secondary)]">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)]/60"
            placeholder="you@example.com"
          />
        </label>

        <label className="grid gap-1 text-sm text-[var(--text-secondary)]">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--electric-blue)]/60"
            placeholder="••••••••"
            minLength={6}
          />
        </label>

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex h-11 items-center justify-center rounded-md bg-[var(--electric-blue)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#5b9eff] disabled:opacity-60"
        >
          {status === "loading"
            ? "Please wait..."
            : mode === "signup"
              ? "Sign up"
              : "Sign in"}
        </button>
      </form>

      <div className="text-center text-sm text-[var(--text-secondary)]">
        {mode === "signup" ? "Already have an account?" : "Need an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
          className="font-semibold text-[var(--electric-blue)] hover:underline"
        >
          {mode === "signup" ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}
