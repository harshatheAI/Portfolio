import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, Briefcase, Users, TrendingUp, Clock, ArrowRight, Sparkles, Eye } from "lucide-react";
import { formatDate, formatSalary } from "@/lib/utils";
import { APP_STATUSES, WORK_MODES } from "@/lib/constants";

export default async function RecruiterDashboard() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const recruiter = await prisma.recruiterProfile.findUnique({
    where: { userId: session.user.id },
    include: { company: true },
  });

  if (!recruiter) redirect("/onboarding/recruiter");

  const [jobs, recentApplications] = await Promise.all([
    prisma.job.findMany({
      where: { recruiterId: recruiter.id },
      include: { _count: { select: { applications: true } }, company: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.application.findMany({
      where: { job: { recruiterId: recruiter.id } },
      include: { job: true, candidate: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalApps = jobs.reduce((acc, j) => acc + j._count.applications, 0);
  const activeJobs = jobs.filter(j => j.published && !j.closedAt);
  const shortlisted = recentApplications.filter(a => ["SHORTLISTED", "PHONE_SCREEN", "TECHNICAL", "OFFER"].includes(a.status)).length;

  const stats = [
    { label: "Active jobs", value: activeJobs.length.toString(), icon: <Briefcase className="w-5 h-5" />, color: "#7b5ea7", link: "/recruiter/jobs" },
    { label: "Total applicants", value: totalApps.toString(), icon: <Users className="w-5 h-5" />, color: "#4361ee" },
    { label: "In pipeline", value: shortlisted.toString(), icon: <TrendingUp className="w-5 h-5" />, color: "#22c55e" },
    { label: "Pending review", value: recentApplications.filter(a => a.status === "APPLIED").length.toString(), icon: <Clock className="w-5 h-5" />, color: "#f59e0b" },
  ];

  const statusColors: Record<string, string> = {
    APPLIED: "bg-blue-500/20 text-blue-400",
    SHORTLISTED: "bg-purple-500/20 text-purple-400",
    AI_SCREENED: "bg-cyan-500/20 text-cyan-400",
    PHONE_SCREEN: "bg-amber-500/20 text-amber-400",
    TECHNICAL: "bg-orange-500/20 text-orange-400",
    OFFER: "bg-emerald-500/20 text-emerald-400",
    HIRED: "bg-green-500/20 text-green-400",
    REJECTED: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {recruiter.company?.name || "Your"} Hiring Hub
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {activeJobs.length > 0
              ? `${activeJobs.length} active role${activeJobs.length !== 1 ? "s" : ""} · ${totalApps} total applicants`
              : "Post your first job to start receiving AI-matched candidates"}
          </p>
        </div>
        <Link href="/recruiter/jobs/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7b5ea7] hover:bg-[#6b4e9a] text-white text-sm font-medium transition-colors">
          <PlusCircle className="w-4 h-4" />
          Post a job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="p-4 rounded-xl bg-white/3 border border-white/8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/40 text-xs">{stat.label}</span>
              <div style={{ color: stat.color }}>{stat.icon}</div>
            </div>
            <div className="text-3xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Active jobs */}
        <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#7b5ea7]" />
              <h2 className="font-semibold text-white text-sm">Active jobs</h2>
            </div>
            <Link href="/recruiter/jobs" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {jobs.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40 mb-3">No jobs posted yet.</p>
              <Link href="/recruiter/jobs/new"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7b5ea7] text-white text-xs font-medium">
                <PlusCircle className="w-3.5 h-3.5" /> Post your first job
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {jobs.map(job => (
                <Link key={job.id} href={`/recruiter/jobs/${job.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-white/3 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white truncate">{job.title}</span>
                      {!job.published && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-white/10 text-white/40">Draft</span>
                      )}
                    </div>
                    <div className="text-xs text-white/40 mt-0.5">
                      {WORK_MODES[job.workMode as keyof typeof WORK_MODES] || job.workMode} ·{" "}
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-white">{job._count.applications}</div>
                      <div className="text-xs text-white/30">applicants</div>
                    </div>
                    <Eye className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent applications */}
        <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4361ee]" />
              <h2 className="font-semibold text-white text-sm">Recent applications</h2>
            </div>
          </div>
          {recentApplications.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">Applications will appear here once you post jobs.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentApplications.map(app => (
                <div key={app.id} className="flex items-center gap-3 p-3.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {app.candidate.user.name?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{app.candidate.user.name || "Candidate"}</div>
                    <div className="text-xs text-white/40 truncate">{app.job.title}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {app.matchScore && (
                      <span className={`text-xs font-bold ${
                        app.matchScore >= 80 ? "text-emerald-400" : app.matchScore >= 60 ? "text-amber-400" : "text-red-400"
                      }`}>{Math.round(app.matchScore)}%</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[app.status] || "bg-white/10 text-white/50"}`}>
                      {APP_STATUSES[app.status as keyof typeof APP_STATUSES] || app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Tip */}
      <div className="mt-6 p-4 rounded-xl bg-[#7b5ea7]/10 border border-[#7b5ea7]/20 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#7b5ea7] flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-white mb-0.5">AI Tip</div>
          <p className="text-xs text-white/50">
            Jobs with salary ranges disclosed get 42% more qualified applicants. AI job enhancement automatically suggests adding compensation transparency to all your posts.
          </p>
        </div>
      </div>
    </div>
  );
}
