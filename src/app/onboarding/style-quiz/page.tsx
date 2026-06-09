"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { STYLE_PERSONAS, OCCASIONS, COUNTRIES } from "@/lib/constants";

const STEPS = [
  "Shopping for",
  "Occasions",
  "Your aesthetic",
  "Budget",
  "Where are you?",
];

export default function StyleQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    gender: "",
    occasions: [] as string[],
    persona: "",
    budgetMin: 3000,
    budgetMax: 12000,
    country: "US",
  });

  const progress = ((step + 1) / STEPS.length) * 100;

  function nextStep() {
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else finish();
  }

  function finish() {
    localStorage.setItem("drape_style_profile", JSON.stringify(answers));
    router.push("/stylist");
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#EDE5D8] px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="font-serif text-xl font-bold text-[#8B1A1A]">Drape</span>
            <span className="text-sm text-[#8A8A8A]">Step {step + 1} of {STEPS.length}</span>
          </div>
          <div className="h-1.5 bg-[#EDE5D8] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#8B1A1A] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {step === 0 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">Who are you shopping for?</h2>
              <p className="text-[#4A4A4A] mb-8">We&apos;ll personalise your experience accordingly.</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: "WOMEN", label: "Women", emoji: "👗" },
                  { value: "MEN", label: "Men", emoji: "👔" },
                  { value: "BOTH", label: "Both", emoji: "👨‍👩‍👧" },
                ].map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => { setAnswers(a => ({ ...a, gender: value })); setStep(1); }}
                    className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border-2 border-[#EDE5D8] hover:border-[#8B1A1A] hover:shadow-md transition-all group"
                  >
                    <span className="text-4xl">{emoji}</span>
                    <span className="font-semibold text-[#2C2C2C] group-hover:text-[#8B1A1A]">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">What brings you here?</h2>
              <p className="text-[#4A4A4A] mb-8">Select all that apply. We&apos;ll curate your feed around these.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {OCCASIONS.map(occ => {
                  const selected = answers.occasions.includes(occ.slug);
                  return (
                    <button
                      key={occ.slug}
                      onClick={() => {
                        setAnswers(a => ({
                          ...a,
                          occasions: selected ? a.occasions.filter(o => o !== occ.slug) : [...a.occasions, occ.slug],
                        }));
                      }}
                      className={`flex items-center gap-2.5 p-3.5 rounded-xl border-2 transition-all text-sm font-medium ${
                        selected ? "bg-[#8B1A1A] border-[#8B1A1A] text-white" : "bg-white border-[#EDE5D8] hover:border-[#8B1A1A] text-[#4A4A4A]"
                      }`}
                    >
                      <span>{occ.icon}</span>
                      <span>{occ.label}</span>
                      {selected && <Check size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={nextStep}
                disabled={answers.occasions.length === 0}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#8B1A1A] text-white py-4 rounded-full font-semibold disabled:opacity-40 hover:bg-[#A52929] transition-colors"
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">Your ethnic aesthetic</h2>
              <p className="text-[#4A4A4A] mb-8">Choose the style that resonates most with you.</p>
              <div className="grid grid-cols-2 gap-4">
                {STYLE_PERSONAS.map(persona => {
                  const selected = answers.persona === persona.slug;
                  return (
                    <button
                      key={persona.slug}
                      onClick={() => { setAnswers(a => ({ ...a, persona: persona.slug })); nextStep(); }}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                        selected ? "border-[#8B1A1A] bg-[#8B1A1A]/5" : "border-[#EDE5D8] bg-white hover:border-[#8B1A1A]"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-full mb-3 opacity-80"
                        style={{ backgroundColor: persona.color }}
                      />
                      <h3 className="font-semibold text-[#2C2C2C] mb-1">{persona.label}</h3>
                      <p className="text-xs text-[#8A8A8A] leading-relaxed">{persona.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">What&apos;s your typical budget?</h2>
              <p className="text-[#4A4A4A] mb-8">Per outfit, in Indian Rupees. You can always adjust this later.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { min: 1000, max: 4000, label: "₹1,000 – ₹4,000", desc: "Great everyday pieces" },
                  { min: 4000, max: 10000, label: "₹4,000 – ₹10,000", desc: "Quality occasion wear" },
                  { min: 10000, max: 25000, label: "₹10,000 – ₹25,000", desc: "Premium collections" },
                  { min: 25000, max: 999999, label: "₹25,000+", desc: "Luxury & bridal" },
                ].map(range => {
                  const selected = answers.budgetMin === range.min;
                  return (
                    <button
                      key={range.min}
                      onClick={() => { setAnswers(a => ({ ...a, budgetMin: range.min, budgetMax: range.max })); nextStep(); }}
                      className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                        selected ? "border-[#8B1A1A] bg-[#8B1A1A]/5" : "border-[#EDE5D8] bg-white hover:border-[#8B1A1A]"
                      }`}
                    >
                      <div className="font-semibold text-[#2C2C2C] mb-1">{range.label}</div>
                      <div className="text-xs text-[#8A8A8A]">{range.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-2">Where are you based?</h2>
              <p className="text-[#4A4A4A] mb-8">We&apos;ll show brands that ship to you and convert prices.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {COUNTRIES.map(country => {
                  const selected = answers.country === country.code;
                  return (
                    <button
                      key={country.code}
                      onClick={() => { setAnswers(a => ({ ...a, country: country.code })); }}
                      className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-sm ${
                        selected ? "border-[#8B1A1A] bg-[#8B1A1A]/5" : "border-[#EDE5D8] bg-white hover:border-[#8B1A1A]"
                      }`}
                    >
                      <div className="font-semibold text-[#2C2C2C] text-sm">{country.label}</div>
                      <div className="text-xs text-[#8A8A8A]">{country.currency}</div>
                    </button>
                  );
                })}
              </div>
              <button
                onClick={finish}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-[#8B1A1A] text-white py-4 rounded-full font-semibold hover:bg-[#A52929] transition-colors"
              >
                Meet Priya, Your Stylist ✨
              </button>
            </div>
          )}

          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="mt-6 flex items-center gap-1.5 text-sm text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
