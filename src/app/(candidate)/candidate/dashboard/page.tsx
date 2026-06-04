import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Briefcase,
  FileText,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import { formatDate, formatSalary, getMatchColor, getMatchLabel, parseJsonField } from "@/lib/utils";
import { APP_STATUSES, JOB_TYPES, WORK_MODES } from "@/lib/constants";

export default async function CandidateDashboard() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const [profile, applications, recentMatches] = await Promise.all([
    prisma.candidateProfile.findUnique({
      where: { userId: session.user.id },
      include: { skills: { include: { skill: true }, take: 6 } },
    }),
    prisma.application.findMany({
      where: { candidate: { userId: session.user.id } },
      include: { job: { include: { company: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.jobMatch.findMany({
      where: { candidate: { userId: session.user.id }, overallScore: { gte: 60 } },
      include: { job: { include: { company: true } } },
      orderBy: { overallScore: "desc" },
      take: 6,
    }),
  ]);

  const stats = [
    { label: "Matches found", value: recentMatches.length.toString(), icon: <Target className="w-5 h-5" />, color: "#4361ee" },
    { label: "Applications", value: applications.length.toString(), icon: <FileText className="w-5 h-5" />, color: "#7b5ea7" },
    { label: "Interviews", value: applications.filter(a => ["PHONE_SCREEN", "TECHNICAL"].includes(a.status)).length.toString(), icon: <Sparkles className="w-5 h-5" />, color: "#22c55e" },
    { label: "Pending responses", value: applications.filter(a => a.status === "APPLIED").length.toString(), icon: <Clock className="w-5 h-5" />, color: "#f59e0b" },
  ];

  const profileCompleteness = (() => {
    let score = 0;
    if (profile?.headline) score += 20;
    if (profile?.summary) score += 10;
    if (profile?.location) score += 10;
    if ((profile?.skills?.length ?? 0) >= 3) score += 30;
    if (profile?.desiredSalaryMin) score += 15;
    if (profile?.preferredWorkMode) score += 15;
    return score;
  })();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good morning, {session.user.name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {recentMatches.length > 0
              ? `You have ${recentMatches.length} new AI matches waiting`
              : "Complete your profile to start getting AI matches"}
          </p>
        </div>
        <Link href="/candidate/jobs"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white text-sm font-medium transition-colors">
          <Sparkles className="w-4 h-4" />
          Discover jobs
        </Link>
      </div>

      {/* Profile completeness */}
      {profileCompleteness < 100 && (
        <div className="mb-6 p-4 rounded-xl bg-[#4361ee]/10 border border-[#4361ee]/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-[#4361ee]" />
              <span className="text-sm font-medium text-white">Profile completeness: {profileCompleteness}%</span>
            </div>
            <Link href="/candidate/profile" className="text-xs text-[#4361ee] hover:underline">Complete profile</Link>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#4361ee] rounded-full transition-all" style={{ width: `${profileCompleteness}%` }} />
          </div>
          <p className="text-xs text-white/40 mt-1.5">Higher completeness = better AI match quality</p>
        </div>
      )}

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
        {/* AI Matches */}
        <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4361ee]" />
              <h2 className="font-semibold text-white text-sm">Your AI matches</h2>
            </div>
            <Link href="/candidate/jobs" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <div className="p-8 text-center">
              <Target className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No matches yet. Complete your profile to get started.</p>
              <Link href="/candidate/profile" className="mt-3 inline-flex text-xs text-[#4361ee] hover:underline">
                Complete profile →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {recentMatches.map(match => (
                <Link key={match.id} href={`/jobs/${match.jobId}`}
                  className="flex items-center gap-3 p-4 hover:bg-white/3 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {match.job.company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-white truncate">{match.job.title}</div>
                    <div className="text-xs text-white/40 truncate">{match.job.company.name} · {WORK_MODES[match.job.workMode as keyof typeof WORK_MODES] || match.job.workMode}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${getMatchColor(match.overallScore)}`}>
                      {Math.round(match.overallScore)}%
                    </div>
                    <div className="text-xs text-white/30">{getMatchLabel(match.overallScore)}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Applications tracker */}
        <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#7b5ea7]" />
              <h2 className="font-semibold text-white text-sm">Recent applications</h2>
            </div>
            <Link href="/candidate/applications" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1">
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {applications.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No applications yet.</p>
              <Link href="/candidate/jobs" className="mt-3 inline-flex text-xs text-[#4361ee] hover:underline">
                Browse jobs →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {applications.map(app => {
                const statusColors: Record<string, string> = {
                  APPLIED: "bg-blue-500/20 text-blue-400",
                  SHORTLISTED: "bg-purple-500/20 text-purple-400",
                  PHONE_SCREEN: "bg-amber-500/20 text-amber-400",
                  TECHNICAL: "bg-orange-500/20 text-orange-400",
                  OFFER: "bg-emerald-500/20 text-emerald-400",
                  HIRED: "bg-green-500/20 text-green-400",
                  REJECTED: "bg-red-500/20 text-red-400",
                  AI_SCREENED: "bg-cyan-500/20 text-cyan-400",
                };
                return (
                  <div key={app.id} className="flex items-center gap-3 p-4">
                    <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/40 flex-shrink-0">
                      {app.job.company.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-white truncate">{app.job.title}</div>
                      <div className="text-xs text-white/40">{app.job.company.name} · {formatDate(app.createdAt)}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${statusColors[app.status] || "bg-white/10 text-white/50"}`}>
                      {APP_STATUSES[app.status as keyof typeof APP_STATUSES] || app.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Skills snapshot */}
      {profile && profile.skills.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-white/3 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Your top skills</h2>
            <Link href="/candidate/profile" className="text-xs text-white/40 hover:text-white/70">Edit profile</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(cs => (
              <span key={cs.id} className="px-3 py-1.5 rounded-lg bg-[#4361ee]/15 border border-[#4361ee]/25 text-sm text-[#6b8aff]">
                {cs.skill.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
