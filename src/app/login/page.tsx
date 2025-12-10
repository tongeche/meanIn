'use client';

import { supabaseBrowser } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
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
          options: {
            data: {
              full_name: fullName,
              phone,
            },
          },
        });
        if (signUpError) throw signUpError;
      } else {
        const { data: signInData, error: signInError } = await supabaseBrowser.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        // If the user already has a saved profile, skip onboarding.
        const userId = signInData.user?.id;
        if (userId) {
          const { data: profileRow } = await supabaseBrowser
            .from("profiles")
            .select("creator_profile")
            .eq("id", userId)
            .maybeSingle();
          if (profileRow?.creator_profile) {
            setStatus("success");
            router.push("/creators");
            return;
          }
        }
      }
      setStatus("success");
      router.push("/preferences");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0b1220] via-[#0f1a2d] to-[#0b1220] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,240,200,0.08),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(91,158,255,0.08),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(164,121,255,0.08),transparent_28%)]" />
      <div className="relative mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-[24px] bg-white/5 shadow-[0_24px_80px_rgba(0,0,0,0.4)] lg:grid-cols-2">
        <div className="flex flex-col justify-between bg-[rgba(9,14,30,0.92)] px-8 py-10 lg:px-10">
          <div className="grid gap-4">
            <div className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#0b0f1f] shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3l9 18H3l9-18z" />
                </svg>
              </span>
              <span className="text-lg font-semibold text-white">MeanIn</span>
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">
                Let&apos;s get you started!
              </h1>
              <p className="text-sm leading-relaxed text-white/70">
                Fill in a few details to set up your profile. Phone number is optional, and you can finish onboarding later.
              </p>
              <p className="text-sm text-white/60">
                Questions? Email us at{" "}
                <a href="mailto:hello@meanin.com" className="text-[#8fc7ff] hover:underline">
                  hello@meanin.com
                </a>
                .
              </p>
            </div>
          </div>
          <div className="grid gap-2 text-sm text-white/70">
            <span>Already have an account?</span>
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "login" : "signup")}
              className="w-fit font-semibold text-[#8fc7ff] hover:underline"
            >
              {mode === "signup" ? "Sign in" : "Back to sign up"}
            </button>
          </div>
        </div>

        <div className="relative flex items-center justify-center bg-white/95 px-6 py-10 text-[#1c1b2b] lg:px-10">
          <div className="w-full max-w-lg space-y-6">
            <div className="flex items-center justify-between text-sm text-[#4a4863]">
              <div>
                <p className="font-semibold text-[#2a2840]">
                  {mode === "signup" ? "Personal information" : "Sign in"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#5b4bff] text-[#5b4bff]">
                  1
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e4e2f5] text-[#a3a0c2]">
                  2
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#e4e2f5] text-[#a3a0c2]">
                  3
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                />
              )}

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Professional email"
                className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
              />

              {mode === "signup" && (
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                />
              )}

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                minLength={6}
                className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
              />

              {error && <div className="text-sm text-red-500">{error}</div>}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full rounded-lg bg-[#5b4bff] px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#4a3dde] disabled:opacity-60"
              >
                {status === "loading" ? "Please wait..." : mode === "signup" ? "Next step" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-xs text-[#7b7995]">
              By continuing, you agree to our terms and privacy policy.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
