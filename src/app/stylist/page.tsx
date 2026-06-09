import { Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import StylistChat from "@/components/stylist/StylistChat";

export default async function StylistPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex flex-col h-screen bg-white">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Priya intro */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 bg-[#2C2C2C] text-white p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full bg-[#8B1A1A] flex items-center justify-center text-2xl font-bold font-serif">
              P
            </div>
            <div>
              <div className="font-serif text-xl font-bold">Priya</div>
              <div className="text-white/60 text-sm">Your AI Ethnic Stylist</div>
            </div>
          </div>

          <p className="text-white/70 text-sm leading-relaxed mb-8">
            I specialise in Indian ethnic fashion for the global diaspora. I know the difference between a Banarasi and a Kanjivaram, and I understand the NRI wardrobe challenge — from sizing conversions to travel-friendly fabrics.
          </p>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-sm font-semibold text-[#D4A843] mb-2">I can help with:</h3>
              <ul className="space-y-1.5 text-sm text-white/70">
                <li>🪔 Festival looks (Diwali, Navratri, Eid)</li>
                <li>💍 Wedding guest outfits abroad</li>
                <li>👰 Bridal & bridal party styling</li>
                <li>💼 Ethnic office wear</li>
                <li>👨 Men&apos;s ethnic — kurtas & sherwanis</li>
                <li>👧 Kids&apos; ethnic occasion wear</li>
                <li>⚜️ Finding GI-certified authentic crafts</li>
              </ul>
            </div>

            <div className="p-4 bg-white/5 rounded-xl">
              <h3 className="text-sm font-semibold text-[#D4A843] mb-2">Tell me:</h3>
              <ul className="space-y-1.5 text-sm text-white/70">
                <li>📅 The occasion & date</li>
                <li>📍 Where you&apos;re based</li>
                <li>💰 Your budget in INR</li>
                <li>👗 Your size preference</li>
              </ul>
            </div>
          </div>

          <div className="mt-auto">
            <div className="text-xs text-white/40 flex items-center gap-2">
              <Sparkles size={12} />
              Powered by Claude AI
            </div>
          </div>
        </aside>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[#EDE5D8] bg-white">
            <div className="w-9 h-9 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-sm font-bold font-serif">P</div>
            <div>
              <div className="font-semibold text-[#2C2C2C] text-sm">Priya</div>
              <div className="text-xs text-green-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                Online
              </div>
            </div>
          </div>

          <StylistChat initialProduct={params.product} />
        </div>
      </div>
    </div>
  );
}
