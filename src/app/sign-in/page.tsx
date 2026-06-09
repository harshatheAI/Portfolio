"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff, Sparkles } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@drape.ai");
  const [password, setPassword] = useState("demo12345");
  const [showPw, setShowPw] = useState(false);
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
    if (res?.ok) {
      router.push("/discover");
    } else {
      setError("Invalid email or password");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-baseline gap-2 mb-8">
        <span className="font-serif text-3xl font-bold text-[#8B1A1A]">Drape</span>
        <span className="text-xs text-[#D4A843] tracking-widest uppercase">ethnic</span>
      </Link>

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm border border-[#EDE5D8]">
        <h1 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">Welcome back</h1>
        <p className="text-[#4A4A4A] text-sm mb-6">Sign in to your Drape account</p>

        <div className="bg-[#F5F0E8] rounded-xl p-3 mb-6 flex items-start gap-2">
          <Sparkles size={16} className="text-[#D4A843] mt-0.5 shrink-0" />
          <p className="text-xs text-[#4A4A4A]">
            <span className="font-medium">Demo account:</span> demo@drape.ai / demo12345
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#4A4A4A]"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1A1A] text-white py-3.5 rounded-full font-semibold hover:bg-[#A52929] disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-[#4A4A4A] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-[#8B1A1A] font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
