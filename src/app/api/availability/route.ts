import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateAvailability } from "@/lib/availability";
import { format } from "date-fns";

export async function GET() {
  // Fold in real bookings so already-taken slots reflect immediately.
  const upcoming = await prisma.booking.findMany({
    where: { scheduledDate: { gte: new Date() }, status: { not: "CANCELLED" } },
    select: { scheduledDate: true, timeSlot: true },
  });

  const existing: Record<string, number> = {};
  for (const b of upcoming) {
    const key = `${format(b.scheduledDate, "yyyy-MM-dd")}|${b.timeSlot}`;
    existing[key] = (existing[key] ?? 0) + 1;
  }

  const days = generateAvailability(new Date(), 24, existing);
  return NextResponse.json({ data: days });
}
