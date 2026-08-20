import Link from "next/link";
import {
  Star, ShieldCheck, Truck, Clock, Camera, FileCheck2, CalendarCheck, MapPinned,
  PackageOpen, Home, Building2, Boxes, Warehouse, Piano, Sparkles, BadgeCheck,
  Phone, ArrowRight, CheckCircle2, DollarSign, Users, ThumbsUp,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuickQuoteBar } from "@/components/site/quick-quote-bar";
import { Faq } from "@/components/site/faq";
import { company } from "@/lib/brand";
import { DEFAULT_PRICING, computeQuote } from "@/lib/pricing";

export default function HomePage() {
  // Example tier prices for a representative 2-bed local move (shown on the pricing preview).
  const sample = computeQuote(
    {
      distanceMiles: 18, estimatedVolumeCuFt: 900, laborHours: 4.5, crewSize: 3,
      originFloor: 1, destFloor: 1, originElevator: false, destElevator: false, addons: [],
    },
    DEFAULT_PRICING,
  );

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden text-white">
        <div className="topo absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="animate-fade-up">
              <Badge variant="honey" className="mb-5 bg-white/10 text-[var(--color-honey-200)] backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Instant online quotes — no waiting for a callback
              </Badge>
              <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Your move, <span className="text-gradient-honey">handled with care.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-[var(--color-forest-100)]/90">
                Snap a few photos, get an instant itemized quote, book your crew, and track your move in real time.
                {" "}{company.name} makes moving day the easiest part.
              </p>

              <div className="mt-7 max-w-xl">
                <QuickQuoteBar />
                <p className="mt-2.5 flex items-center gap-2 pl-1 text-sm text-[var(--color-forest-100)]/80">
                  <Clock className="h-4 w-4" /> Takes about 2 minutes · free · no obligation
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="inline-flex items-center gap-2">
                  <Star className="h-4 w-4 fill-[var(--color-honey-300)] text-[var(--color-honey-300)]" />
                  <strong className="font-semibold">{company.rating}</strong> ({company.reviewCount} reviews)
                </span>
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--color-honey-300)]" /> Licensed & insured</span>
                <span className="inline-flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-[var(--color-honey-300)]" /> {company.movesCompleted} moves completed</span>
              </div>
            </div>

            {/* Hero card: mini quote preview */}
            <div className="animate-fade-up lg:justify-self-end" style={{ animationDelay: "0.1s" }}>
              <div className="w-full max-w-sm rounded-3xl border border-white/15 bg-white/95 p-6 text-[var(--foreground)] shadow-lift backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Your instant estimate</span>
                  <Badge variant="success"><span className="pulse-dot inline-block h-2 w-2 rounded-full bg-emerald-500" /> Live</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { label: "2-bedroom home · local", icon: Home },
                    { label: "Crew of 3 · ~4.5 hrs", icon: Users },
                    { label: "Truck, labor & mileage", icon: Truck },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center gap-3 rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5">
                      <r.icon className="h-5 w-5 text-[var(--color-forest-500)]" />
                      <span className="text-sm font-medium">{r.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-2xl border border-[var(--color-forest-100)] bg-[var(--color-forest-50)] p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--color-forest-600)]">From</p>
                      <p className="text-3xl font-extrabold text-[var(--color-forest-800)]">${sample.tiers[0].price.toLocaleString()}</p>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">all-in</span>
                  </div>
                </div>
                <ButtonLink href="/quote" variant="accent" className="mt-4 w-full">
                  Build my real quote <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────── */}
      <section className="border-b border-[var(--border)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: DollarSign, stat: "Upfront", label: "Transparent, itemized pricing" },
            { icon: MapPinned, stat: "Real-time", label: "Live tracking on move day" },
            { icon: BadgeCheck, stat: "Vetted", label: "Background-checked crews" },
            { icon: CalendarCheck, stat: "2 min", label: "Book online, any time" },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--color-forest-50)] text-[var(--color-forest-600)]">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-bold text-[var(--foreground)]">{s.stat}</p>
                <p className="text-sm text-[var(--text-secondary)]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how-it-works" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="From clutter to keys in four simple steps"
          subtitle="We turned the most stressful day into a few taps. No phone tag, no vague estimates, no surprises."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Camera, step: "1", title: "Describe & snap", body: "Tell us your home size and list your items — or just snap a few photos. Our AI sizes up the job." },
            { icon: FileCheck2, step: "2", title: "Get an instant quote", body: "See an itemized, all-in price in seconds with three service tiers to choose from." },
            { icon: CalendarCheck, step: "3", title: "Book & pay deposit", body: "Pick your date and arrival window, create an account, and lock it in with a small refundable deposit." },
            { icon: MapPinned, step: "4", title: "Track your move", body: "Follow your crew live on move day — from en route to delivered — right from your phone." },
          ].map((s) => (
            <div key={s.step} className="card relative p-6 shadow-card transition-shadow hover:shadow-lift">
              <span className="absolute right-5 top-5 text-4xl font-black text-[var(--surface-3)]">{s.step}</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl gradient-forest text-white">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/quote" variant="primary" size="lg">
            Start my instant quote <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────── */}
      <section id="services" className="scroll-mt-20 bg-[var(--surface-2)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Services"
            title="Whatever you're moving, we've got it"
            subtitle="Full-service crews for homes, apartments and offices — plus the specialty care your prized items deserve."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Home, title: "Local moving", body: "Same-city and nearby moves, priced by the job — not a mystery hourly meter." },
              { icon: Truck, title: "Long-distance moving", body: "Cross-state and cross-country relocations with real-time tracking the whole way." },
              { icon: PackageOpen, title: "Packing & unpacking", body: "Let our crew box everything with pro materials — and unpack you at the other end." },
              { icon: Building2, title: "Office & commercial", body: "After-hours and weekend business moves that keep your downtime to a minimum." },
              { icon: Warehouse, title: "Storage solutions", body: "Clean, climate-controlled storage when your move-out and move-in don't line up." },
              { icon: Piano, title: "Specialty items", body: "Pianos, safes, gym equipment, antiques and art — handled with extra hands and care." },
            ].map((s) => (
              <div key={s.title} className="group card p-6 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-honey-50)] text-[var(--color-honey-600)] transition-colors group-hover:bg-[var(--color-honey-100)]">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Transparent pricing"
          title="Three tiers. One honest price."
          subtitle="Pick the level of service that fits. Every tier is fully itemized in your quote — you'll always see exactly what you're paying for."
        />
        <p className="mt-3 text-center text-sm text-[var(--text-muted)]">Example: a 2-bedroom local move · your real quote is tailored to your items.</p>
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {sample.tiers.map((t) => (
            <div
              key={t.id}
              className={`card relative flex flex-col p-7 ${t.recommended ? "shadow-lift ring-2 ring-[var(--color-forest-500)]" : "shadow-card"}`}
            >
              {t.recommended && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-forest-600)] px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-bold text-[var(--color-forest-800)]">{t.name}</h3>
              <p className="mt-1 min-h-[40px] text-sm text-[var(--text-secondary)]">{t.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">${t.price.toLocaleString()}</span>
                <span className="text-sm text-[var(--text-muted)]">est. all-in</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {t.inclusions.map((inc) => (
                  <li key={inc} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-forest-500)]" />
                    <span className="text-[var(--text-secondary)]">{inc}</span>
                  </li>
                ))}
              </ul>
              <ButtonLink href="/quote" variant={t.recommended ? "primary" : "outline"} className="mt-6">
                Get this quote
              </ButtonLink>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why us ───────────────────────────────────────────── */}
      <section className="gradient-forest py-20 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <Badge variant="honey" className="mb-4 bg-white/10 text-[var(--color-honey-200)]">Why {company.shortName}</Badge>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Moving is stressful. We make it feel handled.</h2>
              <p className="mt-4 text-[var(--color-forest-100)]/90">
                We&apos;re a local, family-run crew that treats your stuff like our own. Modern tools, old-fashioned care — that&apos;s the {company.shortName} way.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <ButtonLink href="/quote" variant="white" size="lg">Get instant quote</ButtonLink>
                <a href={company.phoneHref} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 text-base font-semibold text-white hover:bg-white/10">
                  <Phone className="h-4 w-4" /> {company.phone}
                </a>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { icon: DollarSign, title: "No hidden fees", body: "Your quote is itemized and all-in. The price you book is the price you pay." },
                { icon: ShieldCheck, title: "Licensed & insured", body: `Fully covered, ${company.license}. Damage protection on every move.` },
                { icon: MapPinned, title: "Live tracking", body: "Know exactly where your crew is and when they'll arrive." },
                { icon: Users, title: "Vetted crews", body: "Background-checked, trained, and genuinely friendly movers." },
                { icon: Clock, title: "Flexible scheduling", body: "Book online any time, with windows that fit your day." },
                { icon: Boxes, title: "Full-service options", body: "Add packing, storage or specialty handling in a couple of taps." },
              ].map((f) => (
                <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                  <f.icon className="h-6 w-6 text-[var(--color-honey-300)]" />
                  <h3 className="mt-3 font-bold">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-[var(--color-forest-100)]/85">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────── */}
      <section id="reviews" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Loved by neighbors"
          title={`${company.rating} stars across ${company.reviewCount}+ reviews`}
          subtitle="We're proud of our reputation — and we earn it one careful move at a time."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { name: "Marcus T.", area: "Asheville, NC", text: "The instant quote was spot-on and the crew was unbelievably fast and careful. Being able to watch them head over on move day was the cherry on top." },
            { name: "Priya S.", area: "Hendersonville, NC", text: "Booked the whole thing online in ten minutes. No pushy sales call, clear pricing, and they wrapped my grandmother's china like it was theirs." },
            { name: "Dylan R.", area: "Black Mountain, NC", text: "Third time using Brother Bear. Fair prices, real people, zero drama. The tracking link kept my whole family in the loop. Can't recommend enough." },
          ].map((r) => (
            <figure key={r.name} className="card flex flex-col p-6 shadow-card">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[var(--color-honey-400)] text-[var(--color-honey-400)]" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-[var(--text-secondary)]">“{r.text}”</blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-forest-100)] font-bold text-[var(--color-forest-700)]">
                  {r.name[0]}
                </span>
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{r.area}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Service area ─────────────────────────────────────── */}
      <section className="bg-[var(--surface-2)] py-16">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <MapPinned className="mx-auto h-8 w-8 text-[var(--color-forest-500)]" />
          <h2 className="mt-3 text-2xl font-bold">Proudly serving {company.address.city} & beyond</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[var(--text-secondary)]">
            Local moves across the region and long-distance moves nationwide. If you&apos;re near any of these, we&apos;ve got you:
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {company.serviceAreas.map((a) => (
              <span key={a} className="rounded-full border border-[var(--border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)]">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Good to know" title="Questions, answered" subtitle="Everything you need to feel confident booking online." />
        <div className="mt-10">
          <Faq />
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-forest-800)] py-16 text-white">
        <div className="topo absolute inset-0 opacity-40" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready for the easiest move of your life?</h2>
          <p className="mt-3 max-w-xl text-[var(--color-forest-100)]/90">
            Get your instant, no-obligation quote in about two minutes. Book when you&apos;re ready.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/quote" variant="accent" size="lg">Get my instant quote <ArrowRight className="h-4 w-4" /></ButtonLink>
            <Link href={company.phoneHref} className="inline-flex h-13 items-center justify-center gap-2 rounded-full border border-white/25 px-7 text-base font-semibold hover:bg-white/10">
              <Phone className="h-4 w-4" /> Call {company.phone}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SectionHeading({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-[var(--color-honey-600)]">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-[var(--text-secondary)]">{subtitle}</p>}
    </div>
  );
}
