"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Sparkles, Loader2, Users, BriefcaseBusiness, Building2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";

type Role = "CANDIDATE" | "RECRUITER" | "AGENCY";

const roles = [
  {
    id: "CANDIDATE" as Role,
    label: "Job Seeker",
    icon: <Users className="w-5 h-5" />,
    desc: "Find AI-matched opportunities",
    color: "#4361ee",
    bullets: ["Skill-based matching", "Guaranteed responses", "AI match explanations"],
  },
  {
    id: "RECRUITER" as Role,
    label: "Recruiter / Hiring Manager",
    icon: <BriefcaseBusiness className="w-5 h-5" />,
    desc: "Hire faster with AI",
    color: "#7b5ea7",
    bullets: ["AI-powered pipeline", "Automated screening", "Bias-free job posts"],
  },
  {
    id: "AGENCY" as Role,
    label: "Staffing Agency",
    icon: <Building2 className="w-5 h-5" />,
    desc: "Scale your placements",
    color: "#22c55e",
    bullets: ["Multi-client dashboard", "Bulk AI sourcing", "Placement analytics"],
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = (params.get("role") as Role) || "CANDIDATE";

  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<Role>(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: selectedRole }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      // Auto sign-in
      const signInRes = await signIn("credentials", { email, password, redirect: false });
      if (signInRes?.error) {
        setError("Account created! Please sign in.");
        router.push("/sign-in");
        return;
      }

      const dest = selectedRole === "RECRUITER" ? "/onboarding/recruiter" : selectedRole === "AGENCY" ? "/onboarding/agency" : "/onboarding/candidate";
      router.push(dest);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">NexusHire</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {step === "role" ? "Who are you?" : "Create your account"}
          </h1>
          <p className="text-white/50 text-sm mt-1">
            {step === "role"
              ? "We'll personalize your experience based on your role."
              : `Joining as a ${roles.find(r => r.id === selectedRole)?.label}`}
          </p>
        </div>

        {step === "role" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {roles.map(role => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  selectedRole === role.id
                    ? "border-[#4361ee] bg-[#4361ee]/10"
                    : "border-white/10 bg-white/3 hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${role.color}20`, color: role.color }}
                  >
                    {role.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-white text-sm">{role.label}</div>
                      {selectedRole === role.id && <CheckCircle2 className="w-4 h-4 text-[#4361ee]" />}
                    </div>
                    <div className="text-xs text-white/50 mt-0.5 mb-2">{role.desc}</div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {role.bullets.map(b => (
                        <span key={b} className="text-xs text-white/40 flex items-center gap-1">
                          <span style={{ color: role.color }}>·</span> {b}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={() => setStep("form")}
              className="w-full py-3 mt-2 rounded-xl bg-[#4361ee] hover:bg-[#3451d1] text-white font-semibold text-sm transition-colors"
            >
              Continue as {roles.find(r => r.id === selectedRole)?.label}
            </button>

            <p className="text-center text-sm text-white/40 pt-2">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-[#4361ee] hover:text-[#6b8aff] transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
        )}

        {step === "form" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="p-6 rounded-2xl bg-white/3 border border-white/10"
          >
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Alex Johnson"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-[#4361ee] transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                ) : (
                  "Create account"
                )}
              </button>
            </form>

            <button
              onClick={() => setStep("role")}
              className="mt-4 text-sm text-white/40 hover:text-white/60 transition-colors w-full text-center"
            >
              ← Change role selection
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
