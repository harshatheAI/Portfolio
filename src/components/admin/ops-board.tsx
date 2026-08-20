"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FastForward, Loader2, MapPinned, CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { STAGES, stageIndex, type MoveStatus } from "@/lib/tracking";

const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmed", SCHEDULED: "Scheduled", CREW_ASSIGNED: "Crew assigned",
  EN_ROUTE: "En route", LOADING: "Loading", IN_TRANSIT: "In transit",
  UNLOADING: "Unloading", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

export interface OpsBooking {
  id: string;
  reference: string;
  status: string;
  scheduledDate: string;
  timeSlot: string;
  customer: string;
  origin: string;
  destination: string;
  crew: string | null;
}

export function OpsBoard({ bookings }: { bookings: OpsBooking[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function advance(ref: string) {
    setBusy(ref);
    await fetch(`/api/tracking/${ref}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    router.refresh();
    setBusy(null);
  }

  if (bookings.length === 0) {
    return <p className="py-8 text-center text-sm text-[var(--text-muted)]">No bookings yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
            <th className="py-2.5 pr-4 font-semibold">Booking</th>
            <th className="py-2.5 pr-4 font-semibold">Customer</th>
            <th className="py-2.5 pr-4 font-semibold">Route</th>
            <th className="py-2.5 pr-4 font-semibold">Schedule</th>
            <th className="py-2.5 pr-4 font-semibold">Status</th>
            <th className="py-2.5 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {bookings.map((b) => {
            const done = b.status === "COMPLETED";
            const idx = stageIndex(b.status as MoveStatus);
            const nextTitle = idx < STAGES.length - 1 ? STAGES[idx + 1].title : null;
            return (
              <tr key={b.id} className="align-top">
                <td className="py-3 pr-4">
                  <Link href={`/track/${b.reference}`} className="font-mono font-semibold text-[var(--color-forest-700)] hover:underline">{b.reference}</Link>
                  {b.crew && <p className="text-xs text-[var(--text-muted)]">{b.crew}</p>}
                </td>
                <td className="py-3 pr-4">{b.customer}</td>
                <td className="py-3 pr-4 text-[var(--text-secondary)]">
                  <span className="block max-w-[180px] truncate">{b.origin}</span>
                  <span className="block max-w-[180px] truncate text-xs">→ {b.destination}</span>
                </td>
                <td className="py-3 pr-4 text-[var(--text-secondary)]">
                  <span className="inline-flex items-center gap-1"><CalendarCheck className="h-3.5 w-3.5" /> {formatDate(b.scheduledDate)}</span>
                  <span className="block text-xs"><Clock className="inline h-3 w-3" /> {b.timeSlot}</span>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={done ? "success" : b.status === "CANCELLED" ? "danger" : "forest"}>{statusLabel[b.status]}</Badge>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Link href={`/track/${b.reference}`} className="text-[var(--text-muted)] hover:text-[var(--foreground)]" aria-label="Track"><MapPinned className="h-4 w-4" /></Link>
                    {done ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Done</span>
                    ) : (
                      <Button variant="subtle" size="sm" onClick={() => advance(b.reference)} disabled={busy === b.reference}>
                        {busy === b.reference ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FastForward className="h-3.5 w-3.5" />}
                        {nextTitle ? `→ ${nextTitle}` : "Advance"}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
