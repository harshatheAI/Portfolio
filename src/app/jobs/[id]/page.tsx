import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Sparkles, MapPin, DollarSign, Briefcase, Clock,
  Building2, Users, CheckCircle2, ExternalLink
} from "lucide-react";
import { formatSalary, formatDate } from "@/lib/utils";
import { WORK_MODES, EXPERIENCE_LEVELS, JOB_TYPES } from "@/lib/constants";
import { ApplyButton } from "./apply-button";

export default async function JobDetailPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const job = await prisma.job.findFirst({
    where: { id, published: true },
    include: {
      company: true,
      skills: { include: { skill: true } },
      recruiter: { include: { user: true } },
    },
  });

  if (!job) notFound();

  // Check if candidate already applied
  let alreadyApplied = false;
  let matchScore: number | null = null;
  if (session?.user.role === "CANDIDATE") {
    const [application, match] = await Promise.all([
      prisma.application.findFirst({
        where: { jobId: job.id, candidate: { userId: session.user.id } },
      }),
      prisma.jobMatch.findFirst({
        where: { jobId: job.id, candidate: { userId: session.user.id } },
      }),
    ]);
    alreadyApplied = !!application;
    matchScore = match?.overallScore ?? null;
  }

  const requiredSkills = job.skills.filter(s => s.required);
  const niceSkills = job.skills.filter(s => !s.required);

  return (
    <div className="min-h-screen bg-[#060610]">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> All jobs
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-white text-sm">NexusHire</span>
          </Link>
          <div className="flex items-center gap-2">
            {!session && (
              <Link href="/sign-in" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="p-6 rounded-2xl bg-white/3 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-xl font-black text-white flex-shrink-0">
                  {job.company.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h1 className="text-xl font-bold text-white">{job.title}</h1>
                      <Link href="#" className="text-sm text-white/50 hover:text-white transition-colors flex items-center gap-1 mt-1">
                        {job.company.name}
                        {job.company.website && <ExternalLink className="w-3 h-3" />}
                      </Link>
                    </div>
                    {job.featured && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-medium flex-shrink-0">
                        <Sparkles className="w-3 h-3" /> Featured
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="px-2.5 py-1 rounded-lg bg-white/8 text-white/60 text-xs">
                      {WORK_MODES[job.workMode as keyof typeof WORK_MODES] || job.workMode}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/8 text-white/60 text-xs">
                      {EXPERIENCE_LEVELS[job.experienceLevel as keyof typeof EXPERIENCE_LEVELS] || job.experienceLevel}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white/8 text-white/60 text-xs">
                      {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES] || job.jobType}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/8 text-white/60 text-xs">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="p-6 rounded-2xl bg-white/3 border border-white/10">
              <h2 className="text-base font-semibold text-white mb-4">About this role</h2>
              <div className="prose prose-invert prose-sm max-w-none">
                {job.description.split("\n").map((line, i) => {
                  if (line.startsWith("## ")) return <h3 key={i} className="text-sm font-semibold text-white mt-4 mb-2">{line.slice(3)}</h3>;
                  if (line.startsWith("- ")) return <p key={i} className="flex items-start gap-2 text-sm text-white/60 mb-1"><span className="text-[#4361ee] mt-0.5">•</span>{line.slice(2)}</p>;
                  if (!line.trim()) return <div key={i} className="h-2" />;
                  return <p key={i} className="text-sm text-white/60 mb-2">{line}</p>;
                })}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && (
              <div className="p-6 rounded-2xl bg-white/3 border border-white/10">
                <h2 className="text-base font-semibold text-white mb-4">Requirements</h2>
                <div className="space-y-2">
                  {job.requirements.split("\n").filter(l => l.trim()).map((line, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                      <CheckCircle2 className="w-4 h-4 text-[#4361ee] flex-shrink-0 mt-0.5" />
                      <span>{line.replace(/^[-*•]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Apply Card */}
            <div className="p-5 rounded-2xl bg-white/3 border border-white/10 sticky top-20">
              {matchScore != null && (
                <div className="mb-4 p-3 rounded-xl bg-[#4361ee]/10 border border-[#4361ee]/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#4361ee]" />
                    <span className="text-xs font-semibold text-white">AI Match Score</span>
                  </div>
                  <div className="text-2xl font-black text-[#4361ee]">{Math.round(matchScore)}%</div>
                  <div className="text-xs text-white/40 mt-0.5">Based on your profile</div>
                </div>
              )}

              {job.salaryMin && (
                <div className="mb-4">
                  <div className="text-xs text-white/40 mb-1">Compensation</div>
                  <div className="text-lg font-bold text-white">{formatSalary(job.salaryMin, job.salaryMax)}</div>
                  <div className="text-xs text-white/30">per year · USD</div>
                </div>
              )}

              <ApplyButton
                jobId={job.id}
                isLoggedIn={!!session}
                isCandidate={session?.user.role === "CANDIDATE"}
                alreadyApplied={alreadyApplied}
              />

              <p className="text-xs text-white/25 text-center mt-3">
                AI matches your profile instantly
              </p>
            </div>

            {/* Skills */}
            {requiredSkills.length > 0 && (
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Required skills</h3>
                <div className="flex flex-wrap gap-1.5">
                  {requiredSkills.map(js => (
                    <span key={js.id} className="px-2.5 py-1 rounded-lg bg-[#4361ee]/15 text-[#6b8aff] text-xs">
                      {js.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Company Info */}
            <div className="p-4 rounded-xl bg-white/3 border border-white/8">
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Company</h3>
              <div className="space-y-2 text-xs">
                <div className="font-medium text-white">{job.company.name}</div>
                {job.company.industry && (
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Building2 className="w-3.5 h-3.5" /> {job.company.industry}
                  </div>
                )}
                {job.company.size && (
                  <div className="flex items-center gap-1.5 text-white/40">
                    <Users className="w-3.5 h-3.5" /> {job.company.size} employees
                  </div>
                )}
                {job.company.description && (
                  <p className="text-white/30 leading-relaxed pt-1">{job.company.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-white/25 justify-center">
              <Clock className="w-3 h-3" />
              Posted {formatDate(job.publishedAt || job.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
