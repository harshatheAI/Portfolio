"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Heart, User, Sparkles, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#EDE5D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl font-bold text-[#8B1A1A]">Drape</span>
            <span className="hidden sm:inline text-xs text-[#D4A843] font-medium tracking-widest uppercase mt-1">
              ethnic
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/discover" className="text-sm font-medium text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors">
              Discover
            </Link>
            <Link href="/brands" className="text-sm font-medium text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors">
              Brands
            </Link>
            <Link href="/occasions" className="text-sm font-medium text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors">
              Occasions
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/stylist"
              className="hidden sm:flex items-center gap-1.5 bg-[#8B1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#A52929] transition-colors"
            >
              <Sparkles size={14} />
              Ask Priya
            </Link>
            <Link href="/discover?search=true" className="p-2 text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors">
              <Search size={20} />
            </Link>
            <Link href="/wishlist" className="p-2 text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors">
              <Heart size={20} />
            </Link>
            <Link href="/sign-in" className="p-2 text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors">
              <User size={20} />
            </Link>
            <button
              className="md:hidden p-2 text-[#4A4A4A]"
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#EDE5D8] bg-white px-4 py-4 space-y-3">
          <Link href="/discover" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Discover</Link>
          <Link href="/brands" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Brands</Link>
          <Link href="/occasions" className="block text-sm font-medium py-2" onClick={() => setOpen(false)}>Occasions</Link>
          <Link href="/stylist" className="block text-sm font-medium py-2 text-[#8B1A1A]" onClick={() => setOpen(false)}>✨ Ask Priya</Link>
        </div>
      )}
    </header>
  );
}
