import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: { include: { skill: true }, orderBy: { featured: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
    },
  });

  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    headline, summary, location,
    linkedinUrl, githubUrl, portfolioUrl,
    desiredSalaryMin, desiredSalaryMax, preferredWorkMode,
    skills,
  } = body;

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  await prisma.candidateProfile.update({
    where: { userId: session.user.id },
    data: {
      headline: headline || null,
      summary: summary || null,
      location: location || null,
      linkedinUrl: linkedinUrl || null,
      githubUrl: githubUrl || null,
      portfolioUrl: portfolioUrl || null,
      desiredSalaryMin: desiredSalaryMin || null,
      desiredSalaryMax: desiredSalaryMax || null,
      preferredWorkMode: preferredWorkMode || null,
    },
  });

  // Update skills if provided
  if (Array.isArray(skills)) {
    // Delete all existing and re-create (simple upsert strategy)
    await prisma.candidateSkill.deleteMany({ where: { candidateId: profile.id } });

    for (const s of skills) {
      // Find or create skill in skills table
      const skill = await prisma.skill.upsert({
        where: { slug: s.name.toLowerCase().replace(/\s+/g, "-") },
        create: {
          name: s.name,
          slug: s.name.toLowerCase().replace(/\s+/g, "-"),
          category: "TECHNICAL",
        },
        update: {},
      });

      await prisma.candidateSkill.create({
        data: {
          candidateId: profile.id,
          skillId: skill.id,
          proficiency: s.proficiency || "INTERMEDIATE",
          yearsOfExp: s.yearsOfExp || 1,
          featured: s.featured || false,
        },
      });
    }
  }

  // Recalculate profile score
  const updatedProfile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: { skills: true },
  });

  if (updatedProfile) {
    let score = 0;
    if (updatedProfile.headline) score += 20;
    if (updatedProfile.summary) score += 10;
    if (updatedProfile.location) score += 10;
    if (updatedProfile.skills.length >= 3) score += 30;
    if (updatedProfile.desiredSalaryMin) score += 15;
    if (updatedProfile.preferredWorkMode) score += 15;

    await prisma.candidateProfile.update({
      where: { userId: session.user.id },
      data: { profileScore: score },
    });
  }

  return NextResponse.json({ success: true });
}
