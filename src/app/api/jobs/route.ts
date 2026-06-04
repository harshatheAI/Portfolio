import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const workMode = searchParams.get("workMode") || "";
  const jobType = searchParams.get("jobType") || "";
  const experienceLevel = searchParams.get("experienceLevel") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: Record<string, unknown> = { published: true };
  if (workMode) where.workMode = workMode;
  if (jobType) where.jobType = jobType;
  if (experienceLevel) where.experienceLevel = experienceLevel;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { company: { name: { contains: search } } },
    ];
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: true,
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ data: jobs, meta: { total, page, limit } });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, location, workMode, jobType, experienceLevel, salaryMin, salaryMax, skills, published } = body;

    const recruiter = await prisma.recruiterProfile.findUnique({
      where: { userId: session.user.id },
      include: { company: true },
    });
    if (!recruiter?.companyId) {
      return NextResponse.json({ error: "Recruiter profile not found" }, { status: 400 });
    }

    const baseSlug = generateSlug(title);
    const slug = `${baseSlug}-${Date.now()}`;

    const job = await prisma.job.create({
      data: {
        title,
        slug,
        description,
        location: location || null,
        workMode: workMode || "REMOTE",
        jobType: jobType || "FULL_TIME",
        experienceLevel: experienceLevel || "MID",
        salaryMin: salaryMin || null,
        salaryMax: salaryMax || null,
        published: published ?? false,
        publishedAt: published ? new Date() : null,
        recruiterId: recruiter.id,
        companyId: recruiter.companyId,
        skills: {
          create: await Promise.all(
            (skills || []).map(async (s: { name: string; required?: boolean; minYears?: number }) => {
              const skillSlug = generateSlug(s.name);
              const skill = await prisma.skill.upsert({
                where: { slug: skillSlug },
                create: { name: s.name, slug: skillSlug, category: "TECHNICAL" },
                update: {},
              });
              return { skillId: skill.id, required: s.required ?? true, minYears: s.minYears ?? null };
            })
          ),
        },
      },
    });

    return NextResponse.json({ data: job }, { status: 201 });
  } catch (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
