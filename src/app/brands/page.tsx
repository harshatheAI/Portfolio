import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight } from "lucide-react";

export default async function BrandsPage() {
  const brands = await prisma.brand.findMany({
    where: { active: true },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-4">Our Brand Partners</h1>
          <p className="text-[#4A4A4A] max-w-xl mx-auto">
            Carefully curated Shopify-native Indian D2C brands — all shipping internationally, all with authentic artisan credentials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="group flex gap-5 p-6 bg-white border border-[#EDE5D8] rounded-2xl hover:border-[#8B1A1A] hover:shadow-lg transition-all"
            >
              <div className="w-16 h-16 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center shrink-0">
                <span className="font-serif font-bold text-2xl text-[#8B1A1A]">{brand.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-serif text-xl font-bold text-[#2C2C2C] group-hover:text-[#8B1A1A] transition-colors">{brand.name}</h2>
                  <ArrowRight size={16} className="text-[#8A8A8A] group-hover:text-[#8B1A1A] mt-1 shrink-0 transition-colors" />
                </div>
                <p className="text-sm text-[#4A4A4A] mt-1 line-clamp-2">{brand.description}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-[#8A8A8A]">
                  <span>{brand._count.products} products</span>
                  <span>·</span>
                  <span>Ships to: {brand.shippingCountries.split(",").join(" · ")}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
