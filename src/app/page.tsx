"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  Users,
  Building2,
  BriefcaseBusiness,
  CheckCircle2,
  ArrowRight,
  Star,
  Clock,
  Target,
  Brain,
  MessageSquareText,
  ChevronRight,
  Play,
} from "lucide-react";

const personas = ["candidates", "recruiters", "agencies"] as const;
type Persona = (typeof personas)[number];

const personaContent = {
  candidates: {
    headline: "Your skills deserve the right opportunity.",
    subheadline: "Stop applying into black holes. NexusHire's AI matches you to roles that actually fit — and guarantees a response within 24 hours.",
    cta: "Find your match",
    ctaLink: "/sign-up?role=CANDIDATE",
    color: "#4361ee",
    emoji: "🎯",
    stats: [
      { value: "94%", label: "Response rate" },
      { value: "< 48h", label: "Time to first response" },
      { value: "3.2×", label: "Better match quality" },
    ],
    features: [
      { icon: <Brain className="w-5 h-5" />, text: "AI explains exactly why you match each role" },
      { icon: <Shield className="w-5 h-5" />, text: "Skills-based matching, not keyword filtering" },
      { icon: <MessageSquareText className="w-5 h-5" />, text: "Guaranteed response — no more black holes" },
      { icon: <TrendingUp className="w-5 h-5" />, text: "Real-time salary transparency for every role" },
    ],
  },
  recruiters: {
    headline: "Hire in days, not months.",
    subheadline: "Your AI hiring agent sources, screens, and ranks candidates autonomously. You focus on the final conversation — we handle everything before it.",
    cta: "Start hiring smarter",
    ctaLink: "/sign-up?role=RECRUITER",
    color: "#7b5ea7",
    emoji: "⚡",
    stats: [
      { value: "10×", label: "Faster candidate sourcing" },
      { value: "85%", label: "Reduction in screening time" },
      { value: "2.1×", label: "Higher offer acceptance rate" },
    ],
    features: [
      { icon: <Sparkles className="w-5 h-5" />, text: "AI writes better job descriptions & removes bias" },
      { icon: <Target className="w-5 h-5" />, text: "Ranked pipelines with match scores & explanations" },
      { icon: <Zap className="w-5 h-5" />, text: "Automated async screening via intelligent Q&A" },
      { icon: <TrendingUp className="w-5 h-5" />, text: "Analytics that improve every hire you make" },
    ],
  },
  agencies: {
    headline: "Scale placements without scaling headcount.",
    subheadline: "AI handles the sourcing, screening, and matching. Your team focuses on relationships and closings. Same clients, 5× the placements.",
    cta: "Grow your agency",
    ctaLink: "/sign-up?role=AGENCY",
    color: "#22c55e",
    emoji: "🚀",
    stats: [
      { value: "5×", label: "More placements per recruiter" },
      { value: "2%", label: "Success fee vs 15–20% traditional" },
      { value: "72h", label: "Average time to first shortlist" },
    ],
    features: [
      { icon: <Users className="w-5 h-5" />, text: "Multi-client dashboard with unified pipeline view" },
      { icon: <Brain className="w-5 h-5" />, text: "AI sources passive candidates from public signals" },
      { icon: <CheckCircle2 className="w-5 h-5" />, text: "Compliance documentation auto-generated" },
      { icon: <TrendingUp className="w-5 h-5" />, text: "Placement analytics and client ROI reporting" },
    ],
  },
};

const howItWorks = {
  candidates: [
    { step: "01", title: "Build your skills graph", desc: "Add verified skills, experience, and preferences in 5 minutes. No resume required." },
    { step: "02", title: "Get AI-matched to roles", desc: "Our AI analyzes your profile against active jobs and explains every match in detail." },
    { step: "03", title: "Apply with one click", desc: "Apply to matched roles and get a guaranteed response within 24 hours. Always." },
  ],
  recruiters: [
    { step: "01", title: "Post your role in minutes", desc: "Describe the role — AI enhances your JD, removes bias, and sets optimal search parameters." },
    { step: "02", title: "AI builds your pipeline", desc: "Candidates are matched, ranked, and pre-screened automatically. You see the shortlist." },
    { step: "03", title: "Close faster", desc: "Review AI-scored candidates, run interviews, and make offers — all in one place." },
  ],
  agencies: [
    { step: "01", title: "Onboard your clients", desc: "Add client requirements and let AI map role needs to your talent pool instantly." },
    { step: "02", title: "AI sources & screens", desc: "Autonomous agents find and qualify candidates across your pool and beyond." },
    { step: "03", title: "Track placements & fees", desc: "Unified placement tracking, fee calculations, and client reporting in one dashboard." },
  ],
};

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    company: "Hired at Stripe",
    avatar: "SC",
    text: "After 3 months of black holes on LinkedIn, NexusHire got me 8 interviews in 2 weeks. The AI match explanations told me exactly what to highlight.",
    stars: 5,
  },
  {
    name: "Marcus Rodriguez",
    role: "Head of Engineering",
    company: "Fintech Startup",
    avatar: "MR",
    text: "We went from 6-week hiring cycles to 9 days. The AI-screened pipeline meant every candidate I talked to was genuinely qualified.",
    stars: 5,
  },
  {
    name: "Priya Nair",
    role: "Senior Recruiter",
    company: "TalentBridge Agency",
    avatar: "PN",
    text: "I went from managing 20 open roles to 90. The AI handles everything until the final shortlist. My placement rate doubled in 60 days.",
    stars: 5,
  },
];

