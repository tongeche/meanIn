import { cn } from "@/lib/utils";

type LoadingShimmerProps = {
  className?: string;
};

export function LoadingShimmer({ className }: LoadingShimmerProps) {
  return (
    <div
      className={cn(
        "h-24 w-full animate-pulse rounded-lg bg-gradient-to-r from-white/5 via-white/10 to-white/5",
        className,
      )}
    />
  );
}
