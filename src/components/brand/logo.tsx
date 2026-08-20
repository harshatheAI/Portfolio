import { cn } from "@/lib/utils";
import { company } from "@/lib/brand";

/** Bear-face mark inside a rounded badge. Inherits currentColor for the bear. */
export function BearMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="13" fill="var(--color-forest-600)" />
      {/* ears */}
      <circle cx="15" cy="15" r="6" fill="var(--color-honey-300)" />
      <circle cx="33" cy="15" r="6" fill="var(--color-honey-300)" />
      <circle cx="15" cy="15" r="2.6" fill="var(--color-forest-700)" />
      <circle cx="33" cy="15" r="2.6" fill="var(--color-forest-700)" />
      {/* head */}
      <circle cx="24" cy="27" r="13" fill="var(--color-honey-200)" />
      {/* snout */}
      <ellipse cx="24" cy="31" rx="6.5" ry="5" fill="var(--color-honey-50)" />
      {/* eyes */}
      <circle cx="19.5" cy="25" r="1.8" fill="var(--color-forest-900)" />
      <circle cx="28.5" cy="25" r="1.8" fill="var(--color-forest-900)" />
      {/* nose */}
      <ellipse cx="24" cy="29.5" rx="2.4" ry="1.8" fill="var(--color-forest-900)" />
      <path
        d="M24 31.3v2.4M24 33.7c0 1.6 1.7 1.6 1.7 0M24 33.7c0 1.6-1.7 1.6-1.7 0"
        stroke="var(--color-forest-800)"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  showText = true,
  invert = false,
}: {
  className?: string;
  showText?: boolean;
  invert?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BearMark className="h-9 w-9 shrink-0" />
      {showText && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[17px] font-extrabold tracking-tight",
              invert ? "text-white" : "text-[var(--foreground)]",
            )}
          >
            Brother Bear
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-[0.22em]",
              invert ? "text-[var(--color-honey-300)]" : "text-[var(--color-honey-600)]",
            )}
          >
            Moving Co.
          </span>
        </span>
      )}
      <span className="sr-only">{company.name}</span>
    </span>
  );
}
