import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { bookingInputSchema } from "@/lib/schemas";
import { makeReference, parseJson } from "@/lib/utils";
import type { Tier } from "@/lib/pricing";
import { generateAvailability, isSlotAvailable } from "@/lib/availability";
import { format } from "date-fns";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: { quote: true, crew: true, payment: true },
    orderBy: { scheduledDate: "asc" },
  });
  return NextResponse.json({ data: bookings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = bookingInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const input = parsed.data;

    const quote = await prisma.quote.findUnique({
      where: { id: input.quoteId },
      include: { booking: { select: { id: true } } },
    });
    if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    if (quote.booking || quote.status === "BOOKED") {
      return NextResponse.json({ error: "This quote is already booked." }, { status: 409 });
    }

    const tiers = parseJson<Tier[]>(quote.tiers, []);
    const tier = tiers.find((t) => t.id === input.selectedTier);
    if (!tier) return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });

    // ── Resolve the customer account ──────────────────────────────
    const session = await auth();
    let userId = session?.user?.id ?? null;

    if (!userId) {
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        // Don't silently attach to someone else's account.
        return NextResponse.json(
          { error: "An account with this email exists. Please sign in to finish booking.", needsLogin: true },
          { status: 409 },
        );
      }
      if (!input.password) {
        return NextResponse.json({ error: "Create a password to set up your account." }, { status: 400 });
      }
      const user = await prisma.user.create({
        data: {
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          passwordHash: await bcrypt.hash(input.password, 12),
          role: "CUSTOMER",
        },
      });
      userId = user.id;
    }

    // ── Validate the requested slot ───────────────────────────────
    const days = generateAvailability(new Date(), 30);
    const day = days.find((d) => d.date === input.scheduledDate);
    if (!day || !day.isOpen || !isSlotAvailable(day, input.timeSlot)) {
      return NextResponse.json({ error: "That time slot is no longer available. Please pick another." }, { status: 409 });
    }

    // ── Mock payment (deposit) ────────────────────────────────────
    const digits = input.cardNumber.replace(/\D/g, "");
    const declined = digits.startsWith("0000") || input.cardCvc === "000";
    if (declined) {
      return NextResponse.json({ error: "Your card was declined. Please try a different card." }, { status: 402 });
    }
    const last4 = digits.slice(-4);

    // ── Assign the next crew (simple round-robin by load) ─────────
    const crews = await prisma.crew.findMany({ where: { active: true }, include: { _count: { select: { bookings: true } } } });
    const crew = crews.sort((a, b) => a._count.bookings - b._count.bookings)[0];

    const scheduledDate = new Date(`${input.scheduledDate}T12:00:00`);

    const booking = await prisma.booking.create({
      data: {
        reference: makeReference("BBM-B"),
        quote: { connect: { id: quote.id } },
        user: { connect: { id: userId } },
        selectedTier: tier.id,
        totalAmount: tier.price,
        depositAmount: tier.deposit,
        balanceAmount: tier.balance,
        scheduledDate,
        timeSlot: input.timeSlot,
        ...(crew ? { crew: { connect: { id: crew.id } } } : {}),
        status: "CONFIRMED",
        payment: {
          create: {
            amount: tier.deposit,
            kind: "DEPOSIT",
            status: "PAID",
            method: "card",
            last4,
            reference: makeReference("BBM-PAY"),
          },
        },
        events: {
          create: [
            {
              status: "CONFIRMED",
              title: "Booking confirmed",
              detail: `Deposit of $${tier.deposit} received. Balance of $${tier.balance} due on move day.`,
            },
            ...(crew
              ? [{ status: "CREW_ASSIGNED", title: "Crew assigned", detail: `${crew.name} (lead: ${crew.lead}) will handle your move.` }]
              : []),
          ],
        },
      },
      include: { crew: true, payment: true, quote: true },
    });

    await prisma.quote.update({
      where: { id: quote.id },
      data: { status: "BOOKED", user: { connect: { id: userId } } },
    });

    return NextResponse.json({
      data: {
        id: booking.id,
        reference: booking.reference,
        scheduledDate: format(scheduledDate, "yyyy-MM-dd"),
        timeSlot: booking.timeSlot,
        tier,
        crew: booking.crew,
        deposit: booking.depositAmount,
        balance: booking.balanceAmount,
      },
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "We couldn't complete your booking. Please try again." }, { status: 500 });
  }
}
