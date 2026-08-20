import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nextStatus, stageFor, etaLabel, type MoveStatus } from "@/lib/tracking";

async function loadBooking(id: string) {
  return prisma.booking.findFirst({
    where: { OR: [{ id }, { reference: id }] },
    include: {
      crew: true,
      quote: { select: { originAddress: true, destAddress: true, distanceMiles: true } },
      events: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const booking = await loadBooking(id);
  if (!booking) return NextResponse.json({ error: "Move not found" }, { status: 404 });

  return NextResponse.json({
    data: {
      reference: booking.reference,
      status: booking.status,
      scheduledDate: booking.scheduledDate,
      timeSlot: booking.timeSlot,
      etaMinutes: booking.etaMinutes,
      etaLabel: etaLabel(booking.status as MoveStatus, booking.etaMinutes),
      crew: booking.crew ? { name: booking.crew.name, lead: booking.crew.lead, size: booking.crew.size, phone: booking.crew.phone } : null,
      origin: booking.quote.originAddress,
      destination: booking.quote.destAddress,
      distanceMiles: booking.quote.distanceMiles,
      crewLat: booking.crewLat,
      crewLng: booking.crewLng,
      events: booking.events,
    },
  });
}

/** Demo control: advance the move to the next stage (also used by admin ops board). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const booking = await loadBooking(id);
  if (!booking) return NextResponse.json({ error: "Move not found" }, { status: 404 });

  const target: MoveStatus | null =
    (body.status as MoveStatus) || nextStatus(booking.status as MoveStatus);
  if (!target) return NextResponse.json({ error: "Move is already complete." }, { status: 400 });

  const stage = stageFor(target);
  const eta = target === "EN_ROUTE" ? 22 : target === "IN_TRANSIT" ? 14 : target === "LOADING" ? 8 : null;

  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: target,
      etaMinutes: eta,
      events: {
        create: { status: target, title: stage.title, detail: stage.customerDetail },
      },
    },
  });

  return NextResponse.json({ data: { status: target } });
}
