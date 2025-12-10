'use client';

import { cn } from "@/lib/utils";
import type { ReactNode, TextareaHTMLAttributes } from "react";
import { useEffect, useRef } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  maxRows?: number;
  prefix?: ReactNode;
  suffix?: ReactNode;
};

export function TextArea({
  label,
  hint,
  className,
  maxRows = 4,
  value,
  prefix,
  suffix,
  ...props
}: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const rowHeight = 24;
  const maxHeight = rowHeight * maxRows;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, [value, maxHeight]);

  return (
    <label className="flex w-full min-w-0 flex-col gap-2">
      {label && <span className="text-sm text-[var(--text-secondary)]">{label}</span>}
      <div className="flex w-full min-w-0 items-start gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-3 sm:px-4">
        {prefix && (
          <span className="pl-1 text-xl font-semibold text-[var(--text-primary)]">
            {prefix}
          </span>
        )}
        <textarea
          ref={ref}
          rows={2}
          value={value}
          className={cn(
            "w-full min-w-0 resize-none border-0 bg-transparent text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-0",
            "leading-6",
            className,
          )}
          {...props}
        />
        {suffix && <div className="flex items-center gap-3 self-end">{suffix}</div>}
      </div>
      {hint && <span className="text-sm text-[var(--text-secondary)]">{hint}</span>}
    </label>
  );
}
