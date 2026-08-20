import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CheckCircle2, CalendarCheck, Clock, MapPin, Truck, Users, CreditCard,
  MapPinned, Mail, Phone, PartyPopper, ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatMoney, formatDate } from "@/lib/utils";
import { company } from "@/lib/brand";

export const metadata: Metadata = { title: "Booking confirmed" };

export default async function ConfirmationPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params;
  const booking = await prisma.booking.findFirst({
    where: { reference: ref },
    include: { quote: true, crew: true, payment: true },
  });
  if (!booking) notFound();

  const tierName = { basic: "Essential", standard: "Complete", premium: "White-Glove" }[booking.selectedTier] ?? booking.selectedTier;

  return (
    <div className="bg-[var(--surface-2)] py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-forest-100)] text-[var(--color-forest-600)]">
            <PartyPopper className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">You&apos;re booked! 🎉</h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            Thanks{booking.quote.contactName ? `, ${booking.quote.contactName.split(" ")[0]}` : ""}! A confirmation is on its way to your email.
            Your booking reference is <span className="font-mono font-semibold text-[var(--foreground)]">{booking.reference}</span>.
          </p>
        </div>

        <div className="mt-8 card p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Move details</h2>
            <Badge variant="forest" size="md">{tierName} service</Badge>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Detail icon={CalendarCheck} label="Date" value={formatDate(booking.scheduledDate)} />
            <Detail icon={Clock} label="Arrival window" value={booking.timeSlot} />
            <Detail icon={MapPin} label="Pickup" value={booking.quote.originAddress} />
            <Detail icon={Truck} label="Destination" value={booking.quote.destAddress} />
            {booking.crew && <Detail icon={Users} label="Your crew" value={`${booking.crew.name} · lead ${booking.crew.lead}`} />}
            <Detail icon={CheckCircle2} label="Status" value="Confirmed" />
          </div>

          <div className="mt-6 rounded-xl bg-[var(--surface-2)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="h-4 w-4 text-[var(--color-forest-500)]" /> Payment</div>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Total move cost</dt><dd className="font-medium tabular-nums">{formatMoney(booking.totalAmount)}</dd></div>
              <div className="flex justify-between text-[var(--color-forest-700)]"><dt className="font-semibold">Deposit paid {booking.payment?.last4 ? `(•••• ${booking.payment.last4})` : ""}</dt><dd className="font-bold tabular-nums">{formatMoney(booking.depositAmount)}</dd></div>
              <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Balance due on move day</dt><dd className="font-medium tabular-nums">{formatMoney(booking.balanceAmount)}</dd></div>
            </dl>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={`/track/${booking.reference}`} variant="primary" size="lg" className="flex-1">
              <MapPinned className="h-4 w-4" /> Track my move
            </ButtonLink>
            <ButtonLink href="/dashboard" variant="outline" size="lg" className="flex-1">
              Go to my dashboard <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>

        {/* What's next */}
        <div className="mt-6 card p-6 shadow-card">
          <h2 className="text-lg font-bold">What happens next</h2>
          <ol className="mt-4 space-y-3">
            {[
              "We'll review your inventory and email a confirmation with your crew details.",
              "A coordinator may call to nail down parking, access and any specialty items.",
              "The day before, you'll get a reminder with your arrival window.",
              "On move day, use your tracking link to watch your crew's status and ETA in real time.",
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--color-forest-50)] text-xs font-bold text-[var(--color-forest-700)]">{i + 1}</span>
                <span className="text-[var(--text-secondary)]">{s}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-4 border-t border-[var(--border)] pt-4 text-sm">
            <span className="text-[var(--text-muted)]">Questions?</span>
            <a href={company.phoneHref} className="inline-flex items-center gap-1.5 font-medium text-[var(--color-forest-700)]"><Phone className="h-4 w-4" /> {company.phone}</a>
            <a href={`mailto:${company.email}`} className="inline-flex items-center gap-1.5 font-medium text-[var(--color-forest-700)]"><Mail className="h-4 w-4" /> {company.email}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-forest-50)] text-[var(--color-forest-600)]"><Icon className="h-4.5 w-4.5" /></span>
      <div>
        <p className="text-xs text-[var(--text-muted)]">{label}</p>
        <p className="font-medium text-[var(--foreground)]">{value}</p>
      </div>
    </div>
  );
}
