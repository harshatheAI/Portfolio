"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How accurate is the instant quote?",
    a: "Very. Our system analyzes your home size, item list, and photos to estimate volume, crew size, and hours — then prices it against our published rates. It's a real, itemized quote, not a vague range. We confirm the details with a quick call before your move, and your locked-in price won't change unless your inventory does.",
  },
  {
    q: "Why do you ask for photos?",
    a: "Photos let us size up bulky and specialty items (sectionals, appliances, pianos) so your quote is accurate and there are no surprises on move day. They're optional — you can also just describe your items — but photos give you the tightest estimate.",
  },
  {
    q: "How much is the deposit and is it refundable?",
    a: "We take a small deposit (20% of your total) to lock in your crew and date. It's applied to your final bill, and it's fully refundable up to 48 hours before your move. The remaining balance is due on move day after everything's unloaded.",
  },
  {
    q: "Can I really track my movers in real time?",
    a: "Yes. Once your move is underway you'll get a live tracking link showing your crew's status and ETA — from 'crew en route' through 'in transit' to 'move complete' — so you're never left wondering.",
  },
  {
    q: "What areas do you serve?",
    a: "We're based in Asheville and cover the surrounding region, plus long-distance moves across the country. Enter your addresses in the quote tool and we'll confirm coverage instantly.",
  },
  {
    q: "Are you licensed and insured?",
    a: "Absolutely. We're a fully licensed and insured moving company, and every crew member is background-checked and trained. Every move includes liability coverage, with full-value protection available as an upgrade.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
              aria-expanded={isOpen}
            >
              <span className="text-base font-semibold text-[var(--foreground)]">{f.q}</span>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--surface-2)] text-[var(--color-forest-600)]">
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
            <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[15px] leading-relaxed text-[var(--text-secondary)] sm:px-6">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
