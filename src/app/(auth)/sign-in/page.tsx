"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Info, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Incorrect email or password.");
      setLoading(false);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md p-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in to manage your moves and tracking.</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="flex items-center gap-2 text-sm text-red-600"><Info className="h-4 w-4" /> {error}</p>}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
        New here?{" "}
        <Link href="/sign-up" className="font-semibold text-[var(--color-forest-700)] hover:underline">Create an account</Link>
      </p>
    </Card>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-[var(--text-muted)]" />}>
      <SignInForm />
    </Suspense>
  );
}
