"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Truck, MapPin, Navigation, Phone, Loader2, RefreshCw, CheckCircle2, CalendarCheck,
  Users, PackageOpen, PackageCheck, PartyPopper, Circle, Radio, FastForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatDateTime } from "@/lib/utils";
import { STAGES, stageIndex, progressFor, isActive, type MoveStatus } from "@/lib/tracking";

const ICONS: Record<string, typeof Truck> = {
  CalendarCheck, Users, Truck, PackageOpen, Navigation, PackageCheck, PartyPopper,
};

interface TrackData {
  reference: string;
  status: MoveStatus;
  scheduledDate: string;
  timeSlot: string;
  etaMinutes: number | null;
  etaLabel: string;
  crew: { name: string; lead: string; size: number; phone: string | null } | null;
  origin: string;
  destination: string;
  distanceMiles: number;
  events: { id: string; status: string; title: string; detail: string | null; createdAt: string }[];
}

export function LiveTracker({ reference }: { reference: string }) {
  const [data, setData] = useState<TrackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/tracking/${reference}`, { cache: "no-store" });
    if (res.status === 404) { setNotFound(true); setLoading(false); return; }
    const json = await res.json();
    setData(json.data);
    setLoading(false);
  }, [reference]);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const res = await fetch(`/api/tracking/${reference}`, { cache: "no-store" });
      if (cancelled) return;
      if (res.status === 404) { setNotFound(true); setLoading(false); return; }
      const json = await res.json();
      if (cancelled) return;
      setData(json.data);
      setLoading(false);
    };
    poll();
    const interval = setInterval(poll, 6000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [reference]);

  async function advance() {
    setAdvancing(true);
    await fetch(`/api/tracking/${reference}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await load();
    setAdvancing(false);
  }

  if (loading) {
    return <div className="flex items-center justify-center gap-2 py-24 text-[var(--text-muted)]"><Loader2 className="h-5 w-5 animate-spin" /> Loading your move…</div>;
  }
  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <MapPin className="mx-auto h-10 w-10 text-[var(--text-muted)]" />
        <h2 className="mt-3 text-xl font-bold">Move not found</h2>
        <p className="mt-1 text-[var(--text-secondary)]">Double-check your booking reference and try again.</p>
      </div>
    );
  }

  const currentIdx = stageIndex(data.status);
  const progress = progressFor(data.status);
  const done = data.status === "COMPLETED";
  const active = isActive(data.status);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
      {/* Left: map + status */}
      <div className="space-y-6">
        <div className="card overflow-hidden shadow-card">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", active ? "text-[var(--color-forest-700)]" : "text-[var(--text-secondary)]")}>
                {active ? <><Radio className="h-4 w-4 pulse-dot" /> Live</> : done ? <><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Delivered</> : <><CalendarCheck className="h-4 w-4" /> Scheduled</>}
              </span>
            </div>
            <Badge variant={done ? "success" : active ? "forest" : "neutral"} size="md">{data.etaLabel}</Badge>
          </div>

          {/* Route map */}
          <RouteMap progress={progress} origin={data.origin} destination={data.destination} active={active} />

          <div className="grid grid-cols-3 divide-x divide-[var(--border)] border-t border-[var(--border)] text-center">
            <Stat label="Distance" value={`${Math.round(data.distanceMiles)} mi`} />
            <Stat label="Crew" value={data.crew ? `${data.crew.size} movers` : "TBD"} />
            <Stat label="Progress" value={`${Math.round(progress * 100)}%`} />
          </div>
        </div>

        {/* Current status card */}
        <div className="card p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl gradient-forest text-white">
              {(() => { const I = ICONS[STAGES[currentIdx].icon] ?? Truck; return <I className="h-6 w-6" />; })()}
            </span>
            <div>
              <p className="text-lg font-bold">{STAGES[currentIdx].title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{STAGES[currentIdx].customerDetail}</p>
            </div>
          </div>

          {/* Demo control */}
          {!done && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[var(--surface-2)] px-3.5 py-2.5">
              <span className="text-xs text-[var(--text-muted)]">Demo: simulate the next crew update</span>
              <Button variant="subtle" size="sm" onClick={advance} disabled={advancing}>
                {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FastForward className="h-4 w-4" />} Next update
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Right: timeline + crew */}
      <div className="space-y-6">
        {data.crew && (
          <div className="card p-5 shadow-card">
            <h3 className="font-bold">Your crew</h3>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--color-honey-100)] text-lg font-bold text-[var(--color-honey-700)]">
                {data.crew.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
              </span>
              <div>
                <p className="font-semibold">{data.crew.name}</p>
                <p className="text-sm text-[var(--text-secondary)]">Lead: {data.crew.lead} · {data.crew.size} movers</p>
              </div>
            </div>
            {data.crew.phone && (
              <a href={`tel:${data.crew.phone}`} className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-forest-700)]">
                <Phone className="h-4 w-4" /> {data.crew.phone}
              </a>
            )}
          </div>
        )}

        <div className="card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Move timeline</h3>
            <button onClick={load} className="text-[var(--text-muted)] hover:text-[var(--foreground)]" aria-label="Refresh"><RefreshCw className="h-4 w-4" /></button>
          </div>
          <ol className="mt-4">
            {STAGES.map((stage, i) => {
              const reached = i <= currentIdx;
              const isCurrent = i === currentIdx && !done;
              const event = [...data.events].reverse().find((e) => e.status === stage.status);
              const Icon = ICONS[stage.icon] ?? Circle;
              return (
                <li key={stage.status} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      reached ? "border-[var(--color-forest-600)] bg-[var(--color-forest-600)] text-white" : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-muted)]",
                      isCurrent && "ring-4 ring-[var(--color-forest-100)]",
                    )}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {i < STAGES.length - 1 && <span className={cn("my-0.5 w-0.5 flex-1", i < currentIdx ? "bg-[var(--color-forest-500)]" : "bg-[var(--border)]")} style={{ minHeight: 24 }} />}
                  </div>
                  <div className={cn("pb-5", !reached && "opacity-55")}>
                    <p className="text-sm font-semibold">{stage.title}</p>
                    {event ? (
                      <p className="text-xs text-[var(--text-muted)]">{formatDateTime(event.createdAt)}</p>
                    ) : (
                      <p className="text-xs text-[var(--text-muted)]">{isCurrent ? "In progress" : "Upcoming"}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-3">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
    </div>
  );
}

