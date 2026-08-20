import { z } from "zod";

export const homeSizeEnum = z.enum([
  "STUDIO",
  "ONE_BED",
  "TWO_BED",
  "THREE_BED",
  "FOUR_BED_PLUS",
  "OFFICE",
  "OTHER",
]);

export const addonEnum = z.enum([
  "packing",
  "unpacking",
  "storage",
  "specialty",
  "insurance",
  "disassembly",
]);

export const quoteInputSchema = z.object({
  originAddress: z.string().min(3, "Enter a pickup address"),
  originZip: z.string().optional(),
  destAddress: z.string().min(3, "Enter a destination address"),
  destZip: z.string().optional(),
  homeSize: homeSizeEnum,
  originFloor: z.coerce.number().int().min(0).max(60).default(0),
  destFloor: z.coerce.number().int().min(0).max(60).default(0),
  originElevator: z.boolean().default(false),
  destElevator: z.boolean().default(false),
  preferredDate: z.string().optional(),
  flexibleDates: z.boolean().default(false),
  itemsDescription: z.string().max(4000).optional(),
  addons: z.array(addonEnum).default([]),
  specialtyCount: z.coerce.number().int().min(0).max(20).default(0),
  declaredValue: z.coerce.number().min(0).max(2_000_000).default(0),
  storageMonths: z.coerce.number().int().min(0).max(36).default(1),
  // Photos as data URLs (analyzed, not persisted in full)
  photos: z.array(z.string()).max(10).default([]),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
});

export type QuoteInput = z.infer<typeof quoteInputSchema>;

export const bookingInputSchema = z.object({
  quoteId: z.string().min(1),
  selectedTier: z.enum(["basic", "standard", "premium"]),
  scheduledDate: z.string().min(1),
  timeSlot: z.string().min(1),
  // Account (create-or-attach)
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),
  // Mock payment
  cardNumber: z.string().min(12),
  cardName: z.string().min(2),
  cardExpiry: z.string().min(4),
  cardCvc: z.string().min(3),
});

export type BookingInput = z.infer<typeof bookingInputSchema>;

export const pricingConfigSchema = z.object({
  baseFee: z.coerce.number().min(0),
  ratePerHourPerMover: z.coerce.number().min(0),
  ratePerMile: z.coerce.number().min(0),
  freeMileRadius: z.coerce.number().min(0),
  ratePerCuFt: z.coerce.number().min(0),
  stairsFeePerFlight: z.coerce.number().min(0),
  noElevatorSurcharge: z.coerce.number().min(0),
  depositPercent: z.coerce.number().min(0).max(1),
  packingService: z.coerce.number().min(0).max(3),
  packingFlat: z.coerce.number().min(0),
  storageMonthly: z.coerce.number().min(0),
  specialtyItemFee: z.coerce.number().min(0),
  insuranceFullValue: z.coerce.number().min(0).max(1),
  tierBasicMult: z.coerce.number().min(0.1),
  tierStandardMult: z.coerce.number().min(0.1),
  tierPremiumMult: z.coerce.number().min(0.1),
  notes: z.string().optional(),
});
