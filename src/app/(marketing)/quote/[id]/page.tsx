import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Sparkles, MapPin, Truck, Home, Boxes, Users, Clock, CheckCircle2, ArrowRight,
  ShieldCheck, Camera, Route, Weight, CalendarCheck,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parseJson, formatMoney } from "@/lib/utils";
import { homeSizes } from "@/lib/brand";
import type { QuoteBreakdown, Tier, LineItem } from "@/lib/pricing";
import type { InventoryItem } from "@/lib/ai/quote";

export default async function QuoteResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { OR: [{ id }, { reference: id }] },
    include: { booking: { select: { reference: true } } },
  });
  if (!quote) notFound();

  const breakdown = parseJson<QuoteBreakdown | null>(quote.breakdown, null);
  const tiers = parseJson<Tier[]>(quote.tiers, []);
  const items = parseJson<InventoryItem[]>(quote.items, []);
  const homeLabel = homeSizes.find((h) => h.value === quote.homeSize)?.label ?? quote.homeSize;
  const photoCount = parseJson<unknown[]>(quote.photos, []).length;

  return (
    <div className="bg-[var(--surface-2)] py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-forest-50)] px-3 py-1 text-sm font-semibold text-[var(--color-forest-700)]">
              <Sparkles className="h-3.5 w-3.5" /> Your instant quote is ready
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Choose your service level</h1>
            <p className="mt-1.5 text-[var(--text-secondary)]">
              Quote <span className="font-mono font-semibold text-[var(--foreground)]">{quote.reference}</span> ·
              {" "}valid {quote.expiresAt ? `until ${new Date(quote.expiresAt).toLocaleDateString()}` : "14 days"}
            </p>
          </div>
          <Badge variant={quote.aiConfidence === "vision" ? "success" : "honey"} size="md">
            {quote.aiConfidence === "vision" ? <><Camera className="h-3.5 w-3.5" /> AI photo estimate</> : <><Sparkles className="h-3.5 w-3.5" /> Smart estimate</>}
          </Badge>
        </div>

        {quote.booking && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-[var(--color-forest-200)] bg-[var(--color-forest-50)] p-4">
            <p className="text-sm font-medium text-[var(--color-forest-800)]">This quote is already booked ({quote.booking.reference}).</p>
            <ButtonLink href={`/track/${quote.booking.reference}`} variant="primary" size="sm">Track move</ButtonLink>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Tiers */}
          <div className="order-2 space-y-4 lg:order-1">
            {tiers.map((t) => (
              <div key={t.id} className={`card p-5 sm:p-6 ${t.recommended ? "ring-2 ring-[var(--color-forest-500)] shadow-lift" : "shadow-card"}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-[var(--color-forest-800)]">{t.name}</h3>
                      {t.recommended && <Badge variant="solid" size="sm">Most popular</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{t.tagline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold">{formatMoney(t.price)}</p>
                    <p className="text-xs text-[var(--text-muted)]">{formatMoney(t.deposit)} deposit today</p>
                  </div>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {t.inclusions.map((inc) => (
                    <li key={inc} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-forest-500)]" />
                      <span className="text-[var(--text-secondary)]">{inc}</span>
                    </li>
                  ))}
                </ul>
                <ButtonLink
                  href={quote.booking ? `/track/${quote.booking.reference}` : `/book/${quote.id}?tier=${t.id}`}
                  variant={t.recommended ? "primary" : "outline"}
                  className="mt-5 w-full"
                >
                  {quote.booking ? "Already booked" : <>Select {t.name} & schedule <ArrowRight className="h-4 w-4" /></>}
                </ButtonLink>
              </div>
            ))}
          </div>

          {/* Summary sidebar */}
          <div className="order-1 space-y-4 lg:order-2">
            <div className="card p-5 shadow-card">
              <h3 className="font-bold">Move summary</h3>
              <div className="mt-3 space-y-2.5 text-sm">
                <SummaryRow icon={MapPin} label="From" value={quote.originAddress} />
                <SummaryRow icon={Truck} label="To" value={quote.destAddress} />
                <SummaryRow icon={Route} label="Distance" value={`~${Math.round(quote.distanceMiles)} miles`} />
                <SummaryRow icon={Home} label="Home size" value={homeLabel} />
                <SummaryRow icon={Boxes} label="Est. volume" value={`${Math.round(quote.estimatedVolumeCuFt).toLocaleString()} cu ft`} />
                <SummaryRow icon={Weight} label="Est. weight" value={`${Math.round(quote.estimatedWeightLbs).toLocaleString()} lbs`} />
                <SummaryRow icon={Users} label="Crew" value={`${quote.crewSize} movers`} />
                <SummaryRow icon={Clock} label="Est. time" value={`${quote.laborHours} hours`} />
                {quote.preferredDate && (
                  <SummaryRow icon={CalendarCheck} label="Preferred" value={new Date(quote.preferredDate).toLocaleDateString()} />
                )}
              </div>
              {quote.aiSummary && (
                <div className="mt-4 rounded-xl bg-[var(--color-forest-50)] p-3.5 text-sm leading-relaxed text-[var(--color-forest-800)]">
                  <Sparkles className="mb-1 inline h-3.5 w-3.5" /> {quote.aiSummary}
                </div>
              )}
              {photoCount > 0 && (
                <p className="mt-2 text-xs text-[var(--text-muted)]">Estimate informed by {photoCount} photo{photoCount > 1 ? "s" : ""} you shared.</p>
              )}
            </div>

            {items.length > 0 && (
              <div className="card p-5 shadow-card">
                <h3 className="font-bold">Detected inventory</h3>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {items.slice(0, 12).map((it, i) => (
                    <li key={i} className="flex items-center justify-between gap-3">
                      <span className="text-[var(--text-secondary)]">{it.name}{it.bulky ? " · bulky" : ""}</span>
                      <span className="font-medium tabular-nums">×{it.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {breakdown && (
              <div className="card p-5 shadow-card">
                <h3 className="font-bold">How we priced it</h3>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Base move cost — service tiers build on this.</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {breakdown.lineItems.map((li: LineItem, i) => (
                    <li key={i} className="flex items-start justify-between gap-3">
                      <span>
                        <span className="text-[var(--text-secondary)]">{li.label}</span>
                        {li.detail && <span className="block text-xs text-[var(--text-muted)]">{li.detail}</span>}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">{formatMoney(li.amount)}</span>
                    </li>
                  ))}
                  {breakdown.addonItems.map((li: LineItem, i) => (
                    <li key={`a${i}`} className="flex items-start justify-between gap-3">
                      <span>
                        <span className="text-[var(--text-secondary)]">{li.label}</span>
                        {li.detail && <span className="block text-xs text-[var(--text-muted)]">{li.detail}</span>}
                      </span>
                      <span className="shrink-0 font-medium tabular-nums">{formatMoney(li.amount)}</span>
                    </li>
                  ))}
                  <li className="flex items-center justify-between border-t border-[var(--border)] pt-2 font-semibold">
                    <span>Base subtotal</span>
                    <span className="tabular-nums">{formatMoney(breakdown.baseSubtotal + breakdown.addonsTotal)}</span>
                  </li>
                </ul>
              </div>
            )}

            <p className="flex items-center justify-center gap-2 text-center text-xs text-[var(--text-muted)]">
              <ShieldCheck className="h-3.5 w-3.5" /> Deposit is refundable up to 48h before your move.
            </p>
            <Link href="/quote" className="block text-center text-sm font-medium text-[var(--color-forest-700)] hover:underline">
              ← Start a new quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-forest-500)]" />
      <span className="w-20 shrink-0 text-[var(--text-muted)]">{label}</span>
      <span className="flex-1 font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}
