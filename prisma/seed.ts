import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

/** Build a representative 3-tier set for seed demos. */
function tiers(base: number, depositPct = 0.2) {
  const mk = (id: string, name: string, tagline: string, mult: number, inclusions: string[], recommended = false) => {
    const price = Math.round(base * mult);
    const deposit = Math.round(price * depositPct);
    return { id, name, tagline, price, deposit, balance: price - deposit, inclusions, recommended };
  };
  return [
    mk("basic", "Essential", "Muscle + truck. You pack, we move.", 1.0, [
      "2–3 professional movers", "Truck, fuel & basic equipment", "Blankets & shrink-wrap", "Basic liability coverage", "Load, transport & unload",
    ]),
    mk("standard", "Complete", "The full-service favorite.", 1.28, [
      "Everything in Essential", "Furniture disassembly & reassembly", "Wardrobe boxes & mattress bags", "Floor & doorway protection", "$10,000 released-value coverage",
    ], true),
    mk("premium", "White-Glove", "Zero lifting, zero stress.", 1.6, [
      "Everything in Complete", "Full packing & unpacking", "All materials included", "Full-value protection", "Dedicated coordinator + live tracking",
    ]),
  ];
}

function ref(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

export async function seed() {
  console.log("🐻 Seeding Brother Bear Moving…");

  // Reset domain tables (keep it idempotent for repeat seeds)
  await prisma.trackingEvent.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.crew.deleteMany();
  await prisma.pricingConfig.deleteMany();

  // Pricing guidelines (schema defaults fill the rest)
  await prisma.pricingConfig.create({
    data: { isActive: true, notes: "Default published guidelines — edit any time from the admin panel." },
  });

  // Crews
  const [kodiak, grizzly, panda] = await Promise.all([
    prisma.crew.create({ data: { name: "Team Kodiak", lead: "Marcus", size: 3, phone: "(555) 268-1001" } }),
    prisma.crew.create({ data: { name: "Team Grizzly", lead: "Tasha", size: 4, phone: "(555) 268-1002" } }),
    prisma.crew.create({ data: { name: "Team Panda", lead: "Diego", size: 2, phone: "(555) 268-1003" } }),
  ]);

  // Users
  const adminPass = await bcrypt.hash("movingbears", 12);
  const custPass = await bcrypt.hash("movingbears", 12);

  await prisma.user.upsert({
    where: { email: "admin@brotherbearmoving.com" },
    update: { role: "ADMIN", passwordHash: adminPass },
    create: { email: "admin@brotherbearmoving.com", name: "Bailey (Owner)", passwordHash: adminPass, role: "ADMIN", phone: "(555) 268-6683" },
  });

  const customer = await prisma.user.upsert({
    where: { email: "jordan@example.com" },
    update: { passwordHash: custPass },
    create: { email: "jordan@example.com", name: "Jordan Bennett", passwordHash: custPass, role: "CUSTOMER", phone: "(555) 412-8890" },
  });

  const now = new Date();
  const daysFrom = (n: number) => new Date(now.getTime() + n * 86400000);

  // ── 1) Active move (in transit) ───────────────────────────────
  const q1Tiers = tiers(1180);
  const quote1 = await prisma.quote.create({
    data: {
      reference: ref("BBM-Q"), user: { connect: { id: customer.id } },
      contactName: customer.name, contactEmail: customer.email, contactPhone: customer.phone,
      originAddress: "18 Maple St, Asheville, NC", originZip: "28801",
      destAddress: "402 Ridgeline Dr, Weaverville, NC", destZip: "28787",
      distanceMiles: 16, homeSize: "TWO_BED", originFloor: 2, destFloor: 1,
      estimatedVolumeCuFt: 940, estimatedWeightLbs: 6580, laborHours: 4.5, crewSize: 3,
      items: [
        { name: "Sofa", quantity: 1, category: "furniture", bulky: true },
        { name: "Bed", quantity: 2, category: "furniture", bulky: true },
        { name: "Fridge", quantity: 1, category: "appliance", bulky: true },
        { name: "Boxes", quantity: 28, category: "box" },
      ],
      addons: ["disassembly"], tiers: q1Tiers,
      breakdown: { lineItems: [], addonItems: [], baseSubtotal: 1180, addonsTotal: 0, tiers: q1Tiers },
      aiSummary: "Based on a 2-bedroom home with a sofa, two beds, a fridge and ~28 boxes, we estimate about 940 cu ft. A crew of 3 should finish in roughly 4.5 hours.",
      aiConfidence: "heuristic", status: "BOOKED", expiresAt: daysFrom(14),
    },
  });
  const t1 = q1Tiers[1];
  const booking1 = await prisma.booking.create({
    data: {
      reference: ref("BBM-B"), quote: { connect: { id: quote1.id } }, user: { connect: { id: customer.id } },
      selectedTier: "standard", totalAmount: t1.price, depositAmount: t1.deposit, balanceAmount: t1.balance,
      scheduledDate: now, timeSlot: "8:00 AM – 10:00 AM", crew: { connect: { id: grizzly.id } },
      status: "IN_TRANSIT", etaMinutes: 14, trackingEnabled: true,
      payment: { create: { amount: t1.deposit, kind: "DEPOSIT", status: "PAID", last4: "4242", reference: ref("BBM-PAY") } },
      events: {
        create: [
          { status: "CONFIRMED", title: "Booking confirmed", detail: "Deposit received. We'll see you on move day!", createdAt: daysFrom(-6) },
          { status: "CREW_ASSIGNED", title: "Crew assigned", detail: "Team Grizzly (lead: Tasha) will handle your move.", createdAt: daysFrom(-2) },
          { status: "EN_ROUTE", title: "Crew en route", detail: "Your movers are on the way to your pickup address.", createdAt: new Date(now.getTime() - 3 * 3600000) },
          { status: "LOADING", title: "Loading", detail: "Wrapping and loading your belongings.", createdAt: new Date(now.getTime() - 2 * 3600000) },
          { status: "IN_TRANSIT", title: "In transit", detail: "Everything's loaded and on the road to your new place.", createdAt: new Date(now.getTime() - 40 * 60000) },
        ],
      },
    },
  });

  // ── 2) Completed past move ────────────────────────────────────
  const q2Tiers = tiers(720);
  const quote2 = await prisma.quote.create({
    data: {
      reference: ref("BBM-Q"), user: { connect: { id: customer.id } },
      contactName: customer.name, contactEmail: customer.email,
      originAddress: "77 College St, Asheville, NC", originZip: "28801",
      destAddress: "18 Maple St, Asheville, NC", destZip: "28801",
      distanceMiles: 8, homeSize: "ONE_BED", estimatedVolumeCuFt: 560, estimatedWeightLbs: 3920,
      laborHours: 3, crewSize: 2, items: [], addons: [], tiers: q2Tiers,
      breakdown: { lineItems: [], addonItems: [], baseSubtotal: 720, addonsTotal: 0, tiers: q2Tiers },
      aiConfidence: "heuristic", status: "BOOKED",
    },
  });
  const t2 = q2Tiers[0];
  await prisma.booking.create({
    data: {
      reference: ref("BBM-B"), quote: { connect: { id: quote2.id } }, user: { connect: { id: customer.id } },
      selectedTier: "basic", totalAmount: t2.price, depositAmount: t2.deposit, balanceAmount: t2.balance,
      scheduledDate: daysFrom(-45), timeSlot: "10:00 AM – 12:00 PM", crew: { connect: { id: panda.id } }, status: "COMPLETED",
      payment: { create: { amount: t2.deposit, kind: "DEPOSIT", status: "PAID", last4: "1881", reference: ref("BBM-PAY") } },
      events: { create: [{ status: "COMPLETED", title: "Move complete", detail: "All done — welcome home!", createdAt: daysFrom(-45) }] },
    },
  });

  // ── 3) Open (unbooked) quote for the dashboard ────────────────
  const q3Tiers = tiers(2050);
  await prisma.quote.create({
    data: {
      reference: ref("BBM-Q"), user: { connect: { id: customer.id } },
      contactName: customer.name, contactEmail: customer.email,
      originAddress: "402 Ridgeline Dr, Weaverville, NC", originZip: "28787",
      destAddress: "9100 Lakeview Rd, Charlotte, NC", destZip: "28216",
      distanceMiles: 132, homeSize: "THREE_BED", estimatedVolumeCuFt: 1480, estimatedWeightLbs: 10360,
      laborHours: 6, crewSize: 4, items: [], addons: ["packing"], tiers: q3Tiers,
      breakdown: { lineItems: [], addonItems: [], baseSubtotal: 2050, addonsTotal: 0, tiers: q3Tiers },
      aiSummary: "A 3-bedroom long-distance move (~132 mi) with full packing. Estimated 1,480 cu ft and a crew of 4.",
      aiConfidence: "heuristic", status: "SENT", expiresAt: daysFrom(14),
    },
  });

  // A couple of extra bookings for a fuller admin ops board
  const walkins = [
    { name: "Priya Shah", from: "Hendersonville, NC", to: "Arden, NC", status: "CREW_ASSIGNED", day: 3, slot: "12:00 PM – 2:00 PM", crew: kodiak.id, base: 860 },
    { name: "Dylan Ross", from: "Black Mountain, NC", to: "Asheville, NC", status: "CONFIRMED", day: 6, slot: "2:00 PM – 4:00 PM", crew: panda.id, base: 640 },
  ];
  for (const w of walkins) {
    const tt = tiers(w.base);
    const q = await prisma.quote.create({
      data: {
        reference: ref("BBM-Q"), contactName: w.name, contactEmail: `${w.name.split(" ")[0].toLowerCase()}@example.com`,
        originAddress: w.from, destAddress: w.to, distanceMiles: 14, homeSize: "TWO_BED",
        estimatedVolumeCuFt: 800, estimatedWeightLbs: 5600, laborHours: 4, crewSize: 3,
        items: [], addons: [], tiers: tt, breakdown: { lineItems: [], addonItems: [], baseSubtotal: w.base, addonsTotal: 0, tiers: tt },
        aiConfidence: "heuristic", status: "BOOKED",
      },
    });
    const tsel = tt[1];
    await prisma.booking.create({
      data: {
        reference: ref("BBM-B"), quote: { connect: { id: q.id } }, user: { connect: { id: customer.id } }, selectedTier: "standard",
        totalAmount: tsel.price, depositAmount: tsel.deposit, balanceAmount: tsel.balance,
        scheduledDate: daysFrom(w.day), timeSlot: w.slot, crew: { connect: { id: w.crew } }, status: w.status,
        payment: { create: { amount: tsel.deposit, kind: "DEPOSIT", status: "PAID", last4: "0005", reference: ref("BBM-PAY") } },
        events: { create: [{ status: "CONFIRMED", title: "Booking confirmed", detail: "Deposit received." }] },
      },
    });
  }

  console.log("✅ Seed complete.");
  console.log("   Admin:    admin@brotherbearmoving.com / movingbears");
  console.log("   Customer: jordan@example.com / movingbears");
  console.log(`   Live move to track: ${booking1.reference}`);
}

// Auto-run only when executed directly (e.g. `npm run db:seed`), not when
// imported by the seed guard.
const invokedPath = process.argv[1]?.replace(/\\/g, "/") ?? "";
if (invokedPath.endsWith("prisma/seed.ts")) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
