export const ROLES = {
  CANDIDATE: "CANDIDATE",
  RECRUITER: "RECRUITER",
  AGENCY: "AGENCY",
  ADMIN: "ADMIN",
} as const;

export const JOB_TYPES = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  FREELANCE: "Freelance",
  INTERNSHIP: "Internship",
} as const;

export const WORK_MODES = {
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  ON_SITE: "On-site",
} as const;

export const EXPERIENCE_LEVELS = {
  ENTRY: "Entry Level",
  MID: "Mid Level",
  SENIOR: "Senior",
  LEAD: "Lead / Staff",
  EXECUTIVE: "Executive",
} as const;

export const APP_STATUSES = {
  APPLIED: "Applied",
  SHORTLISTED: "Shortlisted",
  AI_SCREENED: "AI Screened",
  PHONE_SCREEN: "Phone Screen",
  TECHNICAL: "Technical",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
} as const;

export const SKILL_CATEGORIES = {
  TECHNICAL: "Technical",
  SOFT: "Soft Skill",
  DOMAIN: "Domain",
  TOOL: "Tool",
  LANGUAGE: "Language",
  CERTIFICATION: "Certification",
} as const;

export const SKILL_PROFICIENCY = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  EXPERT: "Expert",
} as const;

export const POPULAR_SKILLS = [
  { name: "JavaScript", category: "TECHNICAL" },
  { name: "TypeScript", category: "TECHNICAL" },
  { name: "React", category: "TECHNICAL" },
  { name: "Next.js", category: "TECHNICAL" },
  { name: "Node.js", category: "TECHNICAL" },
  { name: "Python", category: "TECHNICAL" },
  { name: "SQL", category: "TECHNICAL" },
  { name: "AWS", category: "TOOL" },
  { name: "Docker", category: "TOOL" },
  { name: "Kubernetes", category: "TOOL" },
  { name: "GraphQL", category: "TECHNICAL" },
  { name: "PostgreSQL", category: "TOOL" },
  { name: "MongoDB", category: "TOOL" },
  { name: "Redis", category: "TOOL" },
  { name: "Figma", category: "TOOL" },
  { name: "Product Management", category: "DOMAIN" },
  { name: "Data Analysis", category: "DOMAIN" },
  { name: "Machine Learning", category: "TECHNICAL" },
  { name: "Go", category: "LANGUAGE" },
  { name: "Rust", category: "LANGUAGE" },
  { name: "Java", category: "LANGUAGE" },
  { name: "Leadership", category: "SOFT" },
  { name: "Communication", category: "SOFT" },
];

export const PIPELINE_STAGES = [
  "APPLIED",
  "SHORTLISTED",
  "AI_SCREENED",
  "PHONE_SCREEN",
  "TECHNICAL",
  "OFFER",
  "HIRED",
] as const;

export const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1000",
  "1001–5000",
  "5000+",
] as const;