const features = [
  {
    icon: <Brain className="w-6 h-6 text-[#4361ee]" />,
    title: "Skills-Graph Matching",
    desc: "Match on demonstrated skills and experience — not keywords, not degrees. AI understands what candidates can actually do.",
  },
  {
    icon: <MessageSquareText className="w-6 h-6 text-[#7b5ea7]" />,
    title: "Zero Black Holes",
    desc: "Every application receives a response within 24 hours, powered by AI. Candidates know exactly where they stand.",
  },
  {
    icon: <Sparkles className="w-6 h-6 text-[#22c55e]" />,
    title: "AI Match Explanation",
    desc: "Both sides see exactly why they're a match — skill overlap, experience fit, salary alignment, and growth potential.",
  },
  {
    icon: <Shield className="w-6 h-6 text-amber-500" />,
    title: "Bias Detection",
    desc: "AI audits every job description for exclusionary language, degree inflation, and coded bias before it goes live.",
  },
  {
    icon: <Zap className="w-6 h-6 text-rose-500" />,
    title: "Async AI Screening",
    desc: "Candidates answer structured questions asynchronously. AI evaluates, scores, and summarizes — no scheduling required.",
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-cyan-500" />,
    title: "Outcome Learning",
    desc: "The platform learns from every hire. Match quality improves as AI correlates predictions with actual 6-month retention.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for exploring the platform",
    cta: "Get started free",
    ctaLink: "/sign-up",
    features: [
      "Up to 3 active job posts",
      "Basic AI matching",
      "10 candidate views/month",
      "Email support",
    ],
    highlight: false,
  },
  {
    name: "Growth",
    price: "$199",
    period: "/month",
    description: "For teams serious about hiring quality",
    cta: "Start free trial",
    ctaLink: "/sign-up?plan=growth",
    features: [
      "Unlimited job posts",
      "Full AI matching + explanations",
      "AI job description enhancement",
      "Async AI screening",
      "Bias detection",
      "Pipeline analytics",
      "Priority support",
    ],
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Enterprise",
    price: "$999",
    period: "/month",
    description: "For high-volume and enterprise teams",
    cta: "Contact sales",
    ctaLink: "/contact",
    features: [
      "Everything in Growth",
      "Unlimited team seats",
      "Custom AI training on your data",
      "ATS integrations",
      "Dedicated success manager",
      "SLA guarantee",
      "White-glove onboarding",
    ],
    highlight: false,
  },
];

const stats = [
  { value: "47,200+", label: "AI matches made" },
  { value: "3,400+", label: "Companies hiring" },
  { value: "94%", label: "Response rate" },
  { value: "9 days", label: "Avg. time to hire" },
];

