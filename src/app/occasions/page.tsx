"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Sparkles, Calendar, MapPin, IndianRupee, Trash2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { OCCASIONS } from "@/lib/constants";

const OCCASION_TYPES = [
  { slug: "WEDDING", label: "Wedding", emoji: "💍" },
  { slug: "FESTIVAL", label: "Festival", emoji: "🢮" },
  { slug: "BIRTHDAY", label: "Birthday", emoji: "🎂" },
  { slug: "OFFICE", label: "Office / Work", emoji: "💼" },
  { slug: "CASUAL", label: "Casual", emoji: "☀️" },
  { slug: "OTHER", label: "Other", emoji: "✨" },
];

interface Occasion {
  id: string;
  name: string;
  type: string;
  date?: string;
  role?: string;
  budgetMax?: number;
  location?: string;
}

export default function OccasionsPage() {
  const [occasions, setOccasions] = useState<Occasion[]>([
    {
      id: "1",
      name: "Priya's Wedding",
      type: "WEDDING",
      date: "2026-08-15",
      role: "Wedding Guest",
      budgetMax: 12000,
      location: "New York, USA",
    },
    {
      id: "2",
      name: "Diwali Party",
      type: "FESTIVAL",
      date: "2026-10-20",
      budgetMax: 5000,
      location: "London, UK",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "WEDDING",
    date: "",
    role: "",
    budgetMax: "",
    location: "",
  });

  function addOccasion() {
    if (!form.name) return;
    setOccasions(prev => [...prev, {
      id: Date.now().toString(),
      name: form.name,
      type: form.type,
      date: form.date || undefined,
      role: form.role || undefined,
      budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      location: form.location || undefined,
    }]);
    setShowModal(false);
    setForm({ name: "", type: "WEDDING", date: "", role: "", budgetMax: "", location: "" });
  }

  function getOccasionStylistPrompt(occ: Occasion) {
    const parts = [`I need outfit help for ${occ.name}`];
    if (occ.type) parts.push(`It's a ${occ.type.toLowerCase()}`);
    if (occ.role) parts.push(`I'll be the ${occ.role}`);
    if (occ.date) parts.push(`on ${new Date(occ.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`);
    if (occ.location) parts.push(`in ${occ.location}`);
    if (occ.budgetMax) parts.push(`Budget: ₹${occ.budgetMax.toLocaleString("en-IN")}`);
    return encodeURIComponent(parts.join(". "));
  }

  const typeEmoji: Record<string, string> = {
    WEDDING: "💍", FESTIVAL: "🢮", BIRTHDAY: "🎂", OFFICE: "💼", CASUAL: "☀️", OTHER: "✨",
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2C2C2C]">My Occasions</h1>
            <p className="text-[#4A4A4A] mt-1 text-sm">Plan your ethnic wardrobe for every celebration</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#8B1A1A] text-white px-4 py-2.5 rounded-full text-sm font-medium hover:bg-[#A52929] transition-colors"
          >
            <Plus size={16} /> Add Occasion
          </button>
        </div>

        {occasions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="font-serif text-xl font-bold text-[#2C2C2C] mb-2">No occasions yet</h3>
            <p className="text-[#4A4A4A] mb-6">Add an upcoming occasion and Priya will plan your wardrobe.</p>
            <button onClick={() => setShowModal(true)} className="inline-flex items-center gap-2 bg-[#8B1A1A] text-white px-6 py-3 rounded-full font-medium">
              <Plus size={16} /> Add Your First Occasion
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {occasions.map(occ => (
              <div key={occ.id} className="bg-white border border-[#EDE5D8] rounded-2xl p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#F5F0E8] flex items-center justify-center text-2xl shrink-0">
                      {typeEmoji[occ.type] || "✨"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2C2C2C] text-lg">{occ.name}</h3>
                      {occ.role && <div className="text-sm text-[#8B1A1A] font-medium">{occ.role}</div>}
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-[#4A4A4A]">
                        {occ.date && (
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#D4A843]" />
                            {new Date(occ.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                          </span>
                        )}
                        {occ.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#D4A843]" />
                            {occ.location}
                          </span>
                        )}
                        {occ.budgetMax && (
                          <span className="flex items-center gap-1.5">
                            <IndianRupee size={13} className="text-[#D4A843]" />
                            Up to ₹{occ.budgetMax.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setOccasions(prev => prev.filter(o => o.id !== occ.id))}
                    className="p-2 text-[#8A8A8A] hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/stylist?message=${getOccasionStylistPrompt(occ)}`}
                    className="flex items-center gap-2 bg-[#8B1A1A] text-white text-sm px-4 py-2 rounded-full font-medium hover:bg-[#A52929] transition-colors"
                  >
                    <Sparkles size={14} /> Find Outfits with Priya
                  </Link>
                  <Link
                    href={`/discover?occasion=${occ.type.toLowerCase()}`}
                    className="flex items-center gap-2 border border-[#EDE5D8] text-[#4A4A4A] text-sm px-4 py-2 rounded-full hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors"
                  >
                    Browse {occ.type === "WEDDING" ? "Wedding" : occ.type === "FESTIVAL" ? "Festive" : "All"} Wear
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Occasion Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-5">Add Occasion</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Occasion Name*</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Priya's Wedding"
                  className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20 focus:border-[#8B1A1A]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {OCCASION_TYPES.map(t => (
                    <button
                      key={t.slug}
                      onClick={() => setForm(f => ({ ...f, type: t.slug }))}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                        form.type === t.slug ? "border-[#8B1A1A] bg-[#8B1A1A]/5 text-[#8B1A1A]" : "border-[#EDE5D8] hover:border-[#8B1A1A]"
                      }`}
                    >
                      {t.emoji} {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="w-full border border-[#EDE5D8] rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Budget (₹)</label>
                  <input type="number" value={form.budgetMax} onChange={e => setForm(f => ({ ...f, budgetMax: e.target.value }))}
                    placeholder="e.g. 12000"
                    className="w-full border border-[#EDE5D8] rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Your Role</label>
                <input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  placeholder="e.g. Wedding Guest, Bride's Sister"
                  className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#8A8A8A] uppercase tracking-wider mb-1.5">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. New York, USA"
                  className="w-full border border-[#EDE5D8] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#8B1A1A]/20" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-[#EDE5D8] text-[#4A4A4A] py-3 rounded-full font-medium hover:bg-[#F5F0E8] transition-colors">
                Cancel
              </button>
              <button onClick={addOccasion} disabled={!form.name}
                className="flex-1 bg-[#8B1A1A] text-white py-3 rounded-full font-semibold disabled:opacity-40 hover:bg-[#A52929] transition-colors">
                Add Occasion
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
