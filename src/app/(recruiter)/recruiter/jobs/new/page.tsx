"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, Loader2, AlertTriangle, CheckCircle2, ArrowLeft, Eye, EyeOff,
  Zap, X
} from "lucide-react";
import { JOB_TYPES, WORK_MODES, EXPERIENCE_LEVELS, POPULAR_SKILLS } from "@/lib/constants";

interface SkillEntry {
  name: string;
  required: boolean;
  minYears: number;
}

interface BiasIssue {
  phrase: string;
  reason: string;
  suggestion: string;
}

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [workMode, setWorkMode] = useState("REMOTE");
  const [jobType, setJobType] = useState("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState("MID");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [skillSearch, setSkillSearch] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [enhancedDesc, setEnhancedDesc] = useState("");
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [biasIssues, setBiasIssues] = useState<BiasIssue[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const filteredSkills = POPULAR_SKILLS.filter(
    s => s.name.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.find(sk => sk.name === s.name)
  );

  function addSkill(name: string) {
    setSkills(prev => [...prev, { name, required: true, minYears: 0 }]);
    setSkillSearch("");
  }

  async function enhanceWithAI() {
    if (!description.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/enhance-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, title, context: { workMode, jobType, experienceLevel } }),
      });
      const data = await res.json();
      if (data.enhanced) setEnhancedDesc(data.enhanced);
      if (data.biasIssues) setBiasIssues(data.biasIssues);
      setShowEnhanced(true);
    } catch {
      // AI call failed gracefully
    } finally {
      setAiLoading(false);
    }
  }

  async function handlePublish(publish: boolean) {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: showEnhanced && enhancedDesc ? enhancedDesc : description,
          location,
          workMode,
          jobType,
          experienceLevel,
          salaryMin: salaryMin ? parseInt(salaryMin) : null,
          salaryMax: salaryMax ? parseInt(salaryMax) : null,
          skills,
          published: publish,
        }),
      });
      if (!res.ok) throw new Error("Failed to create job");
      const data = await res.json();
      router.push(`/recruiter/jobs/${data.data.id}`);
    } catch {
      setError("Failed to create job. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Post a new job</h1>
          <p className="text-white/50 text-sm mt-0.5">AI will enhance your listing and check for bias.</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

      <div className="space-y-6">
        {/* Basic info */}
        <div className="p-6 rounded-2xl bg-white/3 border border-white/8 space-y-4">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-white/50">Role details</h2>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Job title *</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Senior Software Engineer"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Work mode</label>
              <select value={workMode} onChange={e => setWorkMode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#7b5ea7] text-sm">
                {Object.entries(WORK_MODES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Job type</label>
              <select value={jobType} onChange={e => setJobType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#7b5ea7] text-sm">
                {Object.entries(JOB_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Experience level</label>
              <select value={experienceLevel} onChange={e => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#7b5ea7] text-sm">
                {Object.entries(EXPERIENCE_LEVELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Location (optional)</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="San Francisco, CA or Remote"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Min salary (USD/yr)</label>
              <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="100000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Max salary (USD/yr)</label>
              <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="150000"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="p-6 rounded-2xl bg-white/3 border border-white/8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-white/50">Job description</h2>
            <button onClick={enhanceWithAI} disabled={aiLoading || !description.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7b5ea7]/20 border border-[#7b5ea7]/30 text-[#9b7ec7] hover:bg-[#7b5ea7]/30 transition-all text-xs font-medium disabled:opacity-40">
              {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Enhance with AI
            </button>
          </div>

          {/* Bias issues */}
          {biasIssues.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-300">{biasIssues.length} bias concern{biasIssues.length !== 1 ? "s" : ""} found</span>
              </div>
              <div className="space-y-2">
                {biasIssues.slice(0, 3).map((issue, i) => (
                  <div key={i} className="text-xs">
                    <span className="text-amber-400 font-mono">&ldquo;{issue.phrase}&rdquo;</span>
                    <span className="text-white/40 ml-1">→ {issue.suggestion}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Description toggle */}
          {enhancedDesc && (
            <div className="flex gap-2">
              <button onClick={() => setShowEnhanced(false)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all ${!showEnhanced ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
                <EyeOff className="w-3 h-3" /> Original
              </button>
              <button onClick={() => setShowEnhanced(true)}
                className={`flex items-center gap-1 px-3 py-1 rounded text-xs transition-all ${showEnhanced ? "bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30" : "text-white/40 hover:text-white/60"}`}>
                <Zap className="w-3 h-3" /> AI Enhanced
              </button>
            </div>
          )}

          <textarea
            value={showEnhanced && enhancedDesc ? enhancedDesc : description}
            onChange={e => {
              if (showEnhanced) setEnhancedDesc(e.target.value);
              else setDescription(e.target.value);
            }}
            placeholder="Describe the role, what success looks like, and why someone would want this job...

Tip: Write about impact and growth opportunities, not just requirements."
            rows={12}
            className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm resize-none font-mono"
          />

          {showEnhanced && enhancedDesc && (
            <div className="flex items-center gap-2 text-xs text-[#22c55e]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Using AI-enhanced description
            </div>
          )}
        </div>

        {/* Required skills */}
        <div className="p-6 rounded-2xl bg-white/3 border border-white/8 space-y-4">
          <h2 className="font-semibold text-white text-sm uppercase tracking-wider text-white/50">Required skills</h2>
          <div className="relative">
            <input value={skillSearch} onChange={e => setSkillSearch(e.target.value)}
              placeholder="Add required skills (React, Python, SQL...)"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
            {skillSearch && filteredSkills.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 p-2 rounded-lg bg-[#18181b] border border-white/10 max-h-40 overflow-y-auto space-y-1">
                {filteredSkills.slice(0, 6).map(s => (
                  <button key={s.name} onClick={() => addSkill(s.name)}
                    className="flex items-center w-full px-2 py-1.5 rounded hover:bg-white/5 text-left">
                    <span className="text-sm text-white/80">{s.name}</span>
                    <span className="ml-2 text-xs text-white/30">{s.category}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill.name} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7b5ea7]/15 border border-[#7b5ea7]/25 text-sm">
                <span className="text-[#9b7ec7]">{skill.name}</span>
                <button onClick={() => setSkills(prev => prev.filter(s => s.name !== skill.name))}
                  className="text-white/30 hover:text-white/70 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {skills.length === 0 && (
              <span className="text-sm text-white/30">No skills added yet. Add skills to improve AI matching accuracy.</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pb-8">
          <button onClick={() => handlePublish(false)} disabled={submitting || !title.trim()}
            className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white text-sm font-medium transition-colors disabled:opacity-40">
            Save as draft
          </button>
          <button onClick={() => handlePublish(true)} disabled={submitting || !title.trim() || !description.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#7b5ea7] hover:bg-[#6b4e9a] text-white text-sm font-semibold transition-colors disabled:opacity-40">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Publish job
          </button>
        </div>
      </div>
    </div>
  );
}
