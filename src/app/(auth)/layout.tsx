import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { company } from "@/lib/brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--surface-2)]">
      <header className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6">
        <Link href="/" aria-label={company.name}><Logo /></Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-8">{children}</main>
      <footer className="py-6 text-center text-xs text-[var(--text-muted)]">
        © {new Date().getFullYear()} {company.name} · Licensed & insured
      </footer>
    </div>
  );
}
