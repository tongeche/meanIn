import type { ReactNode } from "react";

type StoryCardProps = {
  text: string;
  slug: string;
  keyword?: string;
  footer?: ReactNode;
};

export function StoryCard({ text, slug, keyword, footer }: StoryCardProps) {
  return (
    <div className="relative w-full max-w-[440px] md:max-w-[520px] overflow-hidden rounded-lg bg-gradient-to-b from-[#0a0a0f] to-[#1b1b24] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.45)] aspect-[9/16]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 h-36 w-36 -translate-x-16 -translate-y-16 rounded-full bg-[var(--neon-violet)]/10 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-36 w-36 translate-x-12 translate-y-12 rounded-full bg-[var(--electric-blue)]/10 blur-3xl" />
      </div>
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex justify-between text-xs uppercase tracking-[0.18em] text-white/40">
          <span>MeanIn</span>
          <span className="text-[var(--fog-grey)]">Story</span>
        </div>
        <p className="text-center text-2xl font-medium leading-9 text-[var(--soft-white)]">
          <Highlighted text={text} keyword={keyword} />
        </p>
        <div className="flex items-center justify-between text-xs text-[var(--fog-grey)]">
          <span className="text-[var(--neon-violet)]">meanin.com/p/{slug}</span>
          {footer}
        </div>
      </div>
    </div>
  );
}

function Highlighted({ text, keyword }: { text: string; keyword?: string }) {
  if (!keyword) return <>{text}</>;
  const lower = keyword.toLowerCase();
  const safeKeyword = escapeRegExp(keyword);
  const parts = text.split(new RegExp(`(${safeKeyword})`, "i"));

  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === lower ? (
          <span key={`${part}-${index}`} className="text-[var(--neon-violet)]">
            {part}
          </span>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        ),
      )}
    </>
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
