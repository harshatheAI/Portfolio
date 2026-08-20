"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickQuoteBar() {
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/quote${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={go}
      className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] bg-white p-3 shadow-lift sm:flex-row sm:items-center"
    >
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5">
        <MapPin className="h-5 w-5 shrink-0 text-[var(--color-forest-500)]" />
        <input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="Moving from (ZIP or city)"
          className="w-full bg-transparent text-[15px] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none"
        />
      </div>
      <ArrowRight className="hidden h-5 w-5 shrink-0 text-[var(--text-muted)] sm:block" />
      <div className="flex flex-1 items-center gap-2 rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5">
        <Truck className="h-5 w-5 shrink-0 text-[var(--color-honey-500)]" />
        <input
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="Moving to (ZIP or city)"
          className="w-full bg-transparent text-[15px] text-[var(--foreground)] placeholder:text-[var(--text-muted)] focus:outline-none"
        />
      </div>
      <Button type="submit" variant="accent" size="lg" className="shrink-0">
        Get my quote
        <ArrowRight className="h-4 w-4" />
      </Button>
    </form>
  );
}
