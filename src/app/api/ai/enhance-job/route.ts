import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { anthropic, CLAUDE_MODEL } from "@/lib/ai/client";
import { JOB_ENHANCEMENT_SYSTEM_PROMPT, BIAS_CHECK_SYSTEM_PROMPT } from "@/lib/ai/prompts/matching";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { description, title, context } = await req.json();
    if (!description) return NextResponse.json({ error: "Description required" }, { status: 400 });

    const [enhancedResponse, biasResponse] = await Promise.all([
      anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 2000,
        temperature: 0.7,
        system: JOB_ENHANCEMENT_SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `Improve this job description for a ${title || "role"} (${context?.workMode || ""} ${context?.jobType || ""}). Return only the improved text:\n\n${description}`,
        }],
      }),
      anthropic.messages.create({
        model: CLAUDE_MODEL,
        max_tokens: 500,
        temperature: 0.2,
        system: BIAS_CHECK_SYSTEM_PROMPT,
        messages: [{
          role: "user",
          content: `Check this job description for bias:\n\n${description}`,
        }],
      }),
    ]);

    const enhanced = enhancedResponse.content[0].type === "text" ? enhancedResponse.content[0].text : "";
    const biasText = biasResponse.content[0].type === "text" ? biasResponse.content[0].text : "{}";

    let biasIssues = [];
    try {
      const biasJson = biasText.match(/\{[\s\S]*\}/);
      if (biasJson) {
        const parsed = JSON.parse(biasJson[0]);
        biasIssues = parsed.issues || [];
      }
    } catch {
      biasIssues = [];
    }

    return NextResponse.json({ enhanced, biasIssues });
  } catch (error) {
    console.error("AI enhance error:", error);
    return NextResponse.json({ error: "AI enhancement failed" }, { status: 500 });
  }
}
