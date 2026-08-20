import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap",
  {
    variants: {
      variant: {
        forest: "bg-[var(--color-forest-50)] text-[var(--color-forest-700)] border border-[var(--color-forest-100)]",
        honey: "bg-[var(--color-honey-50)] text-[var(--color-honey-700)] border border-[var(--color-honey-100)]",
        neutral: "bg-[var(--surface-2)] text-[var(--text-secondary)] border border-[var(--border)]",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border border-amber-100",
        danger: "bg-red-50 text-red-700 border border-red-100",
        solid: "bg-[var(--color-forest-600)] text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: { variant: "neutral", size: "sm" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
