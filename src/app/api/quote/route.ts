import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { quoteInputSchema } from "@/lib/schemas";
import { analyzeMove } from "@/lib/ai/quote";
import { estimateDistanceMiles } from "@/lib/geo";
import { computeQuote } from "@/lib/pricing";
import { getPricingConfig } from "@/lib/config";
import { makeReference } from "@/lib/utils";
import { addDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = quoteInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please check your move details.", details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const input = parsed.data;

    // 1. Analyze the inventory (Claude vision when configured, else heuristic).
    const analysis = await analyzeMove({
      homeSize: input.homeSize,
      itemsDescription: input.itemsDescription,
      photos: input.photos,
    });

    // 2. Distance for mileage pricing.
    const distanceMiles = estimateDistanceMiles(input.originZip, input.destZip);

    // 3. Price it against the company's current guidelines.
    const cfg = await getPricingConfig();
    const breakdown = computeQuote(
      {
        distanceMiles,
        estimatedVolumeCuFt: analysis.estimatedVolumeCuFt,
        laborHours: analysis.laborHours,
        crewSize: analysis.crewSize,
        originFloor: input.originFloor,
        destFloor: input.destFloor,
        originElevator: input.originElevator,
        destElevator: input.destElevator,
        addons: input.addons,
        specialtyCount: Math.max(input.specialtyCount, analysis.specialtyCount),
        declaredValue: input.declaredValue,
        storageMonths: input.storageMonths,
      },
      cfg,
    );

    const session = await auth();

    // Persist lightweight photo refs (not the full base64) to keep the row small.
    const photoRefs = input.photos.map((_, i) => ({ index: i, note: `Photo ${i + 1}` }));

    const quote = await prisma.quote.create({
      data: {
        reference: makeReference("BBM-Q"),
        ...(session?.user?.id ? { user: { connect: { id: session.user.id } } } : {}),
        contactName: input.contactName || null,
        contactEmail: input.contactEmail || null,
        contactPhone: input.contactPhone || null,
        originAddress: input.originAddress,
        originZip: input.originZip || null,
        destAddress: input.destAddress,
        destZip: input.destZip || null,
        distanceMiles,
        homeSize: input.homeSize,
        originFloor: input.originFloor,
        destFloor: input.destFloor,
        originElevator: input.originElevator,
        destElevator: input.destElevator,
        preferredDate: input.preferredDate ? new Date(input.preferredDate) : null,
        flexibleDates: input.flexibleDates,
        itemsDescription: input.itemsDescription || null,
        items: analysis.items as unknown as Prisma.InputJsonValue,
        photos: photoRefs as unknown as Prisma.InputJsonValue,
        estimatedVolumeCuFt: analysis.estimatedVolumeCuFt,
        estimatedWeightLbs: analysis.estimatedWeightLbs,
        laborHours: analysis.laborHours,
        crewSize: analysis.crewSize,
        addons: input.addons as unknown as Prisma.InputJsonValue,
        tiers: breakdown.tiers as unknown as Prisma.InputJsonValue,
        breakdown: breakdown as unknown as Prisma.InputJsonValue,
        aiSummary: analysis.summary,
        aiConfidence: analysis.confidence,
        status: "SENT",
        expiresAt: addDays(new Date(), 14),
      },
    });

    return NextResponse.json({
      data: {
        id: quote.id,
        reference: quote.reference,
        analysis,
        distanceMiles,
        breakdown,
      },
    });
  } catch (error) {
    console.error("Quote error:", error);
    return NextResponse.json({ error: "We couldn't generate your quote. Please try again." }, { status: 500 });
  }
}
