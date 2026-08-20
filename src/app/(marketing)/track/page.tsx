"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPinned, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export default function TrackLanding() {
  const router = useRouter();
  const [ref, setRef] = useState("");

  function go(e: React.FormEvent) {
    e.preventDefault();
    if (ref.trim()) router.push(`/track/${ref.trim().toUpperCase()}`);
  }

  return (
    <div className="bg-[var(--surface-2)] py-16 sm:py-24">
      <div className="mx-auto max-w-md px-4 text-center sm:px-6">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-forest text-white">
          <MapPinned className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-3xl font-extrabold tracking-tight">Track your move</h1>
        <p className="mt-2 text-[var(--text-secondary)]">Enter your booking reference to see your crew&apos;s live status and ETA.</p>
        <form onSubmit={go} className="mt-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. BBM-B-7F3K" className="pl-11 uppercase" />
          </div>
          <Button type="submit" variant="primary" size="lg">Track <ArrowRight className="h-4 w-4" /></Button>
        </form>
        <p className="mt-4 text-sm text-[var(--text-muted)]">Your reference is in your confirmation email and on your dashboard.</p>
      </div>
    </div>
  );
}
