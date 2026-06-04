import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Users, TrendingUp, Sparkles, Clock, MapPin,
  DollarSign, Briefcase, ChevronRight, Star, CheckCircle2,
  XCircle, MessageSquare, Eye, BarChart3
} from "lucide-react";
import { formatDate, formatSalary, getMatchColor, parseJsonField } from "@/lib/utils";
import { APP_STATUSES, WORK_MODES, EXPERIENCE_LEVELS } from "@/lib/constants";

const PIPELINE_STAGES = [
  { key: "APPLIED", label: "Applied", color: "bg-blue-500" },
  { key: "AI_SCREENED", label: "AI Screened", color: "bg-cyan-500" },
  { key: "SHORTLISTED", label: "Shortlisted", color: "bg-purple-500" },
  { key: "PHONE_SCREEN", label: "Phone Screen", color: "bg-amber-500" },
  { key: "TECHNICAL", label: "Technical", color: "bg-orange-500" },
  { key: "OFFER", label: "Offer", color: "bg-emerald-500" },
  { key: "HIRED", label: "Hired", color: "bg-green-500" },
];

const statusStyle: Record<string, string> = {
  APPLIED: "bg-blue-500/20 text-blue-400",
  SHORTLISTED: "bg-purple-500/20 text-purple-400",
  AI_SCREENED: "bg-cyan-500/20 text-cyan-400",
  PHONE_SCREEN: "bg-amber-500/20 text-amber-400",
  TECHNICAL: "bg-orange-500/20 text-orange-400",
  OFFER: "bg-emerald-500/20 text-emerald-400",
  HIRED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-white/10 text-white/40",
  WITHDRAWN: "bg-white/10 text-white/20",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session) redirect("/sign-in");

  const recruiter = await prisma.recruiterProfile.findUnique({ where: { userId: session.user.id } });
  if (!recruiter) redirect("/onboarding/recruiter");

  const job = await prisma.job.findFirst({
    where: { id, recruiterId: recruiter.id },
    include: {
      company: true,
      skills: { include: { skill: true } },
      applications: {
        include: {
          candidate: {
            include: {
              user: true,
              skills: { include: { skill: true }, take: 4 },
            },
          },
        },
        orderBy: [{ matchScore: "desc" }, { createdAt: "desc" }],
      },
      matches: {
        include: { candidate: { include: { user: true, skills: { include: { skill: true }, take: 4 } } } },
        orderBy: { overallScore: "desc" },
        take: 10,
      },
    },
  });

  if (!job) notFound();

  const stageCounts = PIPELINE_STAGES.map(stage => ({
    ...stage,
    count: job.applications.filter(a => a.status === stage.key).length,
  }));

  const totalApps = job.applications.length;
  const inPipeline = job.applications.filter(a => !["REJECTED", "WITHDRAWN"].includes(a.status)).length;
  const hired = job.applications.filter(a => a.status === "HIRED").length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href="/recruiter/jobs" className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to jobs
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#7b5ea7]/20 flex items-center justify-center text-lg font-bold text-[#7b5ea7]">
              {job.company.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{job.title}</h1>
                {job.featured && <Sparkles className="w-4 h-4 text-amber-400" />}
                <span className={`px-2 py-0.5 rounded-full text-xs ${job.published && !job.closedAt ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                  {job.published && !job.closedAt ? "Live" : job.closedAt ? "Closed" : "Draft"}
                </span>
              </div>
              <p className="text-sm text-white/40 mt-1">
                {job.company.name} · {WORK_MODES[job.workMode as keyof typeof WORK_MODES]} ·{" "}
                {EXPERIENCE_LEVELS[job.experienceLevel as keyof typeof EXPERIENCE_LEVELS]} ·{" "}
                {formatSalary(job.salaryMin, job.salaryMax)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/jobs/${job.id}`} target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/60 text-xs hover:border-white/20 hover:text-white transition-all">
              <Eye className="w-3.5 h-3.5" /> Preview
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total applicants", value: totalApps, icon: <Users className="w-4 h-4" />, color: "#4361ee" },
          { label: "In pipeline", value: inPipeline, icon: <TrendingUp className="w-4 h-4" />, color: "#7b5ea7" },
          { label: "AI matches", value: job.matches.length, icon: <Sparkles className="w-4 h-4" />, color: "#f59e0b" },
          { label: "Hired", value: hired, icon: <CheckCircle2 className="w-4 h-4" />, color: "#22c55e" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-white/3 border border-white/8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40">{s.label}</span>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div className="text-2xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Pipeline Funnel */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-white/40" />
          <h2 className="text-sm font-semibold text-white">Pipeline</h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {stageCounts.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-2">
              <div className="text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mx-auto mb-1`}
                  style={{ background: stage.count > 0 ? "" : "rgba(255,255,255,0.05)" }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${stage.count > 0 ? stage.color : "bg-white/5"} text-white`}>
                    {stage.count}
                  </div>
                </div>
                <div className="text-xs text-white/30 whitespace-nowrap">{stage.label}</div>
              </div>
              {i < stageCounts.length - 1 && (
                <ChevronRight className="w-4 h-4 text-white/15 flex-shrink-0 mb-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Applications */}
        <div className="lg:col-span-2 rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#4361ee]" />
              <h2 className="font-semibold text-white text-sm">
                Applications ({job.applications.length})
              </h2>
            </div>
          </div>
          {job.applications.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No applications yet.</p>
              <p className="text-xs text-white/25 mt-1">Share the job link to start receiving candidates.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {job.applications.map(app => (
                <div key={app.id} className="p-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {app.candidate.user.name?.charAt(0) || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-sm text-white">{app.candidate.user.name || "Candidate"}</div>
                          <div className="text-xs text-white/40 mt-0.5">{app.candidate.user.email}</div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {app.matchScore != null && (
                            <span className={`text-xs font-bold ${getMatchColor(app.matchScore)}`}>
                              {Math.round(app.matchScore)}% match
                            </span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${statusStyle[app.status] || "bg-white/10 text-white/40"}`}>
                            {APP_STATUSES[app.status as keyof typeof APP_STATUSES] || app.status}
                          </span>
                        </div>
                      </div>

                      {app.candidate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {app.candidate.skills.map(cs => (
                            <span key={cs.id} className="px-1.5 py-0.5 rounded text-xs bg-white/5 text-white/30">
                              {cs.skill.name}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-white/25">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(app.createdAt)}
                        </span>
                        {app.coverLetter && (
                          <span className="flex items-center gap-1 text-white/40">
                            <MessageSquare className="w-3 h-3" /> Cover letter
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* AI Matches + Job Details */}
        <div className="space-y-4">
          {/* AI Matches */}
          <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-white/5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold text-white">AI Matches</h2>
            </div>
            {job.matches.length === 0 ? (
              <div className="p-6 text-center">
                <Sparkles className="w-6 h-6 text-white/20 mx-auto mb-2" />
                <p className="text-xs text-white/40">AI is finding matches…</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {job.matches.slice(0, 5).map(match => {
                  const strengths = parseJsonField<string[]>(match.strengthPoints, []);
                  return (
                    <div key={match.id} className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {match.candidate.user.name?.charAt(0) || "?"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-medium text-white truncate">
                              {match.candidate.user.name || "Candidate"}
                            </span>
                            <span className={`text-xs font-bold flex-shrink-0 ${getMatchColor(match.overallScore)}`}>
                              {Math.round(match.overallScore)}%
                            </span>
                          </div>
                          {strengths[0] && (
                            <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{strengths[0]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="rounded-xl bg-white/3 border border-white/8 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white mb-2">Job details</h2>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-white/50">
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{EXPERIENCE_LEVELS[job.experienceLevel as keyof typeof EXPERIENCE_LEVELS]} · {job.jobType.replace("_", " ")}</span>
              </div>
              {job.location && (
                <div className="flex items-center gap-2 text-white/50">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{job.location}</span>
                </div>
              )}
              {job.salaryMin && (
                <div className="flex items-center gap-2 text-white/50">
                  <DollarSign className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/50">
                <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Posted {formatDate(job.publishedAt || job.createdAt)}</span>
              </div>
            </div>
            {job.skills.length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <div className="text-xs text-white/30 mb-2">Required skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {job.skills.map(js => (
                    <span key={js.id} className="px-2 py-0.5 rounded text-xs bg-[#7b5ea7]/20 text-[#a78fcc]">
                      {js.skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
