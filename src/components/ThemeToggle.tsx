'use client';

import { useTheme } from './ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { value: 'light' as const, label: 'Light', icon: '☀️' },
    { value: 'dark' as const, label: 'Dark', icon: '🌙' },
    { value: 'system' as const, label: 'System', icon: '💻' },
  ];

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--card-bg)] text-lg transition hover:border-[var(--color-primary)]/50 hover:bg-[var(--card-bg)]"
        aria-label="Toggle theme"
        title="Toggle theme"
      >
        {resolvedTheme === 'dark' ? '🌙' : '☀️'}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-12 z-50 min-w-[140px] rounded-xl border border-[var(--border-color)] bg-[var(--dropdown-bg)] p-1.5 shadow-lg">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                theme === option.value
                  ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                  : 'text-[var(--text-primary)] hover:bg-[var(--card-bg)]'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
              {theme === option.value && (
                <span className="ml-auto">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
