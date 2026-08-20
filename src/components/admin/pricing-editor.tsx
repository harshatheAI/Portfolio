"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, Info, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import type { PricingConfigValues } from "@/lib/pricing";

type FieldMeta = { key: keyof PricingConfigValues; label: string; hint?: string; step?: number; prefix?: string; suffix?: string };

const GROUPS: { title: string; fields: FieldMeta[] }[] = [
  {
    title: "Core rates",
    fields: [
      { key: "baseFee", label: "Base fee", hint: "Truck + dispatch", prefix: "$" },
      { key: "ratePerHourPerMover", label: "Labor rate", hint: "per mover / hour", prefix: "$" },
      { key: "ratePerCuFt", label: "Volume rate", hint: "per cubic foot", prefix: "$", step: 0.05 },
      { key: "ratePerMile", label: "Mileage rate", hint: "per mile", prefix: "$", step: 0.05 },
      { key: "freeMileRadius", label: "Free miles", hint: "included before per-mile", suffix: "mi" },
    ],
  },
  {
    title: "Surcharges & deposit",
    fields: [
      { key: "stairsFeePerFlight", label: "Stairs fee", hint: "per flight", prefix: "$" },
      { key: "noElevatorSurcharge", label: "Walk-up surcharge", hint: "3+ floors, no elevator", prefix: "$" },
      { key: "depositPercent", label: "Deposit", hint: "fraction of total (0–1)", step: 0.05 },
    ],
  },
  {
    title: "Add-on pricing",
    fields: [
      { key: "packingFlat", label: "Packing (flat)", prefix: "$" },
      { key: "packingService", label: "Packing (labor %)", hint: "fraction of base", step: 0.05 },
      { key: "storageMonthly", label: "Storage", hint: "per month", prefix: "$" },
      { key: "specialtyItemFee", label: "Specialty item", hint: "each", prefix: "$" },
      { key: "insuranceFullValue", label: "Full-value coverage", hint: "fraction of value", step: 0.005 },
    ],
  },
  {
    title: "Service tier multipliers",
    fields: [
      { key: "tierBasicMult", label: "Essential ×", step: 0.01 },
      { key: "tierStandardMult", label: "Complete ×", step: 0.01 },
      { key: "tierPremiumMult", label: "White-Glove ×", step: 0.01 },
    ],
  },
];

export function PricingEditor({ isAdmin }: { isAdmin: boolean }) {
  const [values, setValues] = useState<PricingConfigValues | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/pricing").then((r) => r.json()).then((j) => setValues(j.data));
  }, []);

  function update(key: keyof PricingConfigValues, v: string) {
    setSaved(false);
    setValues((prev) => (prev ? { ...prev, [key]: v === "" ? 0 : Number(v) } : prev));
  }

  async function save() {
    if (!values) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Could not save."); setSaving(false); return; }
      setSaved(true);
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!values) {
    return <div className="flex items-center gap-2 py-10 text-[var(--text-muted)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading guidelines…</div>;
  }

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-xl bg-[var(--color-forest-50)] p-4 text-sm text-[var(--color-forest-800)]">
        <SlidersHorizontal className="mt-0.5 h-4 w-4 shrink-0" />
        <p>These are the guidelines the quote engine uses. Edit any value and save — every new instant quote recalculates against them immediately. {isAdmin ? "" : "Sign in as an admin to save changes."}</p>
      </div>

      <div className="space-y-6">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">{g.title}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.fields.map((f) => (
                <div key={String(f.key)}>
                  <Label htmlFor={String(f.key)} hint={f.hint}>{f.label}</Label>
                  <div className="relative">
                    {f.prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">{f.prefix}</span>}
                    <Input
                      id={String(f.key)}
                      type="number"
                      step={f.step ?? 1}
                      className={f.prefix ? "pl-7" : ""}
                      value={values[f.key]}
                      onChange={(e) => update(f.key, e.target.value)}
                      disabled={!isAdmin}
                    />
                    {f.suffix && <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-[var(--text-muted)]">{f.suffix}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 flex items-center gap-2 text-sm text-red-600"><Info className="h-4 w-4" /> {error}</p>}

      <div className="mt-6 flex items-center gap-3">
        <Button variant="primary" onClick={save} disabled={saving || !isAdmin}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save guidelines</>}
        </Button>
        {saved && <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved — new quotes use these rates.</span>}
      </div>
    </div>
  );
}
