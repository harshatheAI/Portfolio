import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { agencyName, website, teamSize } = await req.json();

    await prisma.agencyProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, agencyName: agencyName || "My Agency", website: website || null, teamSize: teamSize ? parseInt(teamSize) || null : null },
      update: { agencyName: agencyName || "My Agency", website: website || null },
    });

    await prisma.user.update({ where: { id: session.user.id }, data: { onboardingDone: true } });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Agency onboarding error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
