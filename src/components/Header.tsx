'use client';

import Link from "next/link";

const NAV_LINKS = ["Showcase", "Docs", "Blog", "Templates", "Enterprise"];

export function Header() {
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
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="rounded-md px-2 py-1 transition hover:text-[var(--text-primary)]"
            >
              {link}
            </a>
          ))}
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          {/* Search - hidden on mobile */}
          <div className="relative hidden max-w-xs flex-1 items-center overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm text-[var(--text-primary)] shadow-inner lg:flex">
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
              placeholder="Search documentation..."
              className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none"
              aria-label="Search documentation"
            />
            <span className="ml-2 rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)]">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="#create"
              className="rounded-lg bg-[var(--electric-blue)] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#5b9eff] transition-colors"
            >
              Create
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
