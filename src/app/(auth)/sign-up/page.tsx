"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Info, UserPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

const perks = ["Save quotes & rebook in a tap", "Live tracking on move day", "All your move docs in one place"];

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Could not create your account.");
      setLoading(false);
      return;
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">It takes 30 seconds — no move required to sign up.</p>

      <ul className="mt-4 space-y-1.5">
        {perks.map((p) => (
          <li key={p} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-forest-500)]" /> {p}
          </li>
        ))}
      </ul>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="phone" hint="Optional">Phone</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="8+ characters" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
        </div>
        {error && <p className="flex items-center gap-2 text-sm text-red-600"><Info className="h-4 w-4" /> {error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-semibold text-[var(--color-forest-700)] hover:underline">Sign in</Link>
      </p>
    </Card>
  );
}
