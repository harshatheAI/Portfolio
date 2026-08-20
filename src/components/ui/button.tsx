import * as React from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md",
        accent:
          "bg-[var(--accent)] text-[var(--color-forest-900)] hover:bg-[var(--accent-hover)] shadow-sm hover:shadow-md",
        outline:
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--surface-2)]",
        ghost: "text-[var(--foreground)] hover:bg-[var(--surface-2)]",
        subtle:
          "bg-[var(--color-forest-50)] text-[var(--color-forest-700)] hover:bg-[var(--color-forest-100)]",
        white:
          "bg-white text-[var(--color-forest-800)] hover:bg-[var(--color-honey-50)] shadow-sm",
        danger: "bg-[var(--danger)] text-white hover:brightness-95",
        link: "text-[var(--primary)] underline-offset-4 hover:underline rounded-none px-0",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-13 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & { className?: string };

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonBaseProps {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export interface ButtonLinkProps
  extends React.ComponentProps<typeof Link>,
    ButtonBaseProps {}

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { buttonVariants };
