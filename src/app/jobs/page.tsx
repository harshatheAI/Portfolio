"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Sparkles, Briefcase, MapPin, DollarSign, Clock, Filter, TrendingUp, X } from "lucide-react";

interface Job {
  id: string;
  title: string;
  slug: string;
  workMode: string;
  jobType: string;
  experienceLevel: string;
  salaryMin: number | null;
  salaryMax: number | null;
  location: string | null;
  featured: boolean;
  publishedAt: string | null;
  createdAt: string;
  company: { name: string; industry: string | null; size: string | null };
  skills: { skill: { name: string }; id: string }[];
}

const WORK_MODE_OPTIONS = [
  { value: "", label: "Any location" },
  { value: "REMOTE", label: "Remote" },
  { value: "HYBRID", label: "Hybrid" },
  { value: "ONSITE", label: "On-site" },
];

const EXP_OPTIONS = [
  { value: "", label: "Any level" },
  { value: "JUNIOR", label: "Junior" },
  { value: "MID", label: "Mid-level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead / Staff" },
];

const WORK_MODE_LABEL: Record<string, string> = {
  REMOTE: "Remote", HYBRID: "Hybrid", ONSITE: "On-site",
};

const EXP_LABEL: Record<string, string> = {
  INTERN: "Intern", JUNIOR: "Junior", MID: "Mid", SENIOR: "Senior",
  LEAD: "Lead", STAFF: "Staff", PRINCIPAL: "Principal",
};

function formatSalary(min: number | null, max: number | null): string {
  if (!min && !max) return "";
  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `Up to ${fmt(max!)}`;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("");
  const [expLevel, setExpLevel] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    if (workMode) params.set("workMode", workMode);
    if (expLevel) params.set("experienceLevel", expLevel);

    const timer = setTimeout(() => {
      fetch(`/api/jobs?${params}`)
        .then(r => r.json())
        .then(res => { setJobs(res.data || []); setLoading(false); })
        .catch(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [query, workMode, expLevel]);

  const featured = jobs.filter(j => j.featured);
  const regular = jobs.filter(j => !j.featured);

  return (
    <div className="min-h-screen bg-[#060610]">
      {/* Top Nav */}
      <nav className="border-b border-white/5 bg-[#060610]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">NexusHire</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-white/50 hover:text-white transition-colors">Sign in</Link>
            <Link href="/sign-up" className="px-3 py-1.5 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white text-sm font-medium transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Search */}
      <div className="bg-gradient-to-b from-[#4361ee]/10 to-transparent">
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4361ee]/15 border border-[#4361ee]/25 text-[#6b8aff] text-xs font-medium mb-4">
            <Sparkles className="w-3 h-3" /> AI-matched to your profile
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Find your next role
          </h1>
          <p className="text-white/50 text-sm mb-8">
            {jobs.length > 0 ? `${jobs.length} open roles` : "Loading roles..."} from top companies
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-1.5 rounded-xl bg-white/5 border border-white/10 focus-within:border-[#4361ee]/50 transition-colors">
              <Search className="w-4 h-4 text-white/30 ml-2 flex-shrink-0" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by title, skill, or company..."
                className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="mr-1 text-white/30 hover:text-white/60 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mt-3 flex-wrap justify-center">
              {WORK_MODE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setWorkMode(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    workMode === opt.value
                      ? "bg-[#4361ee] text-white"
                      : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <div className="w-px h-4 bg-white/10" />
              {EXP_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setExpLevel(opt.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    expLevel === opt.value
                      ? "bg-[#7b5ea7] text-white"
                      : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-white/3 border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-12 h-12 text-white/15 mx-auto mb-3" />
            <p className="text-white/40 text-sm">No jobs match your filters.</p>
            <button
              onClick={() => { setQuery(""); setWorkMode(""); setExpLevel(""); }}
              className="mt-3 text-xs text-[#4361ee] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Featured */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider">Featured</span>
                </div>
                <div className="space-y-2">
                  {featured.map(job => <JobCard key={job.id} job={job} featured />)}
                </div>
              </section>
            )}

            {/* All Jobs */}
            <section>
              {featured.length > 0 && (
                <div className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-3">
                  All jobs ({regular.length})
                </div>
              )}
              <div className="space-y-2">
                {regular.map(job => <JobCard key={job.id} job={job} />)}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, featured }: { job: Job; featured?: boolean }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`block p-4 rounded-xl border transition-all group ${
        featured
          ? "bg-[#4361ee]/8 border-[#4361ee]/25 hover:border-[#4361ee]/50 hover:bg-[#4361ee]/12"
          : "bg-white/3 border-white/8 hover:border-white/15 hover:bg-white/5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0 ${
          featured ? "bg-[#4361ee]" : "bg-gradient-to-br from-[#4361ee] to-[#7b5ea7]"
        }`}>
          {job.company.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                {job.title}
                {featured && <Sparkles className="w-3 h-3 text-amber-400" />}
              </h3>
              <p className="text-xs text-white/40 mt-0.5">
                {job.company.name}
                {job.company.industry && <span className="text-white/25"> · {job.company.industry}</span>}
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
              <span className="px-2 py-0.5 rounded text-xs bg-white/8 text-white/50">
                {WORK_MODE_LABEL[job.workMode] || job.workMode}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-white/8 text-white/50">
                {EXP_LABEL[job.experienceLevel] || job.experienceLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {job.salaryMin && (
              <span className="flex items-center gap-1 text-xs text-emerald-400/80">
                <DollarSign className="w-3 h-3" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
            )}
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-white/30">
                <MapPin className="w-3 h-3" /> {job.location}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-white/25">
              <Clock className="w-3 h-3" />
              {timeAgo(job.publishedAt || job.createdAt)}
            </span>
          </div>

          {job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
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
