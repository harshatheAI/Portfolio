import { prisma } from "@/lib/prisma";
import { DEFAULT_PRICING, type PricingConfigValues } from "@/lib/pricing";

const CONFIG_KEYS: (keyof PricingConfigValues)[] = [
  "baseFee",
  "ratePerHourPerMover",
  "ratePerMile",
  "freeMileRadius",
  "ratePerCuFt",
  "stairsFeePerFlight",
  "noElevatorSurcharge",
  "depositPercent",
  "packingService",
  "packingFlat",
  "storageMonthly",
  "specialtyItemFee",
  "insuranceFullValue",
  "tierBasicMult",
  "tierStandardMult",
  "tierPremiumMult",
];

/** Loads the active company pricing guidelines, falling back to code defaults. */
export async function getPricingConfig(): Promise<PricingConfigValues & { id?: string }> {
  try {
    const row = await prisma.pricingConfig.findFirst({ where: { isActive: true }, orderBy: { updatedAt: "desc" } });
    if (!row) return { ...DEFAULT_PRICING };
    const values = {} as PricingConfigValues & { id?: string };
    for (const k of CONFIG_KEYS) values[k] = row[k] as number;
    values.id = row.id;
    return values;
  } catch {
    return { ...DEFAULT_PRICING };
  }
}

export { CONFIG_KEYS };
