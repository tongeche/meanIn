'use client';

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { useRouter } from "next/navigation";

const INDUSTRIES = [
  "Technology",
  "Finance",
  "Healthcare",
  "Media",
  "Education",
  "E-commerce",
  "Consulting",
  "Other",
];

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const handleNext = (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 1) {
      if (!companyName.trim() || !role.trim() || !industry.trim()) {
        setError("Please fill company, role, and industry.");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      setStatus("loading");
      setError("");
      setTimeout(() => {
        setStatus("success");
        setStep(3);
      }, 500);
    }
  };

  if (step === 3) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#10153a] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(143,199,255,0.12),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(164,121,255,0.12),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(88,240,200,0.12),transparent_28%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.25),transparent_60%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white">
            ✈
          </div>
          <h1 className="text-3xl font-semibold sm:text-4xl">Thank you!</h1>
          <p className="max-w-xl text-sm text-white/80 sm:text-base">
            Check your email to verify your account. We&apos;ll be in touch in less than{" "}
            <span className="font-semibold text-[#8fc7ff]">48 hours</span>. You can also head back home to sign in with
            the email you used.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-sm font-semibold text-[#8fc7ff] hover:underline"
          >
            Back home
          </button>
        </div>
        <div className="relative mx-auto flex max-w-5xl justify-center px-6 pb-10 text-sm text-white/70">
          MeanIn
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#0c1226] via-[#0f1a2d] to-[#0c1226]">
      <Header />

      <div className="relative mx-auto flex min-h-screen items-center justify-center px-4 py-16">
        <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[28px] bg-white shadow-[0_32px_90px_rgba(0,0,0,0.28)] lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-[#0f1430] px-8 py-10 text-white lg:px-10">
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
                <p className="text-sm leading-relaxed text-white/75">
                  Fill in a few details to set up your workspace. You can adjust these later in settings.
                </p>
                <p className="text-sm text-white/70">
                  Questions? Email{" "}
                  <a href="mailto:hello@meanin.com" className="text-[#8fc7ff] hover:underline">
                    hello@meanin.com
                  </a>
                  .
                </p>
              </div>
            </div>
            <div className="grid gap-2 text-sm text-white/70">
              <span>Need help?</span>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-fit font-semibold text-[#8fc7ff] hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center bg-[#f9f8ff] px-6 py-10 text-[#1c1b2b] lg:px-10">
            <div className="w-full max-w-lg space-y-6">
              <div className="flex items-center justify-between text-sm text-[#4a4863]">
                <div>
                  <p className="font-semibold text-[#2a2840]">
                    {step === 1 ? "Company information" : step === 2 ? "Details confirmation" : "All set"}
                  </p>
                  <p className="text-xs">
                    {step === 1
                      ? "We’ll tailor recommendations with this."
                      : step === 2
                        ? "Confirm your details before sending."
                        : "Thanks for sharing your info."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 1 ? "border-[#5b4bff] text-[#5b4bff]" : "border-[#e4e2f5] text-[#a3a0c2]"
                    }`}
                  >
                    1
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 2 ? "border-[#5b4bff] text-[#5b4bff]" : "border-[#e4e2f5] text-[#a3a0c2]"
                    }`}
                  >
                    2
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                      step >= 3 ? "border-[#5b4bff] text-[#5b4bff]" : "border-[#e4e2f5] text-[#a3a0c2]"
                    }`}
                  >
                    3
                  </span>
                </div>
              </div>

              {step === 1 && (
                <>
                  <form onSubmit={handleNext} className="space-y-4">
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Company name"
                      className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                      required
                    />
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Your role"
                      className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                      required
                    />
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Website"
                      className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                    />
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                      required
                    >
                      <option value="">Industry</option>
                      {INDUSTRIES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                    >
                      <option value="">Company size</option>
                      {COMPANY_SIZES.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>

                    {error && <div className="text-sm text-red-500">{error}</div>}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="flex-1 rounded-lg border border-[#5b4bff] px-4 py-3 text-sm font-semibold text-[#5b4bff] shadow transition hover:bg-[#f5f3ff]"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={status === "loading"}
                        className="flex-1 rounded-lg bg-[#5b4bff] px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#4a3dde] disabled:opacity-60"
                      >
                        {status === "loading" ? "Please wait..." : "Next step"}
                      </button>
                    </div>
                  </form>
                  <p className="text-center text-xs text-[#7b7995]">
                    You can update these details later in settings.
                  </p>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-3">
                    <ReadonlyField label="Email">
                      <input
                        type="email"
                        value={companyName || "yourname@company.com"}
                        readOnly
                        className="w-full rounded-lg border border-[#e6e4f2] bg-[#f7f6fb] px-3 py-3 text-sm text-[#1c1b2b]"
                      />
                    </ReadonlyField>
                    <ReadonlyField label="Company">
                      <input
                        type="text"
                        value={companyName}
                        readOnly
                        className="w-full rounded-lg border border-[#e6e4f2] bg-[#f7f6fb] px-3 py-3 text-sm text-[#1c1b2b]"
                      />
                    </ReadonlyField>
                    <ReadonlyField label="Industry">
                      <input
                        type="text"
                        value={industry || "Industry"}
                        readOnly
                        className="w-full rounded-lg border border-[#e6e4f2] bg-[#f7f6fb] px-3 py-3 text-sm text-[#1c1b2b]"
                      />
                    </ReadonlyField>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="If you would like to leave a message."
                      className="min-h-[100px] w-full rounded-lg border border-[#e6e4f2] bg-white px-3 py-3 text-sm text-[#1c1b2b] shadow-inner focus:outline-none focus:ring-2 focus:ring-[#5b4bff]"
                    />
                  </div>
                  {error && <div className="text-sm text-red-500">{error}</div>}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 rounded-lg border border-[#5b4bff] px-4 py-3 text-sm font-semibold text-[#5b4bff] shadow transition hover:bg-[#f5f3ff]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleNext(e as unknown as React.FormEvent)}
                      disabled={status === "loading"}
                      className="flex-1 rounded-lg bg-[#5b4bff] px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-[#4a3dde] disabled:opacity-60"
                    >
                      {status === "loading" ? "Sending..." : "Send"}
                    </button>
                  </div>
                  <p className="text-center text-xs text-[#7b7995]">
                    Please make sure you agree with our Terms and Privacy Policy.
                  </p>
                </>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ReadonlyField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-semibold text-[#7b7995]">{label}</span>
      <div className="relative">
        {children}
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#a3a0c2]">✎</span>
      </div>
    </div>
  );
}
