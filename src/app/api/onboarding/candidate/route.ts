import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { headline, location, summary, skills, experience, preferences } = body;

    await prisma.$transaction(async (tx) => {
      // Create candidate profile
      const profile = await tx.candidateProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          headline,
          location,
          summary,
          desiredSalaryMin: preferences?.salaryMin,
          desiredSalaryMax: preferences?.salaryMax,
          preferredWorkMode: preferences?.workMode,
          preferredJobTypes: preferences?.jobType ? JSON.stringify([preferences.jobType]) : null,
        },
        update: {
          headline,
          location,
          summary,
          desiredSalaryMin: preferences?.salaryMin,
          desiredSalaryMax: preferences?.salaryMax,
          preferredWorkMode: preferences?.workMode,
        },
      });

      // Add skills
      for (const skillData of (skills || [])) {
        const slug = generateSlug(skillData.name);
        const skill = await tx.skill.upsert({
          where: { slug },
          create: { name: skillData.name, slug, category: "TECHNICAL" },
          update: {},
        });

        await tx.candidateSkill.upsert({
          where: { candidateId_skillId: { candidateId: profile.id, skillId: skill.id } },
          create: {
            candidateId: profile.id,
            skillId: skill.id,
            proficiency: skillData.proficiency || "INTERMEDIATE",
            yearsOfExp: skillData.yearsOfExp || null,
          },
          update: {
            proficiency: skillData.proficiency || "INTERMEDIATE",
            yearsOfExp: skillData.yearsOfExp || null,
          },
        });
      }

      // Add experience
      if (experience?.title) {
        await tx.workExperience.create({
          data: {
            candidateId: profile.id,
            title: experience.title,
            company: experience.company || "Unknown",
            description: experience.description || null,
            startDate: new Date(`${experience.startYear || 2020}-01-01`),
            current: experience.current ?? true,
          },
        });
      }
    });

    // Mark onboarding complete
    await prisma.user.update({
      where: { id: session.user.id },
      data: { onboardingDone: true },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
