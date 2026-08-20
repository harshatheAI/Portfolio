import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pricingConfigSchema } from "@/lib/schemas";
import { getPricingConfig } from "@/lib/config";

export async function GET() {
  const cfg = await getPricingConfig();
  return NextResponse.json({ data: cfg });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = pricingConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid values", details: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.pricingConfig.findFirst({ where: { isActive: true } });
  const saved = existing
    ? await prisma.pricingConfig.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.pricingConfig.create({ data: { ...parsed.data, isActive: true } });

  return NextResponse.json({ data: saved });
}
