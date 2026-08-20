"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  CalendarCheck, Clock, CreditCard, Lock, Loader2, CheckCircle2, User, MapPin, Truck,
  ShieldCheck, Info, ChevronRight, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/field";
import { cn, formatMoney } from "@/lib/utils";
import type { Tier } from "@/lib/pricing";
import type { DayAvailability } from "@/lib/availability";

interface QuoteLite {
  id: string;
  reference: string;
  originAddress: string;
  destAddress: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  tiers: Tier[];
}

export function BookingFlow({
  quote,
  initialTier,
  loggedIn,
  userName,
  userEmail,
}: {
  quote: QuoteLite;
  initialTier: string;
  loggedIn: boolean;
  userName?: string | null;
  userEmail?: string | null;
}) {
  const router = useRouter();
  const [tierId, setTierId] = useState(initialTier);
  const tier = quote.tiers.find((t) => t.id === tierId) ?? quote.tiers[0];

  const [days, setDays] = useState<DayAvailability[]>([]);
  const [loadingDays, setLoadingDays] = useState(true);
  const [selDate, setSelDate] = useState<string>("");
  const [selSlot, setSelSlot] = useState<string>("");

  const [name, setName] = useState(userName || quote.contactName || "");
  const [email, setEmail] = useState(userEmail || quote.contactEmail || "");
  const [phone, setPhone] = useState(quote.contactPhone || "");
  const [password, setPassword] = useState("");

  const [card, setCard] = useState("");
  const [cardName, setCardName] = useState(quote.contactName || "");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/availability")
      .then((r) => r.json())
      .then((j) => {
        const openDays: DayAvailability[] = (j.data || []).filter((d: DayAvailability) => d.isOpen);
        setDays(openDays);
        const firstOpen = openDays.find((d) => d.slots.some((s) => s.booked < s.capacity));
        if (firstOpen) {
          setSelDate(firstOpen.date);
          const s = firstOpen.slots.find((x) => x.booked < x.capacity);
          if (s) setSelSlot(s.id);
        }
      })
      .finally(() => setLoadingDays(false));
  }, []);

  const currentDay = days.find((d) => d.date === selDate);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!selDate || !selSlot) e.slot = "Pick a date and arrival window.";
    if (name.trim().length < 2) e.name = "Enter your name.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) e.email = "Enter a valid email.";
    if (!loggedIn && password.length < 8) e.password = "Create a password (8+ characters).";
    if (card.replace(/\D/g, "").length < 12) e.card = "Enter a valid card number.";
    if (cardName.trim().length < 2) e.cardName = "Name on card is required.";
    if (expiry.replace(/\D/g, "").length < 4) e.expiry = "MM/YY";
    if (cvc.replace(/\D/g, "").length < 3) e.cvc = "CVC";
    setErrs(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: quote.id,
          selectedTier: tierId,
          scheduledDate: selDate,
          timeSlot: selSlot,
          name, email, phone,
          password: loggedIn ? undefined : password,
          cardNumber: card, cardName, cardExpiry: expiry, cardCvc: cvc,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.needsLogin) {
          setError("You already have an account with this email — please sign in first, then come back to finish booking.");
        } else {
          setError(json.error || "We couldn't complete your booking. Please try again.");
        }
        setSubmitting(false);
        return;
      }
      // Auto sign-in newly created customers, then go to confirmation.
      if (!loggedIn && password) {
        await signIn("credentials", { email, password, redirect: false });
      }
      router.push(`/booking/${json.data.reference}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
      {/* Left: form */}
      <div className="space-y-6">
        {/* Date & time */}
        <Section step={1} icon={CalendarCheck} title="Pick your date & arrival window">
          {loadingDays ? (
            <div className="flex items-center gap-2 py-6 text-[var(--text-muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading availability…</div>
          ) : (
            <>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {days.slice(0, 16).map((d) => {
                  const full = d.slots.every((s) => s.booked >= s.capacity);
                  const active = d.date === selDate;
                  return (
                    <button
                      key={d.date}
                      type="button"
                      disabled={full}
                      onClick={() => { setSelDate(d.date); const s = d.slots.find((x) => x.booked < x.capacity); setSelSlot(s?.id ?? ""); }}
                      className={cn(
                        "flex min-w-[76px] shrink-0 flex-col items-center rounded-xl border px-3 py-2.5 transition-colors",
                        active ? "border-[var(--color-forest-500)] bg-[var(--color-forest-50)] ring-1 ring-[var(--color-forest-500)]" : "border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
                        full && "cursor-not-allowed opacity-40",
                      )}
                    >
                      <span className="text-xs font-medium text-[var(--text-muted)]">{d.label.split(",")[0]}</span>
                      <span className="text-lg font-bold">{d.label.split(" ").pop()}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{d.label.split(" ")[1]}</span>
                    </button>
                  );
                })}
              </div>
              {currentDay && (
                <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {currentDay.slots.map((s) => {
                    const full = s.booked >= s.capacity;
                    const active = s.id === selSlot;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        disabled={full}
                        onClick={() => setSelSlot(s.id)}
                        className={cn(
                          "rounded-xl border px-2 py-2.5 text-center text-sm font-medium transition-colors",
                          active ? "border-[var(--color-forest-500)] bg-[var(--color-forest-600)] text-white" : "border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
                          full && "cursor-not-allowed opacity-40",
                        )}
                      >
                        {s.label}
                        {full && <span className="block text-[10px]">Full</span>}
                      </button>
                    );
                  })}
                </div>
              )}
              <FieldError>{errs.slot}</FieldError>
            </>
          )}
        </Section>

        {/* Account */}
        <Section step={2} icon={User} title={loggedIn ? "Your account" : "Create your account"}>
          {loggedIn && <p className="mb-3 text-sm text-[var(--text-secondary)]">Booking under {userEmail}. Your move will appear in your dashboard.</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="b-name">Full name</Label>
              <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} />
              <FieldError>{errs.name}</FieldError>
            </div>
            <div>
              <Label htmlFor="b-phone" hint="Optional">Phone</Label>
              <Input id="b-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="b-email">Email</Label>
              <Input id="b-email" type="email" value={email} disabled={loggedIn} onChange={(e) => setEmail(e.target.value)} />
              <FieldError>{errs.email}</FieldError>
            </div>
            {!loggedIn && (
              <div>
                <Label htmlFor="b-pass">Create a password</Label>
                <Input id="b-pass" type="password" placeholder="8+ characters" value={password} onChange={(e) => setPassword(e.target.value)} />
                <FieldError>{errs.password}</FieldError>
              </div>
            )}
          </div>
        </Section>

        {/* Payment */}
        <Section step={3} icon={CreditCard} title="Secure your booking with a deposit">
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-secondary)]">
            <Lock className="h-3.5 w-3.5" /> Demo checkout — no real card is charged. Only the {formatMoney(tier.deposit)} deposit is due now.
          </div>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="c-num">Card number</Label>
              <Input id="c-num" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card} onChange={(e) => setCard(e.target.value)} />
              <FieldError>{errs.card}</FieldError>
            </div>
            <div>
              <Label htmlFor="c-name">Name on card</Label>
              <Input id="c-name" value={cardName} onChange={(e) => setCardName(e.target.value)} />
              <FieldError>{errs.cardName}</FieldError>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="c-exp">Expiry</Label>
                <Input id="c-exp" placeholder="MM/YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
                <FieldError>{errs.expiry}</FieldError>
              </div>
              <div>
                <Label htmlFor="c-cvc">CVC</Label>
                <Input id="c-cvc" inputMode="numeric" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
                <FieldError>{errs.cvc}</FieldError>
              </div>
            </div>
          </div>
        </Section>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}
      </div>

      {/* Right: sticky summary */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="card p-5 shadow-card">
          <h3 className="font-bold">Order summary</h3>

          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-forest-500)]" /><span className="text-[var(--text-secondary)]">{quote.originAddress}</span></div>
            <div className="flex items-start gap-2"><Truck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-honey-500)]" /><span className="text-[var(--text-secondary)]">{quote.destAddress}</span></div>
            {selDate && selSlot && (
              <div className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-forest-500)]" /><span className="text-[var(--text-secondary)]">{days.find((d) => d.date === selDate)?.label} · {selSlot}</span></div>
            )}
          </div>

          {/* Tier switch */}
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Service level</p>
            <div className="space-y-2">
              {quote.tiers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTierId(t.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
                    t.id === tierId ? "border-[var(--color-forest-500)] bg-[var(--color-forest-50)] ring-1 ring-[var(--color-forest-500)]" : "border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className={cn("grid h-4 w-4 place-items-center rounded-full border", t.id === tierId ? "border-[var(--color-forest-600)] bg-[var(--color-forest-600)]" : "border-[var(--border-strong)]")}>
                      {t.id === tierId && <CheckCircle2 className="h-3 w-3 text-white" />}
                    </span>
                    <span className="text-sm font-semibold">{t.name}</span>
                    {t.recommended && <Star className="h-3.5 w-3.5 fill-[var(--color-honey-400)] text-[var(--color-honey-400)]" />}
                  </span>
                  <span className="text-sm font-bold tabular-nums">{formatMoney(t.price)}</span>
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-4 space-y-1.5 border-t border-[var(--border)] pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Total move cost</dt><dd className="font-medium tabular-nums">{formatMoney(tier.price)}</dd></div>
            <div className="flex justify-between text-[var(--color-forest-700)]"><dt className="font-semibold">Deposit due today</dt><dd className="font-bold tabular-nums">{formatMoney(tier.deposit)}</dd></div>
            <div className="flex justify-between"><dt className="text-[var(--text-secondary)]">Balance on move day</dt><dd className="font-medium tabular-nums">{formatMoney(tier.balance)}</dd></div>
          </dl>

          <Button variant="accent" size="lg" className="mt-4 w-full" onClick={submit} disabled={submitting}>
            {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Confirming…</>) : (<>Pay {formatMoney(tier.deposit)} & confirm <ChevronRight className="h-4 w-4" /></>)}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-muted)]">
            <ShieldCheck className="h-3.5 w-3.5" /> Refundable up to 48h before your move.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ step, icon: Icon, title, children }: { step: number; icon: typeof User; title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-forest-600)] text-sm font-bold text-white">{step}</span>
        <h2 className="flex items-center gap-2 text-lg font-bold"><Icon className="h-5 w-5 text-[var(--color-forest-500)]" /> {title}</h2>
      </div>
      {children}
    </div>
  );
}
