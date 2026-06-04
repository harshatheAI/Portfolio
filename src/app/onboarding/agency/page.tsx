"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, Loader2 } from "lucide-react";

export default function AgencyOnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [website, setWebsite] = useState("");
  const [teamSize, setTeamSize] = useState("1-5");

  const teamOptions = ["Just me", "2–5", "6–20", "20+"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agencyName, website, teamSize }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/agency/dashboard");
      router.refresh();
    } catch {
      setError("Failed to save. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#22c55e] to-[#4361ee] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">NexusHire</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Set up your agency</h1>
          <p className="text-white/50 text-sm mt-1">Start placing candidates 5× faster with AI.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white/3 border border-white/10 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Agency name</label>
            <input value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="TalentBridge Staffing" required
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#22c55e] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Website (optional)</label>
            <input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yoursite.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#22c55e] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Team size</label>
            <div className="flex gap-2">
              {teamOptions.map(opt => (
                <button key={opt} type="button" onClick={() => setTeamSize(opt)}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-all ${teamSize === opt ? "bg-[#22c55e]/20 border-[#22c55e] text-[#22c55e]" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                  {opt}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Start placing talent
          </button>
        </form>
      </div>
    </div>
  );
}
