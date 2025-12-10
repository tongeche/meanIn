'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const NAV_LINKS = ["Showcase", "Blog", "Templates"];

type SearchResult = {
  slug: string;
  keyword: string;
  text: string;
};

export function Header() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const init = async () => {
      if (!supabaseBrowser) return;
      const { data } = await supabaseBrowser.auth.getSession();
      setAuthed(!!data.session);
      supabaseBrowser.auth.onAuthStateChange((_event, session) => {
        setAuthed(!!session);
      });
    };
    void init();
    return () => {
      if (abortRef.current) abortRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = (value: string) => {
    const q = value.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    fetch(`/api/search?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Search failed", error);
          setLoading(false);
        }
      });
  };

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 240);
  };

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/p/${slug}`);
  };

  const handlePrefill = (text: string) => {
    setOpen(false);
    router.push(`/?prefill=${encodeURIComponent(text)}`);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (results[0]) {
      handleSelect(results[0].slug);
    }
  };

  const handleAuthToggle = async () => {
    if (!authed) {
      router.push("/login");
      return;
    }
    if (supabaseBrowser) {
      await supabaseBrowser.auth.signOut();
    }
    setAuthed(false);
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full">
      <nav className="flex flex-wrap items-center gap-4 border-b border-[var(--border-color)] bg-[var(--deep-slate)]/95 px-4 py-3 backdrop-blur-md md:gap-6 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--deep-slate)] shadow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3l9 18H3l9-18z" />
            </svg>
          </span>
          <span className="h-6 w-px bg-[var(--border-color)]" />
          <span className="text-lg font-semibold tracking-tight text-white">
            MeanIn
          </span>
        </Link>

        <div className="hidden flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)] md:flex md:gap-4">
          {NAV_LINKS.map((link) => {
            const target =
              link.toLowerCase() === "templates"
                ? "/decode-template"
                : link.toLowerCase() === "showcase"
                  ? "/#showcase"
                  : "#";
            return (
              <Link
                key={link}
                href={target}
                className="rounded-md px-2 py-1 transition hover:text-[var(--text-primary)]"
              >
                {link}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search - hidden on mobile */}
          <div className="relative hidden w-full max-w-md flex-1 lg:flex">
            <form
              onSubmit={handleSubmit}
              className="flex w-full items-center overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-inner"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 text-[var(--text-secondary)]"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={() => setOpen(true)}
                placeholder="Search statuses..."
                className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
                aria-label="Search statuses"
              />
              <span className="ml-2 rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
                ⌘K
              </span>
            </form>

            {open && query.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-[0_12px_32px_rgba(0,0,0,0.35)]">
                {loading && (
                  <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    Searching…
                  </div>
                )}
                {!loading && results.length === 0 && (
                  <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                    No matches yet. Try a different phrase.
                  </div>
                )}
                {!loading &&
                  results.map((result) => {
                    const preview =
                      result.text.length > 120
                        ? `${result.text.slice(0, 120)}…`
                        : result.text;
                    return (
                      <button
                        key={result.slug}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleSelect(result.slug)}
                        className="flex w-full flex-col gap-1 border-t border-[var(--border-color)] px-4 py-3 text-left first:border-t-0 hover:bg-[var(--card-bg)]"
                      >
                        <div className="text-xs uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                          {result.keyword || "Status"}
                        </div>
                        <div className="text-sm text-[var(--text-primary)]">
                          {preview}
                        </div>
                      </button>
                    );
                  })}
                {!loading && query.trim().length >= 2 && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handlePrefill(query)}
                    className="flex w-full items-center justify-between border-t border-[var(--border-color)] px-4 py-3 text-sm font-semibold text-[var(--electric-blue)] hover:bg-[var(--card-bg)]"
                  >
                    Use “{query.trim()}” in a new post
                    <span aria-hidden>↗</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="#create"
              className="rounded-lg bg-[var(--electric-blue)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#5b9eff] transition-colors"
            >
              Create
            </Link>
            <button
              type="button"
              onClick={handleAuthToggle}
              className="rounded-lg border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] transition hover:border-[var(--text-secondary)]"
            >
              {authed ? "Logout" : "Sign up"}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
