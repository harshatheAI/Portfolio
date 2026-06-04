"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Loader2, Building2 } from "lucide-react";
import { COMPANY_SIZES } from "@/lib/constants";

const steps = ["Company", "Role", "Hiring needs"];

export default function RecruiterOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("51–200");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [recruiterTitle, setRecruiterTitle] = useState("");
  const [hiringFor, setHiringFor] = useState<string[]>([]);
  const [hiringVolume, setHiringVolume] = useState("1-5");

  const roleOptions = ["Engineering", "Product", "Design", "Marketing", "Sales", "Operations", "Finance", "HR", "Legal", "Other"];
  const volumeOptions = ["1–5 roles/year", "6–20 roles/year", "21–50 roles/year", "50+ roles/year"];

  function toggleRole(role: string) {
    setHiringFor(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  }

  async function handleComplete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, industry, companySize, companyWebsite, recruiterTitle, hiringFor, hiringVolume }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/recruiter/dashboard");
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7b5ea7] to-[#4361ee] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">NexusHire</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your hiring account</h1>
          <p className="text-white/50 text-sm mt-1">Takes 2 minutes. Start hiring smarter today.</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-[#7b5ea7]" : "bg-white/10"}`} />
          ))}
        </div>

        <div className="p-6 rounded-2xl bg-white/3 border border-white/10">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">
                  <Building2 className="inline w-5 h-5 mr-2 text-[#7b5ea7]" />
                  Company details
                </h2>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Company name</label>
                  <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Acme Inc."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Industry</label>
                  <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="SaaS / FinTech / Healthcare..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Company size</label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_SIZES.map(size => (
                      <button key={size} onClick={() => setCompanySize(size)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${companySize === size ? "bg-[#7b5ea7]/20 border-[#7b5ea7] text-[#7b5ea7]" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Website (optional)</label>
                  <input value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} placeholder="https://acme.com"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Your role</h2>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">Your job title</label>
                  <input value={recruiterTitle} onChange={e => setRecruiterTitle(e.target.value)} placeholder="Head of Talent / Technical Recruiter"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#7b5ea7] text-sm" />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-lg font-semibold text-white mb-4">What are you hiring for?</h2>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Departments (select all that apply)</label>
                  <div className="flex flex-wrap gap-2">
                    {roleOptions.map(role => (
                      <button key={role} onClick={() => toggleRole(role)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${hiringFor.includes(role) ? "bg-[#7b5ea7]/20 border-[#7b5ea7] text-[#7b5ea7]" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">Typical hiring volume</label>
                  <div className="space-y-2">
                    {volumeOptions.map(vol => (
                      <button key={vol} onClick={() => setHiringVolume(vol)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm border transition-all ${hiringVolume === vol ? "bg-[#7b5ea7]/20 border-[#7b5ea7] text-white" : "border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"}`}>
                        <span>{vol}</span>
                        {hiringVolume === vol && <CheckCircle2 className="w-4 h-4 text-[#7b5ea7]" />}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-4">
          <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 transition-colors disabled:opacity-30">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#7b5ea7] hover:bg-[#6b4e9a] text-white text-sm font-medium transition-colors">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-sm font-semibold transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Start hiring
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