export default function LandingPage() {
  const [activePersona, setActivePersona] = useState<Persona>("candidates");
  const content = personaContent[activePersona];
  const steps = howItWorks[activePersona];

  return (
    <div className="min-h-screen bg-[#060610] text-white overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#060610]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">NexusHire</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How it works</a>
              <a href="#pricing" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-sm text-white/70 hover:text-white transition-colors">Sign in</Link>
              <Link
                href="/sign-up"
                className="px-4 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3451d1] text-white text-sm font-medium transition-colors"
              >
                Get started free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-20"
            style={{ background: "radial-gradient(ellipse at center, #4361ee 0%, transparent 70%)" }} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Persona tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {personas.map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePersona(p)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    activePersona === p
                      ? "bg-white text-[#060610] shadow-lg"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {p === "candidates" && <Users className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />}
                  {p === "recruiters" && <BriefcaseBusiness className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />}
                  {p === "agencies" && <Building2 className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />}
                  {p}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="text-center max-w-4xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/60 mb-6">
                <Sparkles className="w-3.5 h-3.5" style={{ color: content.color }} />
                AI-native hiring platform
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                {content.headline.split(" ").slice(0, -2).join(" ")}{" "}
                <span className="gradient-text">{content.headline.split(" ").slice(-2).join(" ")}</span>
              </h1>

              <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed">
                {content.subheadline}
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                <Link
                  href={content.ctaLink}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${content.color}, #7b5ea7)` }}
                >
                  {content.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-all">
                  <Play className="w-4 h-4" />
                  Watch 2-min demo
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-8 mb-16">
                {content.stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="text-3xl font-black" style={{ color: content.color }}>{stat.value}</div>
                    <div className="text-sm text-white/50 mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Feature bullets */}
              <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto text-left">
                {content.features.map((f, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                    <div className="mt-0.5 flex-shrink-0" style={{ color: content.color }}>{f.icon}</div>
                    <span className="text-sm text-white/70">{f.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 border-y border-white/5 bg-white/2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/50 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#4361ee]" />
              Platform features
            </div>
            <h2 className="text-4xl font-black mb-4">Built for the next era of hiring</h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Every feature is designed around a single principle: make the right match obvious to both sides.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl bg-white/3 border border-white/8 hover:border-white/15 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-4 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">
              How it works for{" "}
              <button
                onClick={() => setActivePersona("candidates")}
                className={`underline decoration-dotted ${activePersona === "candidates" ? "text-[#4361ee]" : "text-white/40 hover:text-white/70"} transition-colors`}
              >
                candidates
              </button>
              ,{" "}
              <button
                onClick={() => setActivePersona("recruiters")}
                className={`underline decoration-dotted ${activePersona === "recruiters" ? "text-[#7b5ea7]" : "text-white/40 hover:text-white/70"} transition-colors`}
              >
                recruiters
              </button>
              , and{" "}
              <button
                onClick={() => setActivePersona("agencies")}
                className={`underline decoration-dotted ${activePersona === "agencies" ? "text-[#22c55e]" : "text-white/40 hover:text-white/70"} transition-colors`}
              >
                agencies
              </button>
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona + "-steps"}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="grid md:grid-cols-3 gap-6"
            >
              {steps.map((step, i) => (
                <div key={step.step} className="relative p-6 rounded-2xl bg-white/3 border border-white/8">
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-10 right-0 translate-x-3/4 z-10">
                      <ChevronRight className="w-5 h-5 text-white/20" />
                    </div>
                  )}
                  <div className="text-5xl font-black mb-4" style={{ color: `${content.color}30` }}>
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Loved by candidates, recruiters, and agencies</h2>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
              <span className="ml-2 text-white/50 text-sm">4.9/5 from 2,400+ reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/3 border border-white/8"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-white/40">{t.role} · {t.company}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array(t.stars).fill(0).map((_, j) => (
                      <Star key={j} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/60 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-4 bg-white/2">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-white/50 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#4361ee]" />
              Transparent pricing
            </div>
            <h2 className="text-4xl font-black mb-4">Start free. Scale when you&apos;re ready.</h2>
            <p className="text-white/50 text-lg">Candidates are always free. Recruiters start free with no credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative p-6 rounded-2xl border transition-all ${
                  plan.highlight
                    ? "bg-[#4361ee]/10 border-[#4361ee]/40 shadow-lg shadow-[#4361ee]/10"
                    : "bg-white/3 border-white/8 hover:border-white/15"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#4361ee] text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black">{plan.price}</span>
                    <span className="text-white/40 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-sm text-white/50">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#22c55e] mt-0.5 flex-shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaLink}
                  className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "bg-[#4361ee] text-white hover:bg-[#3451d1]"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative p-12 rounded-3xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at center, rgba(67,97,238,0.15) 0%, transparent 70%)" }} />
            <div className="relative z-10">
              <div className="text-5xl mb-6">⚡</div>
              <h2 className="text-4xl font-black mb-4">
                The future of hiring is here.
              </h2>
              <p className="text-white/50 text-lg mb-8 max-w-xl mx-auto">
                Join 47,000+ candidates and 3,400+ companies who&apos;ve already made their first AI-powered match.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/sign-up?role=CANDIDATE"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-white text-[#060610] hover:bg-white/90 transition-all"
                >
                  <Users className="w-4 h-4" />
                  I&apos;m a candidate
                </Link>
                <Link
                  href="/sign-up?role=RECRUITER"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-[#4361ee] text-white hover:bg-[#3451d1] transition-all"
                >
                  <BriefcaseBusiness className="w-4 h-4" />
                  I&apos;m hiring
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#7b5ea7] flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold">NexusHire</span>
              <span className="text-white/30 text-sm">— The AI-native hiring platform</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
              <a href="#" className="hover:text-white/70 transition-colors">Blog</a>
              <span>© 2025 NexusHire</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
