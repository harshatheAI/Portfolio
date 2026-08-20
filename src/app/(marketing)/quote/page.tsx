import type { Metadata } from "next";
import { QuoteWizard } from "@/components/quote/quote-wizard";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Get your instant moving quote",
  description: "Build a real, itemized moving quote in about two minutes. Describe your items, add photos, and see transparent pricing instantly.",
};

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from = "", to = "" } = await searchParams;

  return (
    <div className="bg-[var(--surface-2)] py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-50)] px-3 py-1 text-sm font-semibold text-[var(--color-forest-700)]">
            <Sparkles className="h-3.5 w-3.5" /> Instant quote
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Let&apos;s price your move</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Answer a few quick questions — get an itemized quote on the spot.</p>
        </div>
        <QuoteWizard initialFrom={from} initialTo={to} />
      </div>
    </div>
  );
}
