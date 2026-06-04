import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("Seeding database...");

  // Demo users
  const hashedPassword = await bcrypt.hash("demo12345", 12);

  // Candidate
  const candidateUser = await prisma.user.upsert({
    where: { email: "candidate@demo.com" },
    update: {},
    create: {
      email: "candidate@demo.com",
      name: "Alex Chen",
      passwordHash: hashedPassword,
      role: "CANDIDATE",
      onboardingDone: true,
    },
  });

  // Recruiter
  const recruiterUser = await prisma.user.upsert({
    where: { email: "recruiter@demo.com" },
    update: {},
    create: {
      email: "recruiter@demo.com",
      name: "Sarah Rodriguez",
      passwordHash: hashedPassword,
      role: "RECRUITER",
      onboardingDone: true,
    },
  });

  // Agency
  const agencyUser = await prisma.user.upsert({
    where: { email: "agency@demo.com" },
    update: {},
    create: {
      email: "agency@demo.com",
      name: "Marcus Johnson",
      passwordHash: hashedPassword,
      role: "AGENCY",
      onboardingDone: true,
    },
  });

  // Skills
  const skillsData = [
    { name: "React", slug: "react", category: "TECHNICAL" },
    { name: "TypeScript", slug: "typescript", category: "TECHNICAL" },
    { name: "Next.js", slug: "nextjs", category: "TECHNICAL" },
    { name: "Node.js", slug: "nodejs", category: "TECHNICAL" },
    { name: "Python", slug: "python", category: "TECHNICAL" },
    { name: "PostgreSQL", slug: "postgresql", category: "TOOL" },
    { name: "AWS", slug: "aws", category: "TOOL" },
    { name: "Docker", slug: "docker", category: "TOOL" },
    { name: "GraphQL", slug: "graphql", category: "TECHNICAL" },
    { name: "Machine Learning", slug: "machine-learning", category: "TECHNICAL" },
    { name: "SQL", slug: "sql", category: "TECHNICAL" },
    { name: "Product Management", slug: "product-management", category: "DOMAIN" },
    { name: "Leadership", slug: "leadership", category: "SOFT" },
    { name: "Figma", slug: "figma", category: "TOOL" },
  ];

  const skills: Record<string, { id: string }> = {};
  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      create: s,
      update: {},
    });
    skills[s.slug] = skill;
  }

  // Candidate profile
  const candidateProfile = await prisma.candidateProfile.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      headline: "Senior Full-Stack Engineer · Open to remote",
      summary: "5+ years building scalable web applications. Passionate about developer experience and clean architecture.",
      location: "San Francisco, CA",
      desiredSalaryMin: 150000,
      desiredSalaryMax: 200000,
      preferredWorkMode: "REMOTE",
      profileScore: 85,
    },
  });

  // Add skills to candidate
  for (const [slug, level] of [
    ["react", "EXPERT"],
    ["typescript", "EXPERT"],
    ["nextjs", "ADVANCED"],
    ["nodejs", "ADVANCED"],
    ["postgresql", "INTERMEDIATE"],
    ["aws", "INTERMEDIATE"],
  ]) {
    const skill = skills[slug];
    if (skill) {
      await prisma.candidateSkill.upsert({
        where: { candidateId_skillId: { candidateId: candidateProfile.id, skillId: skill.id } },
        update: {},
        create: {
          candidateId: candidateProfile.id,
          skillId: skill.id,
          proficiency: level,
          yearsOfExp: level === "EXPERT" ? 5 : 3,
          featured: ["react", "typescript"].includes(slug),
        },
      });
    }
  }

  // Work experience
  await prisma.workExperience.upsert({
    where: { id: "exp-demo-1" },
    update: {},
    create: {
      id: "exp-demo-1",
      candidateId: candidateProfile.id,
      title: "Senior Software Engineer",
      company: "TechCorp",
      location: "San Francisco, CA",
      startDate: new Date("2021-01-01"),
      current: true,
      description: "Built scalable microservices handling 10M+ daily requests. Led migration from REST to GraphQL.",
    },
  });

  // Company
  const company1 = await prisma.company.upsert({
    where: { slug: "nexus-ai-demo" },
    update: {},
    create: {
      name: "Nexus AI",
      slug: "nexus-ai-demo",
      industry: "SaaS / AI",
      size: "51–200",
      description: "Building the future of AI-powered productivity tools.",
      location: "San Francisco, CA",
    },
  });

  const company2 = await prisma.company.upsert({
    where: { slug: "finflow-demo" },
    update: {},
    create: {
      name: "FinFlow",
      slug: "finflow-demo",
      industry: "FinTech",
      size: "201–500",
      description: "Modernizing financial infrastructure for enterprises.",
      location: "New York, NY",
    },
  });

  const company3 = await prisma.company.upsert({
    where: { slug: "health-ai-demo" },
    update: {},
    create: {
      name: "HealthAI",
      slug: "health-ai-demo",
      industry: "HealthTech",
      size: "11–50",
      description: "AI-powered healthcare diagnostics platform.",
      location: "Boston, MA",
    },
  });

  // Recruiter profile
  const recruiterProfile = await prisma.recruiterProfile.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      companyId: company1.id,
      title: "Head of Engineering Talent",
    },
  });

  // Jobs
  const jobs = [
    {
      id: "job-demo-1",
      title: "Senior Full-Stack Engineer",
      slug: "senior-full-stack-engineer-nexus-ai",
      description: `We're building the next generation of AI-powered tools and we need a Senior Full-Stack Engineer to help us scale.

## What you'll do
- Architect and build full-stack features across our React/Next.js frontend and Node.js backend
- Own features end-to-end from design to deployment
- Collaborate with AI/ML team to integrate models into user-facing products
- Mentor junior engineers and establish best practices

## What makes this role exciting
- Work on bleeding-edge AI products used by 100k+ users
- Significant ownership and autonomy from day one
- Direct impact on product direction
- Competitive equity package

## The team
You'll join a 12-person engineering team. We ship weekly and genuinely care about code quality and developer experience.`,
      requirements: "5+ years of full-stack experience, strong React/TypeScript skills, experience with cloud infrastructure.",
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      experienceLevel: "SENIOR",
      salaryMin: 160000,
      salaryMax: 220000,
      published: true,
      featured: true,
      companyId: company1.id,
      skills: ["react", "typescript", "nextjs", "nodejs", "aws"],
    },
    {
      id: "job-demo-2",
      title: "Backend Engineer (Python)",
      slug: "backend-engineer-python-finflow",
      description: `FinFlow is modernizing financial infrastructure and we're looking for a Backend Engineer with strong Python skills.

## The role
You'll work on our core transaction processing system that handles millions of dollars in daily volume.

## Responsibilities
- Build and maintain high-performance Python microservices
- Design and optimize PostgreSQL schemas for financial data
- Implement robust error handling and monitoring
- Work with compliance team to ensure regulatory requirements

## Compensation
Base: $140k–$180k + equity + benefits`,
      workMode: "HYBRID",
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      salaryMin: 140000,
      salaryMax: 180000,
      published: true,
      companyId: company2.id,
      skills: ["python", "postgresql", "docker", "aws"],
    },
    {
      id: "job-demo-3",
      title: "ML Engineer",
      slug: "ml-engineer-healthai",
      description: `HealthAI is using machine learning to improve patient outcomes. We need an ML Engineer to help us build and deploy models at scale.

## What you'll work on
- Train and fine-tune models for medical image analysis
- Build ML pipelines that run in production
- A/B test model improvements against clinical outcomes
- Collaborate with clinicians to understand requirements

## Requirements
- 3+ years of ML engineering experience
- Proficiency in Python and ML frameworks (PyTorch/TensorFlow)
- Experience with MLOps and model deployment`,
      workMode: "REMOTE",
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      salaryMin: 150000,
      salaryMax: 190000,
      published: true,
      companyId: company3.id,
      skills: ["python", "machine-learning", "aws", "docker"],
    },
    {
      id: "job-demo-4",
      title: "Product Engineer (Full-Stack)",
      slug: "product-engineer-nexus-ai",
      description: `We're looking for a product-minded engineer who loves working at the intersection of design and engineering.

## The role
You'll own entire product areas, from ideation through implementation. You'll work directly with users and help shape product direction.

## What we're looking for
- Strong full-stack skills (React + Node or Python)
- Excellent taste and product sense
- Ability to move fast without breaking things
- Comfortable with ambiguity`,
      workMode: "HYBRID",
      jobType: "FULL_TIME",
      experienceLevel: "MID",
      salaryMin: 140000,
      salaryMax: 180000,
      published: true,
      companyId: company1.id,
      skills: ["react", "typescript", "nodejs", "graphql"],
    },
    {
      id: "job-demo-5",
      title: "Staff Engineer, Platform",
      slug: "staff-engineer-platform-finflow",
      description: `FinFlow is scaling rapidly and we need a Staff Engineer to lead our platform infrastructure work.

## The opportunity
Lead technical direction for our core infrastructure serving 500+ enterprise clients. Define standards, make architectural decisions, and mentor a team of 8 engineers.

## Requirements
- 8+ years of software engineering experience
- Track record of leading technical initiatives
- Strong distributed systems background`,
      workMode: "HYBRID",
      jobType: "FULL_TIME",
      experienceLevel: "LEAD",
      salaryMin: 250000,
      salaryMax: 350000,
      published: true,
      featured: true,
      companyId: company2.id,
      skills: ["typescript", "aws", "docker", "postgresql"],
    },
  ];

  for (const jobData of jobs) {
    const { skills: jobSkills, ...jobFields } = jobData;
    await prisma.job.upsert({
      where: { id: jobFields.id },
      update: {},
      create: {
        ...jobFields,
        recruiterId: recruiterProfile.id,
        publishedAt: new Date(),
        skills: {
          create: jobSkills.map(slug => ({
            skillId: skills[slug]?.id || "",
            required: true,
          })).filter(s => s.skillId),
        },
      },
    });
  }

  // Agency profile
  await prisma.agencyProfile.upsert({
    where: { userId: agencyUser.id },
    update: {},
    create: {
      userId: agencyUser.id,
      agencyName: "TalentBridge Staffing",
      website: "https://talentbridge.demo",
      description: "Specialized tech talent placement for high-growth startups.",
      teamSize: 8,
    },
  });

  // AI Matches for demo candidate
  const jobsForMatch = await prisma.job.findMany({ where: { published: true }, take: 3 });
  for (const job of jobsForMatch) {
    await prisma.jobMatch.upsert({
      where: { jobId_candidateId: { jobId: job.id, candidateId: candidateProfile.id } },
      update: {},
      create: {
        jobId: job.id,
        candidateId: candidateProfile.id,
        overallScore: Math.floor(Math.random() * 30) + 65,
        skillScore: Math.floor(Math.random() * 20) + 75,
        experienceScore: Math.floor(Math.random() * 20) + 70,
        preferenceScore: Math.floor(Math.random() * 30) + 60,
        semanticScore: Math.floor(Math.random() * 25) + 65,
        strengthPoints: JSON.stringify([
          "Strong React and TypeScript skills match the core requirements",
          "5+ years experience aligns with the senior role expectations",
          "Remote preference matches the job's flexible work policy",
        ]),
        gapPoints: JSON.stringify(["Could benefit from more ML/AI exposure"]),
        recommendation: "Strong Match",
        explanation: "Alex is a strong match for this role. Their full-stack expertise and experience at scale closely aligns with what this team needs.",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("Demo accounts:");
  console.log("  candidate@demo.com / demo12345");
  console.log("  recruiter@demo.com / demo12345");
  console.log("  agency@demo.com / demo12345");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
