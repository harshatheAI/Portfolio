import type { AddonId } from "@/lib/brand";

/**
 * Pricing engine. Turns an analyzed move into transparent, itemized pricing and
 * three service tiers. Every number here is driven by a PricingConfig record so
 * the moving company can edit the guidelines from /admin without code changes.
 */

export interface PricingConfigValues {
  baseFee: number;
  ratePerHourPerMover: number;
  ratePerMile: number;
  freeMileRadius: number;
  ratePerCuFt: number;
  stairsFeePerFlight: number;
  noElevatorSurcharge: number;
  depositPercent: number;
  packingService: number;
  packingFlat: number;
  storageMonthly: number;
  specialtyItemFee: number;
  insuranceFullValue: number;
  tierBasicMult: number;
  tierStandardMult: number;
  tierPremiumMult: number;
}

/** Mirrors the PricingConfig schema defaults — used before the DB is seeded. */
export const DEFAULT_PRICING: PricingConfigValues = {
  baseFee: 149,
  ratePerHourPerMover: 65,
  ratePerMile: 1.25,
  freeMileRadius: 25,
  ratePerCuFt: 0.55,
  stairsFeePerFlight: 45,
  noElevatorSurcharge: 35,
  depositPercent: 0.2,
  packingService: 0.4,
  packingFlat: 280,
  storageMonthly: 180,
  specialtyItemFee: 120,
  insuranceFullValue: 0.015,
  tierBasicMult: 1.0,
  tierStandardMult: 1.28,
  tierPremiumMult: 1.6,
};

export interface QuoteComputeInput {
  distanceMiles: number;
  estimatedVolumeCuFt: number;
  laborHours: number;
  crewSize: number;
  originFloor: number;
  destFloor: number;
  originElevator: boolean;
  destElevator: boolean;
  addons: AddonId[];
  specialtyCount?: number;
  declaredValue?: number;
  storageMonths?: number;
}

export interface LineItem {
  label: string;
  detail?: string;
  amount: number;
}

export interface Tier {
  id: "basic" | "standard" | "premium";
  name: string;
  tagline: string;
  price: number;
  deposit: number;
  balance: number;
  inclusions: string[];
  recommended?: boolean;
}

export interface QuoteBreakdown {
  lineItems: LineItem[];
  baseSubtotal: number; // the "standard-effort" move cost before tier multiplier
  addonItems: LineItem[];
  addonsTotal: number;
  tiers: Tier[];
}

function round(n: number): number {
  return Math.round(n);
}

