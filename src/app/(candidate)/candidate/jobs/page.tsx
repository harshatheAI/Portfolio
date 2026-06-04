import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Sparkles, Briefcase, MapPin, DollarSign, Clock, TrendingUp
} from "lucide-react";
import { formatSalary, formatDateRelative, getMatchColor, getMatchLabel } from "@/lib/utils";
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS } from "@/lib/constants";

export default async function JobDiscoveryPage() {
  const session = await auth();

  // Get candidate profile for matches
  const candidateProfile = session ? await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
  }) : null;

  const jobs = await prisma.job.findMany({
    where: { published: true },
    include: {
      company: true,
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    take: 30,
  });

  // Get matches for this candidate if logged in
  const matchMap = new Map<string, number>();
  if (candidateProfile) {
    const matches = await prisma.jobMatch.findMany({
      where: { candidateId: candidateProfile.id, jobId: { in: jobs.map(j => j.id) } },
    });
    matches.forEach(m => matchMap.set(m.jobId, m.overallScore));
  }

  // Sort by match score if available
  const sortedJobs = candidateProfile
    ? [...jobs].sort((a, b) => (matchMap.get(b.id) ?? 0) - (matchMap.get(a.id) ?? 0))
    : jobs;

  const workModeColors: Record<string, string> = {
    REMOTE: "text-emerald-400 bg-emerald-400/10",
    HYBRID: "text-amber-400 bg-amber-400/10",
    ON_SITE: "text-blue-400 bg-blue-400/10",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Discover Jobs</h1>
          <p className="text-white/50 text-sm mt-1">
            {candidateProfile
              ? `${sortedJobs.length} roles, sorted by your AI match score`
              : `${sortedJobs.length} open roles`}
          </p>
        </div>
        {!candidateProfile && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#4361ee]/10 border border-[#4361ee]/20 text-xs text-[#6b8aff]">
            <Sparkles className="w-3.5 h-3.5" />
            Complete your profile to see AI match scores
          </div>
        )}
      </div>

      {sortedJobs.length === 0 ? (
        <div className="text-center py-20">
          <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white/50 mb-2">No jobs available yet</h2>
          <p className="text-white/30 text-sm">Check back soon as recruiters post new roles.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedJobs.map(job => {
            const matchScore = matchMap.get(job.id);
            return (
              <Link key={job.id} href={`/jobs/${job.id}`}
                className="flex items-start gap-4 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all group">
                {/* Company logo */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                  {job.company.name.charAt(0)}
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-1">
                    <h2 className="font-semibold text-white group-hover:text-[#6b8aff] transition-colors">{job.title}</h2>
                    {job.featured && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-[#f59e0b]/20 text-[#f59e0b] font-medium flex-shrink-0">
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-white/50 mb-2">{job.company.name}</div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/40">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${workModeColors[job.workMode] || "text-white/40 bg-white/5"}`}>
                      {WORK_MODES[job.workMode as keyof typeof WORK_MODES] || job.workMode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />
                      {JOB_TYPES[job.jobType as keyof typeof JOB_TYPES] || job.jobType}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>
                    )}
                    {job.salaryPublic && (job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1 text-white/50">
                        <DollarSign className="w-3 h-3" />
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.publishedAt ? formatDateRelative(job.publishedAt) : "Recently"}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {EXPERIENCE_LEVELS[job.experienceLevel as keyof typeof EXPERIENCE_LEVELS] || job.experienceLevel}
                    </span>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {job.skills.slice(0, 5).map(js => (
                        <span key={js.id} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/40">
                          {js.skill.name}
                        </span>
                      ))}
                      {job.skills.length > 5 && (
                        <span className="text-xs text-white/25">+{job.skills.length - 5} more</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Match score */}
                {matchScore !== undefined && (
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-xl font-black ${getMatchColor(matchScore)}`}>
                      {Math.round(matchScore)}%
                    </div>
                    <div className="text-xs text-white/30">{getMatchLabel(matchScore)}</div>
                    <div className="flex items-center gap-1 mt-1 justify-end text-xs text-white/25">
                      <Sparkles className="w-3 h-3" /> AI match
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
