import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = await prisma.quote.findFirst({
    where: { OR: [{ id }, { reference: id }] },
    include: { booking: { select: { id: true, reference: true } } },
  });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  return NextResponse.json({ data: quote });
}
