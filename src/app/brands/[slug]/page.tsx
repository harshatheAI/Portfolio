import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Globe } from "lucide-react";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import type { Product, Brand } from "@/generated/prisma/client";

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      products: {
        where: { inStock: true },
        orderBy: { createdAt: "desc" },
        include: { brand: true },
      },
    },
  });

  if (!brand) notFound();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Brand hero */}
      <section className="bg-gradient-to-br from-[#2C2C2C] to-[#8B1A1A] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/brands" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors">
            <ArrowLeft size={16} /> All Brands
          </Link>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold font-serif shrink-0">
              {brand.name[0]}
            </div>
            <div>
              <h1 className="font-serif text-4xl font-bold mb-2">{brand.name}</h1>
              <p className="text-white/70 max-w-xl leading-relaxed">{brand.story || brand.description}</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-white/60">
                  <Globe size={14} />
                  Ships to: {brand.shippingCountries.split(",").join(", ")}
                </span>
                <span className="text-white/60">{brand.products.length} products</span>
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#D4A843] hover:underline"
                >
                  Visit {brand.name} <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-6">{brand.products.length} Products from {brand.name}</h2>
        {brand.products.length === 0 ? (
          <div className="text-center py-16 text-[#8A8A8A]">
            <p>Products coming soon from {brand.name}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {brand.products.map((product) => (
              <ProductCard key={product.id} product={product as Product & { brand: Brand }} showBrand={false} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
