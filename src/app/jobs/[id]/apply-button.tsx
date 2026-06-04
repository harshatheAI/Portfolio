"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  jobId: string;
  isLoggedIn: boolean;
  isCandidate: boolean;
  alreadyApplied: boolean;
}

export function ApplyButton({ jobId, isLoggedIn, isCandidate, alreadyApplied }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(alreadyApplied);
  const [coverLetter, setCoverLetter] = useState("");
  const [showCover, setShowCover] = useState(false);

  if (!isLoggedIn) {
    return (
      <Link
        href={`/sign-up?role=CANDIDATE&callbackUrl=/jobs/${jobId}`}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4361ee] hover:bg-[#3451d1] text-white font-semibold text-sm transition-colors"
      >
        <Sparkles className="w-4 h-4" />
        Apply with AI
      </Link>
    );
  }

  if (!isCandidate) {
    return (
      <div className="w-full py-3 rounded-xl bg-white/5 text-white/30 text-sm text-center">
        Only candidates can apply
      </div>
    );
  }

  if (applied) {
    return (
      <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Application submitted
      </div>
    );
  }

  async function handleApply() {
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, coverLetter: coverLetter || undefined }),
      });

      if (res.ok) {
        setApplied(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {showCover ? (
        <>
          <textarea
            value={coverLetter}
            onChange={e => setCoverLetter(e.target.value)}
            placeholder="Why are you a great fit? (optional)"
            rows={4}
            className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/25 outline-none focus:border-[#4361ee]/50 resize-none"
          />
          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4361ee] hover:bg-[#3451d1] text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Submitting…" : "Submit application"}
          </button>
          <button
            onClick={() => setShowCover(false)}
            className="w-full text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Cancel
          </button>
        </>
      ) : (
        <>
          <button
            onClick={handleApply}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#4361ee] hover:bg-[#3451d1] text-white font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "Applying…" : "Apply with AI"}
          </button>
          <button
            onClick={() => setShowCover(true)}
            className="w-full text-xs text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
          >
            Add a cover letter
          </button>
        </>
      )}
    </div>
  );
}
