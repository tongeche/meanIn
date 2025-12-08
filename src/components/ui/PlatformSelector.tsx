import type { Platform } from "@/lib/types";
import { cn } from "@/lib/utils";

const PLATFORMS: Array<{ value: Platform; label: string; hint: string }> = [
  {
    value: "whatsapp-status",
    label: "WhatsApp",
    hint: "Primary",
  },
  {
    value: "instagram-story",
    label: "Instagram",
    hint: "Story",
  },
  {
    value: "tiktok-story",
    label: "TikTok",
    hint: "Story",
  },
];

type PlatformSelectorProps = {
  value: Platform;
  onChange: (value: Platform) => void;
};

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {PLATFORMS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              isActive
                ? "border-[var(--electric-blue)] bg-[var(--deep-slate)] text-[var(--soft-white)] shadow-[0_0_0_1px_rgba(63,140,255,0.35)]"
                : "border-white/10 bg-white/5 text-[var(--fog-grey)] hover:border-white/30 hover:text-[var(--soft-white)]",
            )}
            aria-pressed={isActive}
          >
            <span className="mr-1">{option.label}</span>
            <span className="text-xs text-[var(--fog-grey)]">{option.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
