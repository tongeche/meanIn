import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  loading,
  disabled,
  fullWidth,
  ...props
}: ButtonProps) {
  const variants: Record<Variant, string> = {
    primary:
      "bg-[var(--electric-blue)] text-white hover:bg-[#5b9eff] shadow-md shadow-black/20",
    secondary:
      "border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--text-primary)]",
    ghost: "text-[var(--text-primary)] hover:opacity-80",
  };

  return (
    <button
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-md px-5 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--electric-blue)]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-primary)]",
        variants[variant],
        fullWidth && "w-full",
        (disabled || loading) && "cursor-not-allowed opacity-60",
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/60 border-t-transparent" />
      )}
      {children}
    </button>
  );
}
