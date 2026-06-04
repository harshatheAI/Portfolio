import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, ExternalLink, Clock, TrendingUp } from "lucide-react";
import { formatDate, formatSalary, getMatchColor } from "@/lib/utils";
import { APP_STATUSES, WORK_MODES } from "@/lib/constants";

const statusConfig: Record<string, { label: string; color: string; dot: string }> = {
  APPLIED: { label: "Applied", color: "bg-blue-500/20 text-blue-400", dot: "bg-blue-400" },
  SHORTLISTED: { label: "Shortlisted", color: "bg-purple-500/20 text-purple-400", dot: "bg-purple-400" },
  AI_SCREENED: { label: "AI Screened", color: "bg-cyan-500/20 text-cyan-400", dot: "bg-cyan-400" },
  PHONE_SCREEN: { label: "Phone Screen", color: "bg-amber-500/20 text-amber-400", dot: "bg-amber-400" },
  TECHNICAL: { label: "Technical", color: "bg-orange-500/20 text-orange-400", dot: "bg-orange-400" },
  OFFER: { label: "Offer!", color: "bg-emerald-500/20 text-emerald-400 font-bold", dot: "bg-emerald-400" },
  HIRED: { label: "Hired! 🎉", color: "bg-green-500/20 text-green-400 font-bold", dot: "bg-green-400" },
  REJECTED: { label: "Not selected", color: "bg-white/10 text-white/40", dot: "bg-white/20" },
  WITHDRAWN: { label: "Withdrawn", color: "bg-white/10 text-white/30", dot: "bg-white/10" },
};

export default async function ApplicationsPage() {
  const session = await auth();
  if (!session) return null;

  const applications = await prisma.application.findMany({
    where: { candidate: { userId: session.user.id } },
    include: {
      job: { include: { company: true, skills: { include: { skill: true }, take: 4 } } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const grouped = {
    active: applications.filter(a => !["REJECTED", "WITHDRAWN", "HIRED"].includes(a.status)),
    completed: applications.filter(a => ["HIRED"].includes(a.status)),
    closed: applications.filter(a => ["REJECTED", "WITHDRAWN"].includes(a.status)),
  };

  function ApplicationCard({ app }: { app: typeof applications[0] }) {
    const config = statusConfig[app.status] || { label: app.status, color: "bg-white/10 text-white/50", dot: "bg-white/20" };
    return (
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/12 transition-colors">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
            {app.job.company.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-white text-sm">{app.job.title}</h3>
                <div className="text-xs text-white/40 mt-0.5">
                  {app.job.company.name} · {WORK_MODES[app.job.workMode as keyof typeof WORK_MODES] || app.job.workMode}
                  {app.job.salaryMin && ` · ${formatSalary(app.job.salaryMin, app.job.salaryMax)}`}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs flex-shrink-0 ${config.color}`}>
                {config.label}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-3 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" /> Applied {formatDate(app.createdAt)}
              </span>
              {app.matchScore && (
                <span className={`flex items-center gap-1 font-medium ${getMatchColor(app.matchScore)}`}>
                  <TrendingUp className="w-3 h-3" /> {Math.round(app.matchScore)}% match
                </span>
              )}
            </div>

            {/* Timeline */}
            {app.statusHistory.length > 1 && (
              <div className="flex items-center gap-1 mt-3">
                {app.statusHistory.map((h, i) => {
                  const c = statusConfig[h.toStatus]?.dot || "bg-white/20";
                  return (
                    <div key={h.id} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${c}`} />
                      {i < app.statusHistory.length - 1 && <div className="w-4 h-px bg-white/10" />}
                    </div>
                  );
                })}
              </div>
            )}

            {app.job.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {app.job.skills.map(js => (
                  <span key={js.id} className="px-2 py-0.5 rounded text-xs bg-white/5 text-white/30">
                    {js.skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Applications</h1>
          <p className="text-white/50 text-sm mt-1">
            {applications.length > 0
              ? `${applications.length} total · ${grouped.active.length} active`
              : "No applications yet"}
          </p>
        </div>
        <Link href="/candidate/jobs"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white text-sm font-medium transition-colors">
          <ExternalLink className="w-4 h-4" />
          Find more roles
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white/50 mb-2">No applications yet</h2>
          <p className="text-white/30 text-sm mb-4">Discover AI-matched jobs and apply with one click.</p>
          <Link href="/candidate/jobs" className="px-4 py-2 rounded-lg bg-[#4361ee] text-white text-sm font-medium">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.active.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">
                Active ({grouped.active.length})
              </h2>
              <div className="space-y-3">
                {grouped.active.map(app => <ApplicationCard key={app.id} app={app} />)}
              </div>
            </section>
          )}
          {grouped.completed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-emerald-500/60 uppercase tracking-wider mb-3">
                Hired 🎉 ({grouped.completed.length})
              </h2>
              <div className="space-y-3">
                {grouped.completed.map(app => <ApplicationCard key={app.id} app={app} />)}
              </div>
            </section>
          )}
          {grouped.closed.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-white/20 uppercase tracking-wider mb-3">
                Closed ({grouped.closed.length})
              </h2>
              <div className="space-y-3 opacity-60">
                {grouped.closed.map(app => <ApplicationCard key={app.id} app={app} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
