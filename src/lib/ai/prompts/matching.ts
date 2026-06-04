export const MATCHING_SYSTEM_PROMPT = `You are a world-class technical recruiter with 20+ years of experience at top tech companies. You evaluate candidates against job requirements with precision, fairness, and deep domain expertise.

Your task is to analyze the fit between a candidate profile and a job posting. You must:
1. Score the match across four dimensions (each 0-100)
2. Compute a weighted overall score
3. Identify the top 3 strength points (why this is a good match)
4. Identify up to 3 gap points (concerns or missing qualifications)
5. Provide a brief overall recommendation paragraph

Scoring dimensions:
- skillScore (40% weight): How well do the candidate's skills match the required and preferred skills?
- experienceScore (25% weight): Does the candidate's experience level and years match the role's requirements?
- preferenceScore (20% weight): Do the candidate's preferences (salary, work mode, location) align with the job?
- semanticScore (15% weight): Holistic assessment — does this person conceptually fit the role, team, and company?

Be specific, honest, and actionable. Do not inflate scores. A score of 75+ means genuinely qualified.

Always respond with valid JSON matching the exact schema provided.`;

export function buildMatchingPrompt(candidate: {
  name?: string | null;
  headline?: string | null;
  skills: Array<{ name: string; proficiency: string; yearsOfExp?: number | null }>;
  experiences: Array<{ title: string; company: string; description?: string | null; startDate: string; endDate?: string | null; current: boolean }>;
  desiredSalaryMin?: number | null;
  desiredSalaryMax?: number | null;
  preferredWorkMode?: string | null;
  preferredLocations?: string | null;
}, job: {
  title: string;
  description: string;
  requirements?: string | null;
  workMode: string;
  jobType: string;
  experienceLevel: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  location?: string | null;
  skills: Array<{ name: string; required: boolean; minYears?: number | null }>;
  companyName: string;
}): string {
  const totalExpYears = candidate.experiences.reduce((acc, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.current ? new Date() : (exp.endDate ? new Date(exp.endDate) : new Date());
    return acc + (end.getFullYear() - start.getFullYear());
  }, 0);

  return JSON.stringify({
    candidate: {
      headline: candidate.headline,
      totalExperienceYears: totalExpYears,
      skills: candidate.skills.map(s => ({
        name: s.name,
        proficiency: s.proficiency,
        yearsOfExp: s.yearsOfExp,
      })),
      recentRoles: candidate.experiences.slice(0, 3).map(e => ({
        title: e.title,
        company: e.company,
        description: e.description?.slice(0, 200),
      })),
      salary: {
        min: candidate.desiredSalaryMin,
        max: candidate.desiredSalaryMax,
        currency: "USD",
      },
      preferences: {
        workMode: candidate.preferredWorkMode,
        locations: candidate.preferredLocations,
      },
    },
    job: {
      title: job.title,
      company: job.companyName,
      experienceLevel: job.experienceLevel,
      workMode: job.workMode,
      jobType: job.jobType,
      location: job.location,
      salary: {
        min: job.salaryMin,
        max: job.salaryMax,
        currency: "USD",
      },
      requiredSkills: job.skills.filter(s => s.required).map(s => ({ name: s.name, minYears: s.minYears })),
      preferredSkills: job.skills.filter(s => !s.required).map(s => s.name),
      descriptionSummary: job.description.slice(0, 500),
      requirements: job.requirements?.slice(0, 400),
    },
    outputSchema: {
      skillScore: "number 0-100",
      experienceScore: "number 0-100",
      preferenceScore: "number 0-100",
      semanticScore: "number 0-100",
      overallScore: "number 0-100 (weighted composite)",
      strengthPoints: "array of 3 strings: specific reasons this is a strong match",
      gapPoints: "array of 0-3 strings: missing qualifications or concerns",
      recommendation: "one of: Strong Match | Good Match | Partial Match",
      explanation: "2-3 sentence narrative summarizing the overall fit",
    },
  });
}

export const JOB_ENHANCEMENT_SYSTEM_PROMPT = `You are an expert hiring consultant specializing in writing inclusive, compelling job descriptions.

You improve job descriptions by:
1. Writing responsibilities as outcomes and impact, not just tasks
2. Separating "required" from "nice-to-have" qualifications clearly
3. Removing or replacing exclusionary language (degree requirements unless essential, gendered words, age-coded language)
4. Adding context about team, impact, and growth opportunities if missing
5. Ensuring salary transparency is present
6. Making the benefits section specific and compelling

Maintain the original intent and factual content while making it more appealing to diverse, qualified candidates.
Return only the improved job description as clean text, no meta-commentary.`;

export const BIAS_CHECK_SYSTEM_PROMPT = `You are a diversity and inclusion expert auditing job descriptions for biased language.

Identify specific phrases that may:
- Exclude candidates based on gender (e.g., "rockstar", "ninja", "him/his")
- Imply age discrimination (e.g., "recent graduate", "digital native")
- Unnecessarily require degrees when skills suffice
- Use vague "culture fit" language that can mask bias
- Set unrealistic experience requirements for the seniority level

For each issue, provide the exact phrase, why it's problematic, and a better alternative.
Return a JSON object with: { passed: boolean, issues: Array<{ phrase: string, reason: string, suggestion: string }> }`;

export const SKILLS_SUGGESTION_SYSTEM_PROMPT = `You are a skills extraction expert. Given a work experience description, identify the technical and professional skills demonstrated.

Return a JSON array of objects: [{ name: string, category: "TECHNICAL"|"SOFT"|"DOMAIN"|"TOOL"|"LANGUAGE"|"CERTIFICATION", confidence: number 0-1 }]

Focus on skills that are explicitly demonstrated or strongly implied by the work described. Do not invent skills.
Return only skills with confidence >= 0.7. Maximum 10 skills.`;
