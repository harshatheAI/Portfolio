"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Sparkles, Loader2, Eye, EyeOff } from "lucide-react";

const ROLE_HOME: Record<string, string> = {
  CANDIDATE: "/candidate/dashboard",
  RECRUITER: "/recruiter/dashboard",
  AGENCY: "/agency/dashboard",
};

export default function SignInPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    if (callbackUrl) {
      router.push(callbackUrl);
    } else {
      const session = await getSession();
      const role = (session?.user as { role?: string })?.role || "CANDIDATE";
      router.push(ROLE_HOME[role] || "/candidate/dashboard");
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#060610] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white">NexusHire</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-white/50 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Form */}
        <div className="p-6 rounded-2xl bg-white/3 border border-white/10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="••••••••"
                  required
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
              className="w-full py-2.5 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-sm text-white/40">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-[#4361ee] hover:text-[#6b8aff] transition-colors font-medium">
                Sign up free
              </Link>
            </p>
          </div>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 p-4 rounded-xl bg-white/2 border border-white/5">
          <p className="text-xs text-white/40 text-center mb-3 font-medium uppercase tracking-wider">Try demo accounts</p>
          <div className="space-y-2">
            {[
              { label: "Candidate", email: "candidate@demo.com", password: "demo12345" },
              { label: "Recruiter", email: "recruiter@demo.com", password: "demo12345" },
              { label: "Agency", email: "agency@demo.com", password: "demo12345" },
            ].map(demo => (
              <button
                key={demo.label}
                type="button"
                onClick={() => { setEmail(demo.email); setPassword(demo.password); }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-sm group"
              >
                <span className="text-white/50 group-hover:text-white/70">{demo.label}</span>
                <span className="text-white/25 font-mono text-xs">{demo.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
