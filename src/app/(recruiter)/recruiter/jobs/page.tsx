import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  PlusCircle, Briefcase, Users, Eye, ToggleRight,
  Clock, TrendingUp, Search, Sparkles, CheckCircle2,
  XCircle, ArrowUpRight
} from "lucide-react";
import { formatDate, formatSalary } from "@/lib/utils";
import { WORK_MODES, EXPERIENCE_LEVELS } from "@/lib/constants";

const expColors: Record<string, string> = {
  INTERN: "bg-slate-500/20 text-slate-400",
  JUNIOR: "bg-blue-500/20 text-blue-400",
  MID: "bg-indigo-500/20 text-indigo-400",
  SENIOR: "bg-purple-500/20 text-purple-400",
  LEAD: "bg-amber-500/20 text-amber-400",
  STAFF: "bg-orange-500/20 text-orange-400",
  PRINCIPAL: "bg-red-500/20 text-red-400",
};

export default async function RecruiterJobsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: { company: true },
  });
  if (!recruiter) redirect("/onboarding/recruiter");

  const jobs = await prisma.job.findMany({
    where: { recruiterId: recruiter.id },
    include: {
      skills: { include: { skill: true }, take: 5 },
      _count: { select: { applications: true, matches: true } },
      company: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const published = jobs.filter(j => j.published && !j.closedAt);
  const drafts = jobs.filter(j => !j.published);
  const closed = jobs.filter(j => j.closedAt);

  const totalApps = jobs.reduce((acc, j) => acc + j._count.applications, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Job Postings</h1>
          <p className="text-white/50 text-sm mt-1">
            {jobs.length > 0
              ? `${published.length} live · ${drafts.length} draft · ${totalApps} total applicants`
              : "Create your first job posting"}
          </p>
        </div>
        <Link
          href="/recruiter/jobs/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7b5ea7] hover:bg-[#6b4e9a] text-white text-sm font-medium transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Post a job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-[#7b5ea7]/20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-[#7b5ea7]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No jobs yet</h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Post your first job and AI will instantly match you with qualified candidates from our talent pool.
          </p>
          <Link
            href="/recruiter/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7b5ea7] hover:bg-[#6b4e9a] text-white text-sm font-semibold transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create first job posting
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Live Jobs */}
          {published.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Live ({published.length})
                </h2>
              </div>
              <div className="space-y-3">
                {published.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          )}

          {/* Draft Jobs */}
          {drafts.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider">
                  Drafts ({drafts.length})
                </h2>
              </div>
              <div className="space-y-3 opacity-75">
                {drafts.map(job => (
                  <JobCard key={job.id} job={job} isDraft />
                ))}
              </div>
            </section>
          )}

          {/* Closed Jobs */}
          {closed.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-400/50" />
                <h2 className="text-xs font-semibold text-white/20 uppercase tracking-wider">
                  Closed ({closed.length})
                </h2>
              </div>
              <div className="space-y-3 opacity-50">
                {closed.map(job => (
                  <JobCard key={job.id} job={job} isClosed />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

type Job = Awaited<ReturnType<typeof prisma.job.findMany>>[0] & {
  skills: { skill: { name: string }; id: string }[];
  _count: { applications: number; matches: number };
  company: { name: string };
};

function JobCard({ job, isDraft, isClosed }: { job: Job; isDraft?: boolean; isClosed?: boolean }) {
  return (
    <Link
      href={`/recruiter/jobs/${job.id}`}
      className="block p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 hover:bg-white/5 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#7b5ea7]/20 flex items-center justify-center text-sm font-bold text-[#7b5ea7] flex-shrink-0">
          {job.company.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                {job.title}
                {job.featured && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                {isClosed && <XCircle className="w-3.5 h-3.5 text-red-400/50" />}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                {job.company.name} ·{" "}
                {WORK_MODES[job.workMode as keyof typeof WORK_MODES] || job.workMode} ·{" "}
                {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isDraft ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-white/40">Draft</span>
              ) : isClosed ? (
                <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Closed</span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-400">Live</span>
              )}
              <span className={`px-2 py-0.5 rounded text-xs ${expColors[job.experienceLevel] || "bg-white/10 text-white/40"}`}>
                {EXPERIENCE_LEVELS[job.experienceLevel as keyof typeof EXPERIENCE_LEVELS] || job.experienceLevel}
              </span>
              <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-5 mt-3">
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <Users className="w-3.5 h-3.5" />
              <span>{job._count.applications} applicants</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/40">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{job._count.matches} AI matches</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/30">
              <Clock className="w-3.5 h-3.5" />
              <span>Posted {formatDate(job.publishedAt || job.createdAt)}</span>
            </div>
          </div>

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {job.skills.map(js => (
                <span key={js.id} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/30">
                  {js.skill.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
