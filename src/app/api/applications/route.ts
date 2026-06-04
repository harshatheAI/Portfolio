import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const applySchema = z.object({
  jobId: z.string(),
  coverLetter: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "CANDIDATE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = applySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { jobId, coverLetter } = parsed.data;

  const candidate = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!candidate) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const job = await prisma.job.findFirst({ where: { id: jobId, published: true } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const existing = await prisma.application.findFirst({
    where: { jobId, candidateId: candidate.id },
  });
  if (existing) return NextResponse.json({ error: "Already applied" }, { status: 409 });

  // Get AI match score if it exists
  const match = await prisma.jobMatch.findFirst({
    where: { jobId, candidateId: candidate.id },
  });

  const application = await prisma.application.create({
    data: {
      jobId,
      candidateId: candidate.id,
      coverLetter,
      matchScore: match?.overallScore,
      matchExplanation: match?.explanation,
      appliedVia: "web",
    },
  });

  // Record status history
  await prisma.applicationStatusHistory.create({
    data: {
      applicationId: application.id,
      toStatus: "APPLIED",
      automated: false,
    },
  });

  return NextResponse.json({ success: true, applicationId: application.id });
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const applications = await prisma.application.findMany({
    where: { candidate: { userId: session.user.id } },
    include: {
      job: { include: { company: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications });
}
