import { redirect } from "next/navigation";
import type { Metadata } from "next";
import {
  MapPinned, CalendarCheck, Clock, Truck, MapPin, ArrowRight, FileText, Plus, PackageOpen, CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate, parseJson } from "@/lib/utils";
import { isActive, type MoveStatus } from "@/lib/tracking";
import type { Tier } from "@/lib/pricing";

export const metadata: Metadata = { title: "My moves" };

const statusLabel: Record<string, string> = {
  CONFIRMED: "Confirmed", SCHEDULED: "Scheduled", CREW_ASSIGNED: "Crew assigned",
  EN_ROUTE: "Crew en route", LOADING: "Loading", IN_TRANSIT: "In transit",
  UNLOADING: "Unloading", COMPLETED: "Completed", CANCELLED: "Cancelled",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/dashboard");
  if (session.user.role === "ADMIN") redirect("/admin");

  const [bookings, openQuotes] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: session.user.id },
      include: { quote: true, crew: true },
      orderBy: { scheduledDate: "asc" },
    }),
    prisma.quote.findMany({
      where: { userId: session.user.id, status: { in: ["SENT", "ACCEPTED"] }, booking: null },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const upcoming = bookings.filter((b) => b.status !== "COMPLETED" && b.status !== "CANCELLED");
  const past = bookings.filter((b) => b.status === "COMPLETED" || b.status === "CANCELLED");
  const firstName = session.user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back, {firstName} 👋</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Manage your moves, quotes and tracking all in one place.</p>
        </div>
        <ButtonLink href="/quote" variant="accent"><Plus className="h-4 w-4" /> New quote</ButtonLink>
      </div>

      {/* Upcoming */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold">Upcoming moves</h2>
        {upcoming.length === 0 ? (
          <div className="card p-8 text-center shadow-card">
            <Truck className="mx-auto h-8 w-8 text-[var(--text-muted)]" />
            <p className="mt-2 font-medium">No moves booked yet</p>
            <p className="text-sm text-[var(--text-secondary)]">Get an instant quote and lock in your date in minutes.</p>
            <ButtonLink href="/quote" variant="primary" className="mt-4">Get instant quote</ButtonLink>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((b) => (
              <div key={b.id} className="card p-5 shadow-card">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold">{b.reference}</span>
                      <Badge variant={isActive(b.status as MoveStatus) ? "forest" : "neutral"}>{statusLabel[b.status]}</Badge>
                    </div>
                    <div className="mt-2 grid gap-1.5 text-sm text-[var(--text-secondary)] sm:grid-cols-2">
                      <span className="inline-flex items-center gap-1.5"><CalendarCheck className="h-4 w-4 text-[var(--color-forest-500)]" /> {formatDate(b.scheduledDate)}</span>
                      <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-[var(--color-forest-500)]" /> {b.timeSlot}</span>
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-[var(--color-forest-500)]" /> {b.quote.originAddress}</span>
                      <span className="inline-flex items-center gap-1.5"><Truck className="h-4 w-4 text-[var(--color-honey-500)]" /> {b.quote.destAddress}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{formatMoney(b.totalAmount)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatMoney(b.balanceAmount)} due on move day</p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4">
                  <ButtonLink href={`/track/${b.reference}`} variant="primary" size="sm"><MapPinned className="h-4 w-4" /> Track move</ButtonLink>
                  <ButtonLink href={`/quote/${b.quoteId}`} variant="outline" size="sm"><FileText className="h-4 w-4" /> View quote</ButtonLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open quotes */}
      {openQuotes.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">Saved quotes</h2>
          <div className="space-y-3">
            {openQuotes.map((q) => {
              const tiers = parseJson<Tier[]>(q.tiers, []);
              const from = tiers[0]?.price;
              return (
                <div key={q.id} className="card flex flex-wrap items-center justify-between gap-4 p-4 shadow-card">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--color-honey-50)] text-[var(--color-honey-600)]"><PackageOpen className="h-5 w-5" /></span>
                    <div>
                      <p className="text-sm font-semibold">{q.originAddress} → {q.destAddress}</p>
                      <p className="text-xs text-[var(--text-muted)]">{q.reference} · from {from ? formatMoney(from) : "—"}</p>
                    </div>
                  </div>
                  <ButtonLink href={`/quote/${q.id}`} variant="accent" size="sm">Book now <ArrowRight className="h-4 w-4" /></ButtonLink>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Past */}
      {past.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold">Move history</h2>
          <div className="space-y-3">
            {past.map((b) => (
              <div key={b.id} className="card flex flex-wrap items-center justify-between gap-4 p-4 shadow-card opacity-90">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface-3)] text-[var(--text-secondary)]"><CheckCircle2 className="h-5 w-5" /></span>
                  <div>
                    <p className="text-sm font-semibold">{b.quote.originAddress} → {b.quote.destAddress}</p>
                    <p className="text-xs text-[var(--text-muted)]">{b.reference} · {formatDate(b.scheduledDate)} · {statusLabel[b.status]}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{formatMoney(b.totalAmount)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
