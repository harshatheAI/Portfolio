import type { Metadata } from "next";
import { MapPinned } from "lucide-react";
import { LiveTracker } from "@/components/tracking/live-tracker";

export const metadata: Metadata = { title: "Track your move" };

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="bg-[var(--surface-2)] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-50)] px-3 py-1 text-sm font-semibold text-[var(--color-forest-700)]">
            <MapPinned className="h-3.5 w-3.5" /> Live move tracking
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Tracking <span className="font-mono">{id}</span>
          </h1>
        </div>
        <LiveTracker reference={id} />
      </div>
    </div>
  );
}
