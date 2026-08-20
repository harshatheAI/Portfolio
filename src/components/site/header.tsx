"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Phone, Menu, X, MapPin, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink, Button } from "@/components/ui/button";
import { company } from "@/lib/brand";
import { cn } from "@/lib/utils";

const nav = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Services", href: "/#services" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Reviews", href: "/#reviews" },
  { label: "Track my move", href: "/track" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0" aria-label={company.name}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--foreground)]"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a
            href={company.phoneHref}
            className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-forest-700)]"
          >
            <Phone className="h-4 w-4" />
            {company.phone}
          </a>
          {session?.user ? (
            <>
              <ButtonLink href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"} variant="outline" size="sm">
                <LayoutDashboard className="h-4 w-4" />
                {session.user.role === "ADMIN" ? "Admin" : "My moves"}
              </ButtonLink>
              <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/" })} aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <ButtonLink href="/sign-in" variant="ghost" size="sm">
              Sign in
            </ButtonLink>
          )}
          <ButtonLink href="/quote" variant="accent" size="sm">
            Get instant quote
          </ButtonLink>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--foreground)] lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={cn("lg:hidden overflow-hidden border-t border-[var(--border)] bg-[var(--background)] transition-all", open ? "max-h-[420px]" : "max-h-0")}>
        <div className="space-y-1 px-4 py-4">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-base font-medium text-[var(--foreground)] hover:bg-[var(--surface-2)]"
            >
              {n.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-3">
            <a href={company.phoneHref} className="inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold text-[var(--color-forest-700)]">
              <Phone className="h-4 w-4" /> {company.phone}
            </a>
            <span className="inline-flex items-center gap-2 px-3 text-xs text-[var(--text-muted)]">
              <MapPin className="h-3.5 w-3.5" /> Serving {company.address.city} + {company.serviceAreas.length - 1} nearby areas
            </span>
            {session?.user ? (
              <ButtonLink href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"} variant="outline" onClick={() => setOpen(false)}>
                {session.user.role === "ADMIN" ? "Admin dashboard" : "My moves"}
              </ButtonLink>
            ) : (
              <ButtonLink href="/sign-in" variant="outline" onClick={() => setOpen(false)}>
                Sign in
              </ButtonLink>
            )}
            <ButtonLink href="/quote" variant="accent" onClick={() => setOpen(false)}>
              Get instant quote
            </ButtonLink>
          </div>
        </div>
      </div>
    </header>
  );
}
