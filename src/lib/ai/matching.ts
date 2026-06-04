import { anthropic, CLAUDE_MODEL } from "./client";
import { MATCHING_SYSTEM_PROMPT, buildMatchingPrompt } from "./prompts/matching";
import { prisma } from "@/lib/prisma";

export interface MatchResult {
  skillScore: number;
  experienceScore: number;
  preferenceScore: number;
  semanticScore: number;
  overallScore: number;
  strengthPoints: string[];
  gapPoints: string[];
  recommendation: "Strong Match" | "Good Match" | "Partial Match";
  explanation: string;
}

export async function computeMatch(jobId: string, candidateId: string): Promise<MatchResult> {
  const [job, candidate] = await Promise.all([
    prisma.job.findUniqueOrThrow({
      where: { id: jobId },
      include: {
        skills: { include: { skill: true } },
        company: true,
      },
    }),
    prisma.candidateProfile.findUniqueOrThrow({
      where: { id: candidateId },
      include: {
        skills: { include: { skill: true } },
        experiences: { orderBy: { startDate: "desc" } },
      },
    }),
  ]);

  const prompt = buildMatchingPrompt(
    {
      headline: candidate.headline,
      skills: candidate.skills.map(cs => ({
        name: cs.skill.name,
        proficiency: cs.proficiency,
        yearsOfExp: cs.yearsOfExp,
      })),
      experiences: candidate.experiences.map(e => ({
        title: e.title,
        company: e.company,
        description: e.description,
        startDate: e.startDate.toISOString(),
        endDate: e.endDate?.toISOString(),
        current: e.current,
      })),
      desiredSalaryMin: candidate.desiredSalaryMin,
      desiredSalaryMax: candidate.desiredSalaryMax,
      preferredWorkMode: candidate.preferredWorkMode,
      preferredLocations: candidate.preferredLocations,
    },
    {
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      workMode: job.workMode,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      location: job.location,
      skills: job.skills.map(js => ({
        name: js.skill.name,
        required: js.required,
        minYears: js.minYears,
      })),
      companyName: job.company.name,
    }
  );

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    temperature: 0.2,
    system: MATCHING_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analyze the fit for this candidate-job pair and return a JSON object matching the outputSchema:\n\n${prompt}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI returned no valid JSON");

  const result = JSON.parse(jsonMatch[0]) as MatchResult;

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await prisma.jobMatch.upsert({
    where: { jobId_candidateId: { jobId, candidateId } },
    create: {
      jobId,
      candidateId,
      overallScore: result.overallScore,
      skillScore: result.skillScore,
      experienceScore: result.experienceScore,
      preferenceScore: result.preferenceScore,
      semanticScore: result.semanticScore,
      strengthPoints: JSON.stringify(result.strengthPoints),
      gapPoints: JSON.stringify(result.gapPoints),
      recommendation: result.recommendation,
      explanation: result.explanation,
      expiresAt,
    },
    update: {
      overallScore: result.overallScore,
      skillScore: result.skillScore,
      experienceScore: result.experienceScore,
      preferenceScore: result.preferenceScore,
      semanticScore: result.semanticScore,
      strengthPoints: JSON.stringify(result.strengthPoints),
      gapPoints: JSON.stringify(result.gapPoints),
      recommendation: result.recommendation,
      explanation: result.explanation,
      computedAt: new Date(),
      expiresAt,
    },
  });

  return result;
}
