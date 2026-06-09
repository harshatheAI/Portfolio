import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2C2C2C] flex items-center gap-3">
              <Heart size={28} className="text-[#8B1A1A]" />
              My Wishlist
            </h1>
            <p className="text-[#4A4A4A] mt-1 text-sm">Pieces you&apos;ve saved for later</p>
          </div>
        </div>

        <div className="text-center py-20">
          <div className="text-6xl mb-4">💝</div>
          <h3 className="font-serif text-xl font-bold text-[#2C2C2C] mb-2">Your wishlist is empty</h3>
          <p className="text-[#4A4A4A] mb-6 max-w-sm mx-auto">
            Browse our collection and save pieces you love by tapping the heart icon on any product.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 bg-[#8B1A1A] text-white px-6 py-3 rounded-full font-medium"
            >
              <ShoppingBag size={16} /> Browse Products
            </Link>
            <Link
              href="/stylist"
              className="inline-flex items-center gap-2 border border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-full font-medium hover:bg-[#8B1A1A] hover:text-white transition-colors"
            >
              Ask Priya for suggestions
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