export function computeQuote(
  input: QuoteComputeInput,
  cfg: PricingConfigValues = DEFAULT_PRICING,
): QuoteBreakdown {
  const {
    distanceMiles,
    estimatedVolumeCuFt,
    laborHours,
    crewSize,
    originFloor,
    destFloor,
    originElevator,
    destElevator,
    addons,
    specialtyCount = 0,
    declaredValue = 0,
    storageMonths = 1,
  } = input;

  const laborCost = laborHours * crewSize * cfg.ratePerHourPerMover;
  const volumeCost = estimatedVolumeCuFt * cfg.ratePerCuFt;
  const billableMiles = Math.max(0, distanceMiles - cfg.freeMileRadius);
  const mileageCost = billableMiles * cfg.ratePerMile;

  // Stairs: only floors above ground count, and only when there's no elevator.
  const originFlights = originElevator ? 0 : Math.max(0, originFloor - 1);
  const destFlights = destElevator ? 0 : Math.max(0, destFloor - 1);
  const stairsCost = (originFlights + destFlights) * cfg.stairsFeePerFlight;

  const noElevatorSurcharge =
    ((!originElevator && originFloor >= 3) || (!destElevator && destFloor >= 3))
      ? cfg.noElevatorSurcharge
      : 0;

  const lineItems: LineItem[] = [
    { label: "Truck, dispatch & equipment", amount: round(cfg.baseFee) },
    {
      label: "Loading & unloading labor",
      detail: `${laborHours.toFixed(1)} hrs × ${crewSize} movers × $${cfg.ratePerHourPerMover}/hr`,
      amount: round(laborCost),
    },
    {
      label: "Volume handling",
      detail: `${Math.round(estimatedVolumeCuFt).toLocaleString()} cu ft × $${cfg.ratePerCuFt.toFixed(2)}`,
      amount: round(volumeCost),
    },
  ];

  if (mileageCost > 0) {
    lineItems.push({
      label: "Travel / mileage",
      detail: `${Math.round(billableMiles)} mi past the first ${cfg.freeMileRadius} × $${cfg.ratePerMile.toFixed(2)}`,
      amount: round(mileageCost),
    });
  }
  if (stairsCost > 0) {
    lineItems.push({
      label: "Stairs",
      detail: `${originFlights + destFlights} flight(s) × $${cfg.stairsFeePerFlight}`,
      amount: round(stairsCost),
    });
  }
  if (noElevatorSurcharge > 0) {
    lineItems.push({ label: "Walk-up surcharge (no elevator, 3+ floors)", amount: round(noElevatorSurcharge) });
  }

  const baseSubtotal =
    cfg.baseFee + laborCost + volumeCost + mileageCost + stairsCost + noElevatorSurcharge;

  // ── Add-ons chosen explicitly by the customer ──────────────────
  const addonItems: LineItem[] = [];
  if (addons.includes("packing")) {
    addonItems.push({
      label: "Full packing service",
      detail: "Materials + crew boxing everything",
      amount: round(cfg.packingFlat + baseSubtotal * cfg.packingService * 0.5),
    });
  }
  if (addons.includes("unpacking")) {
    addonItems.push({ label: "Unpacking at destination", amount: round(cfg.packingFlat * 0.65) });
  }
  if (addons.includes("storage")) {
    addonItems.push({
      label: "Storage",
      detail: `${storageMonths} month(s) climate-controlled`,
      amount: round(cfg.storageMonthly * storageMonths),
    });
  }
  if (addons.includes("specialty") && specialtyCount > 0) {
    addonItems.push({
      label: "Specialty item handling",
      detail: `${specialtyCount} item(s) (piano/safe/gym/antique)`,
      amount: round(cfg.specialtyItemFee * specialtyCount),
    });
  }
  if (addons.includes("insurance") && declaredValue > 0) {
    addonItems.push({
      label: "Full-value protection",
      detail: `Coverage on $${declaredValue.toLocaleString()} declared value`,
      amount: round(declaredValue * cfg.insuranceFullValue),
    });
  }
  if (addons.includes("disassembly")) {
    addonItems.push({ label: "Furniture disassembly & reassembly", amount: round(cfg.stairsFeePerFlight * 2.2) });
  }
  const addonsTotal = addonItems.reduce((s, i) => s + i.amount, 0);

  // ── Tiers ──────────────────────────────────────────────────────
  const makeTier = (
    id: Tier["id"],
    name: string,
    tagline: string,
    mult: number,
    inclusions: string[],
    recommended?: boolean,
  ): Tier => {
    const price = round(baseSubtotal * mult + addonsTotal);
    const deposit = round(price * cfg.depositPercent);
    return { id, name, tagline, price, deposit, balance: price - deposit, inclusions, recommended };
  };

  const tiers: Tier[] = [
    makeTier("basic", "Essential", "Muscle + truck. You pack, we move.", cfg.tierBasicMult, [
      "2–3 professional movers",
      "Truck, fuel & basic equipment",
      "Blankets & shrink-wrap for furniture",
      "Basic liability coverage ($0.60/lb)",
      "Load, transport & unload",
    ]),
    makeTier(
      "standard",
      "Complete",
      "The full-service favorite — most people pick this.",
      cfg.tierStandardMult,
      [
        "Everything in Essential",
        "Furniture disassembly & reassembly",
        "Wardrobe boxes & mattress bags provided",
        "Floor & doorway protection",
        "Priority scheduling window",
        "$10,000 released-value coverage",
      ],
      true,
    ),
    makeTier("premium", "White-Glove", "Zero lifting, zero stress — we handle it all.", cfg.tierPremiumMult, [
      "Everything in Complete",
      "Full professional packing & unpacking",
      "All packing materials included",
      "Full-value replacement protection",
      "Dedicated move coordinator",
      "Guaranteed arrival time + real-time tracking",
    ]),
  ];

  return { lineItems, baseSubtotal: round(baseSubtotal), addonItems, addonsTotal, tiers };
}
