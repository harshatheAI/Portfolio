"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);
    if (res.ok) {
      router.push("/sign-in");
    } else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-baseline gap-2 mb-8">
        <span className="font-serif text-3xl font-bold text-[#8B1A1A]">Drape</span>
        <span className="text-xs text-[#D4A843] tracking-widest uppercase">ethnic</span>
      </Link>

      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-sm border border-[#EDE5D8]">
        <h1 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-2">Join Drape</h1>
        <p className="text-[#4A4A4A] text-sm mb-6">Create your account and meet Priya, your AI stylist</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text", placeholder: "Ananya Sharma" },
            { label: "Email", key: "email", type: "email", placeholder: "ananya@example.com" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                required
                className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A] pr-12"
              />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A]">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button type="submit" disabled={loading} className="w-full bg-[#8B1A1A] text-white py-3.5 rounded-full font-semibold hover:bg-[#A52929] disabled:opacity-50 transition-colors">
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-[#4A4A4A] mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-[#8B1A1A] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
