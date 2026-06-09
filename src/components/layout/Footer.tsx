import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#2C2C2C] text-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="font-serif text-2xl font-bold text-white">Drape</span>
              <span className="text-xs text-[#D4A843] tracking-widest uppercase">ethnic</span>
            </div>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              Your personal AI stylist for Indian ethnic fashion. Curating the finest from India&apos;s top artisan brands — for the Indian heart, wherever it lives.
            </p>
            <div className="mt-4 text-xs text-[#D4A843]">
              🇮🇳 Celebrating India&apos;s 650+ GI-tagged craft traditions
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/discover?category=saree" className="hover:text-white transition-colors">Sarees</Link></li>
              <li><Link href="/discover?category=lehenga" className="hover:text-white transition-colors">Lehengas</Link></li>
              <li><Link href="/discover?category=kurta" className="hover:text-white transition-colors">Kurtas</Link></li>
              <li><Link href="/discover?category=sherwani" className="hover:text-white transition-colors">Sherwanis</Link></li>
              <li><Link href="/discover?gi=true" className="hover:text-[#D4A843] transition-colors">GI Certified</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Experience</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/stylist" className="hover:text-white transition-colors">AI Stylist</Link></li>
              <li><Link href="/occasions" className="hover:text-white transition-colors">Occasion Planner</Link></li>
              <li><Link href="/brands" className="hover:text-white transition-colors">Brand Stories</Link></li>
              <li><Link href="/wishlist" className="hover:text-white transition-colors">My Wishlist</Link></li>
              <li><Link href="/onboarding/style-quiz" className="hover:text-white transition-colors">Style Quiz</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© 2026 Drape. All rights reserved.</p>
          <p>All purchases redirect to the brand&apos;s own checkout. Drape earns affiliate commissions.</p>
        </div>
      </div>
    </footer>
  );
}
