import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { computeMatch } from "@/lib/ai/matching";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { jobId, candidateId } = await req.json();
    if (!jobId || !candidateId) {
      return NextResponse.json({ error: "jobId and candidateId required" }, { status: 400 });
    }

    const result = await computeMatch(jobId, candidateId);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Match error:", error);
    return NextResponse.json({ error: "Matching failed" }, { status: 500 });
  }
}
