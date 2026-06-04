"use client";

import { useState, useEffect } from "react";
import {
  User, MapPin, Briefcase, DollarSign, Globe, Github, Linkedin,
  Plus, X, Sparkles, Save, CheckCircle2, Loader2, TrendingUp,
  Star, Edit3
} from "lucide-react";
import { POPULAR_SKILLS, WORK_MODES, SKILL_PROFICIENCY } from "@/lib/constants";

interface Skill {
  id: string;
  name: string;
  proficiency: string;
  yearsOfExp: number;
  featured: boolean;
  skill: { name: string; slug: string };
}

interface Profile {
  headline: string | null;
  summary: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  portfolioUrl: string | null;
  desiredSalaryMin: number | null;
  desiredSalaryMax: number | null;
  preferredWorkMode: string | null;
  profileScore: number | null;
  skills: Skill[];
}

const PROFICIENCY_COLORS: Record<string, string> = {
  BEGINNER: "bg-slate-500/20 text-slate-400",
  INTERMEDIATE: "bg-amber-500/20 text-amber-400",
  ADVANCED: "bg-blue-500/20 text-blue-400",
  EXPERT: "bg-emerald-500/20 text-emerald-400",
};

export default function CandidateProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [headline, setHeadline] = useState("");
  const [summary, setSummary] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [workMode, setWorkMode] = useState("");

  const [skillSearch, setSkillSearch] = useState("");
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetch("/api/profile/candidate")
      .then(r => r.json())
      .then(data => {
        setProfile(data);
        setHeadline(data.headline || "");
        setSummary(data.summary || "");
        setLocation(data.location || "");
        setLinkedinUrl(data.linkedinUrl || "");
        setGithubUrl(data.githubUrl || "");
        setPortfolioUrl(data.portfolioUrl || "");
        setSalaryMin(data.desiredSalaryMin?.toString() || "");
        setSalaryMax(data.desiredSalaryMax?.toString() || "");
        setWorkMode(data.preferredWorkMode || "");
        setSkills(data.skills || []);
        setLoading(false);
      });
  }, []);

  const filteredSkills = POPULAR_SKILLS.filter(
    s => s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !skills.find(sk => sk.skill.name === s.name)
  );

  function addSkill(name: string) {
    const newSkill: Skill = {
      id: `new-${Date.now()}`,
      name,
      proficiency: "INTERMEDIATE",
      yearsOfExp: 2,
      featured: false,
      skill: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
    };
    setSkills(prev => [...prev, newSkill]);
    setSkillSearch("");
  }

  function removeSkill(id: string) {
    setSkills(prev => prev.filter(s => s.id !== id));
  }

  function updateProficiency(id: string, proficiency: string) {
    setSkills(prev => prev.map(s => s.id === id ? { ...s, proficiency } : s));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/profile/candidate", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          summary,
          location,
          linkedinUrl: linkedinUrl || null,
          githubUrl: githubUrl || null,
          portfolioUrl: portfolioUrl || null,
          desiredSalaryMin: salaryMin ? parseInt(salaryMin) : null,
          desiredSalaryMax: salaryMax ? parseInt(salaryMax) : null,
          preferredWorkMode: workMode || null,
          skills: skills.map(s => ({ name: s.skill.name, proficiency: s.proficiency, yearsOfExp: s.yearsOfExp, featured: s.featured })),
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  const completeness = [
    { label: "Headline", done: !!headline },
    { label: "Summary", done: !!summary },
    { label: "Location", done: !!location },
    { label: "Skills (3+)", done: skills.length >= 3 },
    { label: "Salary range", done: !!salaryMin },
    { label: "Work preference", done: !!workMode },
  ];
  const score = Math.round((completeness.filter(c => c.done).length / completeness.length) * 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-white/30" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-white/50 text-sm mt-1">Keep your profile complete to get better AI matches</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white text-sm font-medium transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </div>

      {/* Completeness */}
      <div className="p-4 rounded-xl bg-white/3 border border-white/8 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4361ee]" />
            <span className="text-sm font-medium text-white">Profile strength</span>
          </div>
          <span className={`text-sm font-bold ${score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"}`}>
            {score}%
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-white/8 mb-3">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${score}%`, background: score >= 80 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444" }}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {completeness.map(item => (
            <span key={item.label} className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
              item.done ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-white/30"
            }`}>
              {item.done ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 rounded-full border border-white/15" />}
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        {/* Basics */}
        <div className="p-5 rounded-xl bg-white/3 border border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-[#4361ee]" />
            <h2 className="text-sm font-semibold text-white">Basic info</h2>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Professional headline</label>
              <input
                value={headline}
                onChange={e => setHeadline(e.target.value)}
                placeholder="Senior Full-Stack Engineer · Open to remote"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">Summary</label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="Tell recruiters about yourself, your experience, and what you're looking for..."
                rows={4}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location</span>
              </label>
              <input
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="p-5 rounded-xl bg-white/3 border border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#4361ee]" />
            <h2 className="text-sm font-semibold text-white">Links</h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: <Linkedin className="w-3.5 h-3.5" />, label: "LinkedIn", value: linkedinUrl, set: setLinkedinUrl, placeholder: "https://linkedin.com/in/yourname" },
              { icon: <Github className="w-3.5 h-3.5" />, label: "GitHub", value: githubUrl, set: setGithubUrl, placeholder: "https://github.com/username" },
              { icon: <Globe className="w-3.5 h-3.5" />, label: "Portfolio", value: portfolioUrl, set: setPortfolioUrl, placeholder: "https://yoursite.com" },
            ].map(link => (
              <div key={link.label}>
                <label className="flex items-center gap-1.5 text-xs text-white/50 mb-1.5">
                  {link.icon} {link.label}
                </label>
                <input
                  type="url"
                  value={link.value}
                  onChange={e => link.set(e.target.value)}
                  placeholder={link.placeholder}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="p-5 rounded-xl bg-white/3 border border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[#4361ee]" />
            <h2 className="text-sm font-semibold text-white">Skills</h2>
            <span className="text-xs text-white/30">({skills.length})</span>
          </div>

          {/* Current skills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(skill => (
              <div key={skill.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 group">
                <span className="text-sm text-white">{skill.skill.name}</span>
                <select
                  value={skill.proficiency}
                  onChange={e => updateProficiency(skill.id, e.target.value)}
                  className={`text-xs rounded px-1 py-0.5 border-0 outline-none cursor-pointer ${PROFICIENCY_COLORS[skill.proficiency] || "bg-white/10 text-white/40"}`}
                >
                  {Object.entries(SKILL_PROFICIENCY).map(([k, v]) => (
                    <option key={k} value={k} className="bg-[#1a1a2e] text-white">{v}</option>
                  ))}
                </select>
                <button onClick={() => removeSkill(skill.id)} className="text-white/20 hover:text-white/60 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Add skill */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus-within:border-[#4361ee]/50 transition-colors">
              <Plus className="w-3.5 h-3.5 text-white/30" />
              <input
                value={skillSearch}
                onChange={e => setSkillSearch(e.target.value)}
                placeholder="Add skill (e.g. React, Python, Leadership...)"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 outline-none"
              />
            </div>
            {skillSearch && filteredSkills.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl bg-[#1a1a2e] border border-white/10 shadow-xl z-10 max-h-48 overflow-y-auto">
                {filteredSkills.slice(0, 8).map(s => (
                  <button
                    key={s.slug}
                    onClick={() => addSkill(s.name)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-sm text-white/80 transition-colors text-left"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs text-white/30 ml-auto">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preferences */}
        <div className="p-5 rounded-xl bg-white/3 border border-white/8">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="w-4 h-4 text-[#4361ee]" />
            <h2 className="text-sm font-semibold text-white">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Min salary (USD/yr)</label>
                <input
                  type="number"
                  value={salaryMin}
                  onChange={e => setSalaryMin(e.target.value)}
                  placeholder="80000"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Max salary (USD/yr)</label>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={e => setSalaryMax(e.target.value)}
                  placeholder="150000"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-2">Work preference</label>
              <div className="flex gap-2">
                {Object.entries(WORK_MODES).map(([k, v]) => (
                  <button
                    key={k}
                    onClick={() => setWorkMode(k)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      workMode === k
                        ? "bg-[#4361ee] text-white"
                        : "bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/70"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Tip */}
        <div className="p-4 rounded-xl bg-[#4361ee]/10 border border-[#4361ee]/20 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#4361ee] flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-medium text-white mb-1">AI Match Tip</div>
            <p className="text-xs text-white/50">
              Profiles with 5+ skills and a salary range get 3× more relevant AI matches. Adding your GitHub or portfolio boosts your match score by up to 15 points.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
