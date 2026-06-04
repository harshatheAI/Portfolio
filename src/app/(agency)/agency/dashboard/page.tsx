import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, Building2, TrendingUp, DollarSign, ArrowRight, PlusCircle, Sparkles } from "lucide-react";

export default async function AgencyDashboard() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const agency = await prisma.agencyProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      clients: { take: 5 },
      placements: { take: 5, include: { job: { include: { company: true } }, application: { include: { candidate: { include: { user: true } } } } } },
    },
  });

  if (!agency) redirect("/onboarding/agency");

  const stats = [
    { label: "Active clients", value: agency.clients.filter(c => c.active).length.toString(), icon: <Building2 className="w-5 h-5" />, color: "#22c55e" },
    { label: "Total placements", value: agency.placements.length.toString(), icon: <TrendingUp className="w-5 h-5" />, color: "#4361ee" },
    { label: "Team size", value: agency.teamSize?.toString() || "—", icon: <Users className="w-5 h-5" />, color: "#7b5ea7" },
    { label: "Est. revenue", value: agency.placements.reduce((acc, p) => acc + (p.feeAmount || 0), 0) > 0
        ? `$${(agency.placements.reduce((acc, p) => acc + (p.feeAmount || 0), 0) / 1000).toFixed(0)}k`
        : "—",
      icon: <DollarSign className="w-5 h-5" />, color: "#f59e0b" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">{agency.agencyName}</h1>
          <p className="text-white/50 text-sm mt-1">Agency dashboard</p>
        </div>
        <Link href="/agency/clients"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-medium transition-colors">
          <PlusCircle className="w-4 h-4" />
          Add client
        </Link>
      </div>

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
        <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#22c55e]" />
              <h2 className="font-semibold text-white text-sm">Clients</h2>
            </div>
            <Link href="/agency/clients" className="text-xs text-white/40 hover:text-white/70 flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {agency.clients.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40 mb-3">No clients yet.</p>
              <Link href="/agency/clients"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#22c55e] text-white text-xs font-medium">
                <PlusCircle className="w-3.5 h-3.5" /> Add first client
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {agency.clients.map(client => (
                <div key={client.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 flex items-center justify-center text-xs font-bold text-[#22c55e] flex-shrink-0">
                    {client.companyName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{client.companyName}</div>
                    {client.feePercentage && (
                      <div className="text-xs text-white/40">{client.feePercentage}% fee</div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${client.active ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
                    {client.active ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl bg-white/3 border border-white/8 overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4361ee]" />
              <h2 className="font-semibold text-white text-sm">Recent placements</h2>
            </div>
          </div>
          {agency.placements.length === 0 ? (
            <div className="p-8 text-center">
              <TrendingUp className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No placements yet. Start by adding clients and sourcing candidates.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {agency.placements.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">
                      {p.application.candidate.user.name || "Candidate"}
                    </div>
                    <div className="text-xs text-white/40 truncate">
                      {p.job.title} at {p.job.company.name}
                    </div>
                  </div>
                  {p.salary && (
                    <div className="text-xs text-[#22c55e] font-medium">
                      ${(p.salary / 1000).toFixed(0)}k
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[#22c55e]/10 border border-[#22c55e]/20 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#22c55e] flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-medium text-white mb-0.5">AI sourcing ready</div>
          <p className="text-xs text-white/50">
            Add your client job requirements and let AI automatically source and rank candidates from your talent pool. Agencies using NexusHire AI place 5× more candidates per recruiter.
          </p>
        </div>
      </div>
    </div>
  );
}
