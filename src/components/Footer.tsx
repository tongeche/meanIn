'use client';

import Link from "next/link";
import { useTheme } from "./ThemeProvider";

const FOOTER_LINKS = {
  Resources: [
    { label: "Docs", href: "#" },
    { label: "Learn", href: "#" },
    { label: "Showcase", href: "#" },
    { label: "Blog", href: "#" },
  ],
  More: [
    { label: "About", href: "#" },
    { label: "Contact", href: "#" },
    { label: "GitHub", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--deep-slate)]">
      <div className="mx-auto max-w-6xl px-5 py-12 lg:py-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[var(--deep-slate)] shadow">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3l9 18H3l9-18z" />
                </svg>
              </span>
              <span className="text-lg font-semibold tracking-tight text-white">
                MeanIn
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Decode what they really meant. Turn any phrase into a share-ready story card with cultural context.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {title}
              </h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-color)] pt-8 sm:flex-row">
          {/* Copyright & Social */}
          <div className="flex items-center gap-4">
            <p className="text-sm text-[var(--text-secondary)]">
              © {new Date().getFullYear()} MeanIn
            </p>
            <div className="flex items-center gap-3 text-[var(--text-secondary)]">
              {/* GitHub */}
              <a
                href="#"
                className="transition hover:text-[var(--text-primary)]"
                aria-label="GitHub"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              {/* X/Twitter */}
              <a
                href="#"
                className="transition hover:text-[var(--text-primary)]"
                aria-label="X"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Theme Toggle - Like Vercel */}
          {mounted && (
            <div className="flex items-center rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] p-1">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  theme === 'light'
                    ? 'bg-[var(--text-primary)] text-[var(--deep-slate)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="Light mode"
                title="Light mode"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  theme === 'system'
                    ? 'bg-[var(--text-primary)] text-[var(--deep-slate)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="System preference"
                title="System preference"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  theme === 'dark'
                    ? 'bg-[var(--text-primary)] text-[var(--deep-slate)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                aria-label="Dark mode"
                title="Dark mode"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