function RouteMap({ progress, origin, destination, active }: { progress: number; origin: string; destination: string; active: boolean }) {
  // Curved route across the card; truck marker positioned by progress along the path.
  const pts = pointOnCurve(progress);
  return (
    <div className="relative h-56 w-full overflow-hidden bg-[var(--color-forest-50)]">
      {/* faux terrain */}
      <div className="topo absolute inset-0 opacity-[0.15]" />
      <svg viewBox="0 0 400 224" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--color-forest-200)" strokeWidth="1" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="400" height="224" fill="url(#grid)" />
        {/* route base */}
        <path d={CURVE} fill="none" stroke="var(--color-forest-200)" strokeWidth="6" strokeLinecap="round" />
        {/* traveled portion */}
        <path d={CURVE} fill="none" stroke="var(--color-forest-600)" strokeWidth="6" strokeLinecap="round" strokeDasharray="600" strokeDashoffset={600 - 600 * progress} />
        {/* origin */}
        <circle cx="40" cy="180" r="7" fill="var(--color-forest-600)" stroke="white" strokeWidth="3" />
        {/* destination */}
        <circle cx="360" cy="44" r="7" fill="var(--color-honey-500)" stroke="white" strokeWidth="3" />
      </svg>

      {/* truck marker */}
      <div
        className={cn("absolute z-10 -translate-x-1/2 -translate-y-1/2", active && "animate-truck")}
        style={{ left: `${(pts.x / 400) * 100}%`, top: `${(pts.y / 224) * 100}%` }}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-lift ring-2 ring-[var(--color-forest-500)]">
          <Truck className="h-5 w-5 text-[var(--color-forest-700)]" />
        </span>
      </div>

      {/* labels */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-[var(--color-forest-600)]" /> <span className="max-w-[120px] truncate">{origin}</span>
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
        <span className="max-w-[120px] truncate">{destination}</span> <MapPin className="h-3.5 w-3.5 text-[var(--color-honey-600)]" />
      </div>
    </div>
  );
}

const CURVE = "M40 180 C 130 180, 150 90, 220 90 S 320 44, 360 44";

/** Rough cubic-ish sampling along CURVE for the marker position. */
function pointOnCurve(t: number): { x: number; y: number } {
  const clamped = Math.max(0, Math.min(1, t));
  // piecewise-linear approximation through the curve's key points
  const path = [
    { x: 40, y: 180 }, { x: 130, y: 168 }, { x: 160, y: 120 }, { x: 220, y: 90 },
    { x: 290, y: 74 }, { x: 330, y: 56 }, { x: 360, y: 44 },
  ];
  const seg = clamped * (path.length - 1);
  const i = Math.min(path.length - 2, Math.floor(seg));
  const f = seg - i;
  return { x: path[i].x + (path[i + 1].x - path[i].x) * f, y: path[i].y + (path[i + 1].y - path[i].y) * f };
}
