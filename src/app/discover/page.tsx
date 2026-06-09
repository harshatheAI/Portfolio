import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";
import { GI_TAGS } from "@/lib/constants";
import FilterBar from "@/components/catalog/FilterBar";
import ProductCard from "@/components/catalog/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import type { Product, Brand } from "@/generated/prisma/client";

interface SearchParams {
  category?: string;
  occasion?: string;
  brand?: string;
  gender?: string;
  ageGroup?: string;
  gi?: string;
  priceMin?: string;
  priceMax?: string;
  q?: string;
  page?: string;
}

async function getProducts(params: SearchParams) {
  const where: Record<string, unknown> = { inStock: true };

  if (params.gender) where.gender = params.gender;
  if (params.ageGroup) where.ageGroup = params.ageGroup;
  if (params.brand) {
    const brand = await prisma.brand.findUnique({ where: { slug: params.brand } });
    if (brand) where.brandId = brand.id;
  }
  if (params.priceMin || params.priceMax) {
    where.price = {
      gte: params.priceMin ? Number(params.priceMin) : undefined,
      lte: params.priceMax ? Number(params.priceMax) : undefined,
    };
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }

  const allProducts = await prisma.product.findMany({
    where,
    include: { brand: true },
    orderBy: { createdAt: "desc" },
  });

  // In-memory filtering for JSON array fields
  return allProducts.filter((p) => {
    const cats = parseJsonField<string[]>(p.categories, []);
    const occs = parseJsonField<string[]>(p.occasions, []);
    const gis = parseJsonField<string[]>(p.giTags, []);

    if (params.category && !cats.includes(params.category)) return false;
    if (params.occasion && !occs.includes(params.occasion)) return false;
    if (params.gi && params.gi !== "true" && !gis.includes(params.gi)) return false;
    if (params.gi === "true" && gis.length === 0) return false;
    return true;
  });
}

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const products = await getProducts(params);

  const activeGiSlug = params.gi && params.gi !== "true" ? params.gi : null;
  const activeGiTag = activeGiSlug ? GI_TAGS[activeGiSlug] : null;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2C2C2C]">
            {activeGiTag ? `${activeGiTag.label} Collection` :
             params.occasion ? `${params.occasion.charAt(0).toUpperCase() + params.occasion.slice(1)} Wear` :
             params.category ? `${params.category.charAt(0).toUpperCase() + params.category.slice(1)}s` :
             "All Products"}
          </h1>
          {activeGiTag && (
            <p className="mt-2 text-sm text-[#4A4A4A] max-w-lg">{activeGiTag.desc}</p>
          )}
          <p className="text-sm text-[#8A8A8A] mt-1">{products.length} results</p>
        </div>

        <div className="flex gap-8">
          <Suspense fallback={<div className="w-60 shrink-0" />}>
            <FilterBar />
          </Suspense>

          <main className="flex-1 min-w-0">
            {products.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-serif text-xl font-bold text-[#2C2C2C] mb-2">No products found</h3>
                <p className="text-[#4A4A4A] mb-6">Try adjusting your filters, or let Priya help you find what you&apos;re looking for.</p>
                <Link href="/stylist" className="inline-flex items-center gap-2 bg-[#8B1A1A] text-white px-6 py-3 rounded-full font-medium">
                  <Sparkles size={16} /> Ask Priya
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product as Product & { brand: Brand }} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
