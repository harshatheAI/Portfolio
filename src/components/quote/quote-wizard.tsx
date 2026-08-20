"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Home, ArrowRight, ArrowLeft, Building2, X, Loader2,
  PackageOpen, PackageCheck, Warehouse, Piano, ShieldCheck, Wrench, Sparkles, Upload, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/field";
import { homeSizes, addons as ADDONS } from "@/lib/brand";
import { cn } from "@/lib/utils";

const addonIcons: Record<string, typeof PackageOpen> = {
  packing: PackageOpen,
  unpacking: PackageCheck,
  storage: Warehouse,
  specialty: Piano,
  insurance: ShieldCheck,
  disassembly: Wrench,
};

const STEPS = ["Route", "Home & access", "Your items", "Contact"];

interface FormState {
  originAddress: string;
  originZip: string;
  destAddress: string;
  destZip: string;
  homeSize: string;
  originFloor: number;
  destFloor: number;
  originElevator: boolean;
  destElevator: boolean;
  preferredDate: string;
  flexibleDates: boolean;
  itemsDescription: string;
  addons: string[];
  specialtyCount: number;
  declaredValue: number;
  storageMonths: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
}

export function QuoteWizard({ initialFrom = "", initialTo = "" }: { initialFrom?: string; initialTo?: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const looksZip = /^\d{3,5}$/.test(initialFrom.trim());
  const [form, setForm] = useState<FormState>({
    originAddress: looksZip ? "" : initialFrom,
    originZip: looksZip ? initialFrom.trim() : "",
    destAddress: /^\d{3,5}$/.test(initialTo.trim()) ? "" : initialTo,
    destZip: /^\d{3,5}$/.test(initialTo.trim()) ? initialTo.trim() : "",
    homeSize: "TWO_BED",
    originFloor: 1,
    destFloor: 1,
    originElevator: false,
    destElevator: false,
    preferredDate: "",
    flexibleDates: false,
    itemsDescription: "",
    addons: [],
    specialtyCount: 0,
    declaredValue: 0,
    storageMonths: 1,
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  function toggleAddon(id: string) {
    setForm((f) => ({
      ...f,
      addons: f.addons.includes(id) ? f.addons.filter((a) => a !== id) : [...f.addons, id],
    }));
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).slice(0, 8 - photos.length);
    const read = await Promise.all(
      list.map(
        (file) =>
          new Promise<{ url: string; name: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ url: reader.result as string, name: file.name });
            reader.readAsDataURL(file);
          }),
      ),
    );
    setPhotos((p) => [...p, ...read].slice(0, 8));
  }

  function validateStep(): boolean {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (form.originAddress.trim().length < 3) errs.originAddress = "Enter your pickup address or city.";
      if (form.destAddress.trim().length < 3) errs.destAddress = "Enter your destination address or city.";
    }
    if (step === 3) {
      if (form.contactName.trim().length < 2) errs.contactName = "Please tell us your name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.contactEmail)) errs.contactEmail = "Enter a valid email.";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }
  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photos: photos.map((p) => p.url) }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/quote/${json.data.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  }

  const showStorageMonths = form.addons.includes("storage");
  const showDeclaredValue = form.addons.includes("insurance");
  const showSpecialty = form.addons.includes("specialty");

  return (
    <div className="mx-auto max-w-3xl">
      {/* Stepper */}
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold transition-colors",
                  i < step && "bg-[var(--color-forest-600)] text-white",
                  i === step && "bg-[var(--color-forest-600)] text-white ring-4 ring-[var(--color-forest-100)]",
                  i > step && "bg-[var(--surface-3)] text-[var(--text-muted)]",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("hidden text-sm font-medium sm:block", i <= step ? "text-[var(--foreground)]" : "text-[var(--text-muted)]")}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className={cn("h-0.5 flex-1 rounded", i < step ? "bg-[var(--color-forest-500)]" : "bg-[var(--surface-3)]")} />}
          </div>
        ))}
      </div>

      <div className="card p-6 shadow-card sm:p-8">
        {/* Step 0: Route */}
        {step === 0 && (
          <div className="space-y-5">
            <StepTitle title="Where are you moving?" subtitle="We'll use this to estimate travel and confirm we serve your area." />
            <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="originAddress">Moving from</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-forest-500)]" />
                  <Input id="originAddress" className="pl-11" placeholder="Street address or city" value={form.originAddress} onChange={(e) => set("originAddress", e.target.value)} />
                </div>
                <FieldError>{fieldErrors.originAddress}</FieldError>
              </div>
              <div className="sm:w-32">
                <Label htmlFor="originZip">ZIP</Label>
                <Input id="originZip" inputMode="numeric" placeholder="28801" value={form.originZip} onChange={(e) => set("originZip", e.target.value)} />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
              <div>
                <Label htmlFor="destAddress">Moving to</Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-honey-500)]" />
                  <Input id="destAddress" className="pl-11" placeholder="Street address or city" value={form.destAddress} onChange={(e) => set("destAddress", e.target.value)} />
                </div>
                <FieldError>{fieldErrors.destAddress}</FieldError>
              </div>
              <div className="sm:w-32">
                <Label htmlFor="destZip">ZIP</Label>
                <Input id="destZip" inputMode="numeric" placeholder="28806" value={form.destZip} onChange={(e) => set("destZip", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>What size is your current place?</Label>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {homeSizes.map((h) => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => set("homeSize", h.value)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      form.homeSize === h.value
                        ? "border-[var(--color-forest-500)] bg-[var(--color-forest-50)] ring-1 ring-[var(--color-forest-500)]"
                        : "border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
                    )}
                  >
                    <span className="block text-sm font-semibold">{h.label}</span>
                    <span className="block text-xs text-[var(--text-muted)]">{h.rooms}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Access */}
        {step === 1 && (
          <div className="space-y-6">
            <StepTitle title="Access & timing" subtitle="Stairs, elevators and your preferred date help us plan the crew and get your price right." />
            <div className="grid gap-6 sm:grid-cols-2">
              <AccessBlock
                label="Pickup"
                icon={Home}
                floor={form.originFloor}
                onFloor={(v) => set("originFloor", v)}
                elevator={form.originElevator}
                onElevator={(v) => set("originElevator", v)}
              />
              <AccessBlock
                label="Destination"
                icon={Building2}
                floor={form.destFloor}
                onFloor={(v) => set("destFloor", v)}
                elevator={form.destElevator}
                onElevator={(v) => set("destElevator", v)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="preferredDate">Preferred move date</Label>
                <Input id="preferredDate" type="date" value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} />
              </div>
              <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl border border-[var(--border-strong)] px-4 py-2.5 sm:mb-0">
                <input type="checkbox" checked={form.flexibleDates} onChange={(e) => set("flexibleDates", e.target.checked)} className="h-4 w-4 accent-[var(--color-forest-600)]" />
                <span className="text-sm font-medium">My dates are flexible (save on off-peak days)</span>
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Items */}
        {step === 2 && (
          <div className="space-y-6">
            <StepTitle title="What are we moving?" subtitle="Describe your items and add photos — our AI estimates the volume and crew so your quote is accurate." />

            <div>
              <Label htmlFor="itemsDescription" hint="The more detail, the better">Describe your items</Label>
              <Textarea
                id="itemsDescription"
                placeholder="e.g. 2 sofas, a king bed, dining table + 6 chairs, fridge, washer/dryer, ~30 boxes, a Peloton, and a piano."
                value={form.itemsDescription}
                onChange={(e) => set("itemsDescription", e.target.value)}
              />
            </div>

            {/* Photo upload */}
            <div>
              <Label hint="Optional · up to 8">Add photos of your rooms & big items</Label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-strong)] bg-[var(--surface-2)] px-4 py-8 text-center transition-colors hover:border-[var(--color-forest-400)] hover:bg-[var(--color-forest-50)]"
              >
                <Upload className="h-6 w-6 text-[var(--color-forest-500)]" />
                <p className="text-sm font-medium">Tap to upload or drag photos here</p>
                <p className="text-xs text-[var(--text-muted)]">JPG or PNG · analyzed instantly, never shared</p>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
              </div>
              {photos.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {photos.map((p, i) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setPhotos((ph) => ph.filter((_, idx) => idx !== i)); }}
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Remove photo"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add-ons */}
            <div>
              <Label>Add any extras (optional)</Label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {ADDONS.map((a) => {
                  const Icon = addonIcons[a.id] ?? PackageOpen;
                  const active = form.addons.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleAddon(a.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                        active ? "border-[var(--color-forest-500)] bg-[var(--color-forest-50)] ring-1 ring-[var(--color-forest-500)]" : "border-[var(--border-strong)] hover:bg-[var(--surface-2)]",
                      )}
                    >
                      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-lg", active ? "bg-[var(--color-forest-600)] text-white" : "bg-[var(--surface-3)] text-[var(--text-secondary)]")}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{a.name}</span>
                        <span className="block text-xs text-[var(--text-muted)]">{a.blurb}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {(showSpecialty || showDeclaredValue || showStorageMonths) && (
                <div className="mt-4 grid gap-4 rounded-xl bg-[var(--surface-2)] p-4 sm:grid-cols-3">
                  {showSpecialty && (
                    <div>
                      <Label htmlFor="specialtyCount">Specialty items</Label>
                      <Input id="specialtyCount" type="number" min={0} max={20} value={form.specialtyCount} onChange={(e) => set("specialtyCount", Number(e.target.value))} />
                    </div>
                  )}
                  {showStorageMonths && (
                    <div>
                      <Label htmlFor="storageMonths">Storage (months)</Label>
                      <Input id="storageMonths" type="number" min={1} max={36} value={form.storageMonths} onChange={(e) => set("storageMonths", Number(e.target.value))} />
                    </div>
                  )}
                  {showDeclaredValue && (
                    <div>
                      <Label htmlFor="declaredValue">Declared value ($)</Label>
                      <Input id="declaredValue" type="number" min={0} step={500} placeholder="25000" value={form.declaredValue} onChange={(e) => set("declaredValue", Number(e.target.value))} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Contact */}
        {step === 3 && (
          <div className="space-y-5">
            <StepTitle title="Where should we send your quote?" subtitle="No spam, ever. We'll email your quote and only call to confirm details." />
            <div>
              <Label htmlFor="contactName">Full name</Label>
              <Input id="contactName" placeholder="Jordan Bennett" value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
              <FieldError>{fieldErrors.contactName}</FieldError>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input id="contactEmail" type="email" placeholder="you@email.com" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
                <FieldError>{fieldErrors.contactEmail}</FieldError>
              </div>
              <div>
                <Label htmlFor="contactPhone" hint="Optional">Phone</Label>
                <Input id="contactPhone" type="tel" placeholder="(555) 123-4567" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-xl bg-[var(--color-forest-50)] p-4 text-sm text-[var(--color-forest-700)]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Your instant quote is generated the moment you submit — you&apos;ll see itemized pricing and three tiers on the next screen.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <Info className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Nav */}
        <div className="mt-7 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={step === 0 || submitting} className={cn(step === 0 && "invisible")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" size="lg" onClick={next}>
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="accent" size="lg" onClick={submit} disabled={submitting}>
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Generating your quote…</>) : (<><Sparkles className="h-4 w-4" /> Get my instant quote</>)}
            </Button>
          )}
        </div>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-[var(--text-muted)]">
        <ShieldCheck className="h-3.5 w-3.5" /> Free & no obligation. Your details are kept private.
      </p>
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-[var(--text-secondary)]">{subtitle}</p>
    </div>
  );
}

function AccessBlock({
  label, icon: Icon, floor, onFloor, elevator, onElevator,
}: {
  label: string; icon: typeof Home; floor: number; onFloor: (v: number) => void; elevator: boolean; onElevator: (v: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
      <div className="flex items-center gap-2 font-semibold">
        <Icon className="h-5 w-5 text-[var(--color-forest-500)]" /> {label}
      </div>
      <div className="mt-3">
        <Label htmlFor={`${label}-floor`}>Floor / level</Label>
        <Select id={`${label}-floor`} value={floor} onChange={(e) => onFloor(Number(e.target.value))}>
          <option value={0}>Ground floor / house</option>
          <option value={1}>1st floor</option>
          <option value={2}>2nd floor</option>
          <option value={3}>3rd floor</option>
          <option value={4}>4th floor</option>
          <option value={5}>5th floor or higher</option>
        </Select>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2.5">
        <input type="checkbox" checked={elevator} onChange={(e) => onElevator(e.target.checked)} className="h-4 w-4 accent-[var(--color-forest-600)]" />
        <span className="text-sm font-medium">Elevator available</span>
      </label>
    </div>
  );
}
