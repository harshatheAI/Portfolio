"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  X,
  Plus,
  MapPin,
  DollarSign,
  Briefcase,
} from "lucide-react";
import { POPULAR_SKILLS, WORK_MODES, JOB_TYPES, SKILL_PROFICIENCY } from "@/lib/constants";

const steps = ["Basics", "Skills", "Experience", "Preferences"];

const proficiencyColors: Record<string, string> = {
  BEGINNER: "#94a3b8",
  INTERMEDIATE: "#f59e0b",
  ADVANCED: "#4361ee",
  EXPERT: "#22c55e",
};

interface SkillEntry {
  name: string;
  proficiency: string;
  yearsOfExp: number;
}

export default function CandidateOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Basics
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");
  const [summary, setSummary] = useState("");

  // Step 2: Skills
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedForProf, setSelectedForProf] = useState<string | null>(null);

  // Step 3: Experience
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [expDesc, setExpDesc] = useState("");
  const [startYear, setStartYear] = useState("2022");
  const [current, setCurrent] = useState(true);

  // Step 4: Preferences
  const [salaryMin, setSalaryMin] = useState("80000");
  const [salaryMax, setSalaryMax] = useState("120000");
  const [workMode, setWorkMode] = useState<string>("REMOTE");
  const [jobType, setJobType] = useState<string>("FULL_TIME");

  const filteredSkills = POPULAR_SKILLS.filter(
    s => s.name.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.find(sk => sk.name === s.name)
  );

  function addSkill(skillName: string) {
    setSkills(prev => [...prev, { name: skillName, proficiency: "INTERMEDIATE", yearsOfExp: 2 }]);
    setSkillSearch("");
  }

  function removeSkill(name: string) {
    setSkills(prev => prev.filter(s => s.name !== name));
  }

  function updateSkillProficiency(name: string, proficiency: string) {
    setSkills(prev => prev.map(s => s.name === name ? { ...s, proficiency } : s));
    setSelectedForProf(null);
  }

  async function handleComplete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          location,
          summary,
          skills,
          experience: title ? { company, title, description: expDesc, startYear: parseInt(startYear), current } : null,
          preferences: { salaryMin: parseInt(salaryMin), salaryMax: parseInt(salaryMax), workMode, jobType },
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      router.push("/candidate/dashboard");
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">NexusHire</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Build your profile</h1>
          <p className="text-white/50 text-sm">Takes about 3 minutes. No resume required.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`h-1.5 flex-1 rounded-full transition-all ${i <= step ? "bg-[#4361ee]" : "bg-white/10"}`} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mb-6 -mt-4">
          {steps.map((s, i) => (
            <span key={s} className={`text-xs ${i === step ? "text-[#4361ee] font-medium" : "text-white/30"}`}>{s}</span>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 rounded-2xl bg-white/3 border border-white/10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Tell us about yourself</h2>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Professional headline</label>
                  <input
                    value={headline}
                    onChange={e => setHeadline(e.target.value)}
                    placeholder="Senior React Engineer · Open to remote"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    <MapPin className="inline w-3.5 h-3.5 mr-1" />Location
                  </label>
                  <input
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Brief bio (optional)</label>
                  <textarea
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                    placeholder="What you do and what you're looking for..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm resize-none"
                  />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-lg font-semibold text-white mb-4">Add your skills</h2>
                <p className="text-sm text-white/50 mb-4">Pick skills you&apos;re proficient in. Be honest — AI uses these for matching.</p>

                {/* Search */}
                <div className="relative mb-3">
                  <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    placeholder="Search skills (e.g., React, Python, SQL)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm"
                  />
                </div>

                {/* Suggestions */}
                {skillSearch && filteredSkills.length > 0 && (
                  <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10 max-h-32 overflow-y-auto space-y-1">
                    {filteredSkills.slice(0, 8).map(s => (
                      <button key={s.name} onClick={() => addSkill(s.name)}
                        className="flex items-center w-full px-2 py-1.5 rounded hover:bg-white/5 text-left">
                        <span className="text-sm text-white/80">{s.name}</span>
                        <span className="ml-2 text-xs text-white/30">{s.category}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular if empty search */}
                {!skillSearch && skills.length < 3 && (
                  <div className="mb-3">
                    <p className="text-xs text-white/30 mb-2">Popular skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SKILLS.slice(0, 12).filter(s => !skills.find(sk => sk.name === s.name)).map(s => (
                        <button key={s.name} onClick={() => addSkill(s.name)}
                          className="px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-white/60 hover:border-[#4361ee] hover:text-white transition-all">
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Added skills */}
                <div className="space-y-2">
                  {skills.map(skill => (
                    <div key={skill.name} className="flex items-center gap-2 p-2.5 rounded-lg bg-white/5 border border-white/8">
                      <span className="flex-1 text-sm text-white font-medium">{skill.name}</span>
                      <div className="flex gap-1">
                        {Object.keys(SKILL_PROFICIENCY).map(p => (
                          <button key={p} onClick={() => updateSkillProficiency(skill.name, p)}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${skill.proficiency === p ? "text-white font-medium" : "text-white/30 hover:text-white/60"}`}
                            style={skill.proficiency === p ? { backgroundColor: `${proficiencyColors[p]}20`, color: proficiencyColors[p] } : {}}>
                            {SKILL_PROFICIENCY[p as keyof typeof SKILL_PROFICIENCY].slice(0, 4)}
                          </button>
                        ))}
                      </div>
                      <button onClick={() => removeSkill(skill.name)}
                        className="text-white/30 hover:text-white/70 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {skills.length === 0 && (
                  <div className="text-center py-8 text-white/30 text-sm">
                    Add at least 3 skills to get better matches
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-1">Most recent experience</h2>
                <p className="text-sm text-white/50 mb-4">You can add more later from your profile.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Job title</label>
                    <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Software Engineer"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1.5">Company</label>
                    <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Start year</label>
                  <input type="number" value={startYear} onChange={e => setStartYear(e.target.value)} min="1990" max="2025"
                    className="w-32 px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4361ee] text-sm" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="current" checked={current} onChange={e => setCurrent(e.target.checked)}
                    className="rounded border-white/20" />
                  <label htmlFor="current" className="text-sm text-white/70">I currently work here</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">What did you accomplish? (optional)</label>
                  <textarea value={expDesc} onChange={e => setExpDesc(e.target.value)}
                    placeholder="Built scalable microservices, led a team of 5, reduced load time by 60%..."
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] text-sm resize-none" />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-lg font-semibold text-white mb-4">What are you looking for?</h2>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <DollarSign className="inline w-3.5 h-3.5 mr-1" />Desired salary range (USD/year)
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} placeholder="80000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4361ee] text-sm" />
                    <span className="text-white/40 text-sm">to</span>
                    <input type="number" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} placeholder="120000"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#4361ee] text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Work style preference</label>
                  <div className="flex gap-2">
                    {Object.entries(WORK_MODES).map(([key, label]) => (
                      <button key={key} onClick={() => setWorkMode(key)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${workMode === key ? "bg-[#4361ee]/20 border-[#4361ee] text-[#4361ee]" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    <Briefcase className="inline w-3.5 h-3.5 mr-1" />Job type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(JOB_TYPES).map(([key, label]) => (
                      <button key={key} onClick={() => setJobType(key)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all border ${jobType === key ? "bg-[#4361ee]/20 border-[#4361ee] text-[#4361ee]" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"}`}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white text-sm font-medium transition-colors"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Complete setup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
