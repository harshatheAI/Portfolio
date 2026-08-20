import * as React from "react";
import { cn } from "@/lib/utils";

const baseField =
  "w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 text-[15px] text-[var(--foreground)] placeholder:text-[var(--text-muted)] transition-colors focus:border-[var(--color-forest-500)] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest-500)]/25 disabled:opacity-60";

export function Label({
  className,
  children,
  hint,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { hint?: string }) {
  return (
    <label className={cn("mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--foreground)]", className)} {...props}>
      <span>{children}</span>
      {hint ? <span className="text-xs font-normal text-[var(--text-muted)]">{hint}</span> : null}
    </label>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(baseField, "h-11", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(baseField, "py-3 min-h-[110px] resize-y", className)} {...props} />;
});

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(baseField, "h-11 appearance-none pr-10 bg-[right_0.75rem_center] bg-no-repeat", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238b8378' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
});

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-sm text-[var(--danger)]">{children}</p>;
}
