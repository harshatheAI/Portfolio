import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { companyName, industry, companySize, companyWebsite, recruiterTitle } = await req.json();

    const slug = generateSlug(companyName || "company") + "-" + Date.now();

    const company = await prisma.company.create({
      data: {
        name: companyName || "My Company",
        slug,
        industry: industry || null,
        size: companySize || null,
        website: companyWebsite || null,
      },
    });

    await prisma.recruiterProfile.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, companyId: company.id, title: recruiterTitle || null },
      update: { companyId: company.id, title: recruiterTitle || null },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingDone: true },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Recruiter onboarding error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
