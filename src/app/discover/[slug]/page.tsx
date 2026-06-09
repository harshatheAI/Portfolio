import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Heart, Sparkles, Package, Globe, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseJsonField, formatINR, formatUSD } from "@/lib/utils";
import { GI_TAGS } from "@/lib/constants";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import type { Product, Brand } from "@/generated/prisma/client";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true },
  });

  if (!product) notFound();

  const images = parseJsonField<string[]>(product.images, []);
  const categories = parseJsonField<string[]>(product.categories, []);
  const occasions = parseJsonField<string[]>(product.occasions, []);
  const giTags = parseJsonField<string[]>(product.giTags, []);
  const sizes = parseJsonField<string[]>(product.sizes, []);
  const colors = parseJsonField<string[]>(product.colors, []);
  const style = parseJsonField<string[]>(product.style, []);

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const similar = await prisma.product.findMany({
    where: {
      brandId: product.brandId,
      id: { not: product.id },
      inStock: true,
    },
    include: { brand: true },
    take: 4,
  });

  const SIZE_GUIDE: Record<string, string> = {
    XS: "UK 6 / US 2",
    S: "UK 8 / US 4",
    M: "UK 10 / US 6",
    L: "UK 12 / US 8",
    XL: "UK 14 / US 10",
    XXL: "UK 16 / US 12",
    "3XL": "UK 18 / US 14",
    "Free Size": "One size fits most",
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/discover" className="inline-flex items-center gap-2 text-sm text-[#4A4A4A] hover:text-[#8B1A1A] mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5F0E8] mb-3">
              <Image
                src={images[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                unoptimized
                priority
              />
              {giTags.length > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="gi-badge text-sm">⚜️ GI Certified</span>
                </div>
              )}
              {discount > 0 && (
                <div className="absolute top-4 right-4">
                  <span className="bg-[#8B1A1A] text-white text-sm font-bold px-3 py-1 rounded-full">-{discount}%</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative aspect-square w-20 rounded-lg overflow-hidden bg-[#F5F0E8] border-2 border-[#EDE5D8] hover:border-[#8B1A1A] cursor-pointer transition-colors">
                    <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="80px" unoptimized />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 text-sm mb-2">
              <Link href={`/brands/${product.brand.slug}`} className="text-[#8B1A1A] font-semibold uppercase tracking-wide hover:underline">
                {product.brand.name}
              </Link>
              <span className="text-[#EDE5D8]">·</span>
              <span className="text-[#8A8A8A] capitalize">{product.gender.toLowerCase()}</span>
              <span className="text-[#EDE5D8]">·</span>
              <span className="text-[#8A8A8A] capitalize">{product.ageGroup.toLowerCase()}</span>
            </div>

            <h1 className="font-serif text-3xl font-bold text-[#2C2C2C] mb-4 leading-tight">{product.name}</h1>

            {/* GI Tags */}
            {giTags.length > 0 && (
              <div className="mb-4 space-y-2">
                {giTags.map((slug) => {
                  const tag = GI_TAGS[slug];
                  if (!tag) return null;
                  return (
                    <div key={slug} className="flex items-start gap-3 p-3 bg-[#D4A843]/8 border border-[#D4A843]/20 rounded-xl">
                      <span className="text-lg">⚜️</span>
                      <div>
                        <div className="text-sm font-semibold text-[#5A3800]">{tag.label} — GI Certified</div>
                        <div className="text-xs text-[#8A8A8A] mt-0.5">{tag.state} · {tag.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pricing */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="font-serif text-3xl font-bold text-[#2C2C2C]">{formatINR(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-[#8A8A8A] line-through">{formatINR(product.comparePrice)}</span>
              )}
            </div>
            <p className="text-sm text-[#8A8A8A] mb-6">≈ {formatUSD(product.price)} · All taxes included</p>

            {product.fabric && (
              <div className="mb-4 flex items-center gap-2 text-sm text-[#4A4A4A]">
                <span className="font-medium">Fabric:</span>
                <span className="bg-[#F5F0E8] px-2.5 py-1 rounded-full">{product.fabric}</span>
              </div>
            )}

            {colors.length > 0 && (
              <div className="mb-4">
                <span className="text-sm font-medium text-[#4A4A4A] mr-2">Colors:</span>
                <div className="inline-flex flex-wrap gap-1.5">
                  {colors.map(c => (
                    <span key={c} className="text-xs bg-[#F5F0E8] px-2.5 py-1 rounded-full capitalize">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-[#4A4A4A]">Available Sizes</span>
                  <button className="text-xs text-[#8B1A1A] underline flex items-center gap-1">
                    <Info size={11} /> Size guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map(s => (
                    <div key={s} className="border border-[#EDE5D8] rounded-lg px-3 py-1.5 text-center group hover:border-[#8B1A1A] cursor-pointer transition-colors">
                      <div className="text-sm font-medium text-[#2C2C2C]">{s}</div>
                      {SIZE_GUIDE[s] && <div className="text-xs text-[#8A8A8A]">{SIZE_GUIDE[s]}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-6">
              {occasions.map(occ => (
                <Link key={occ} href={`/discover?occasion=${occ}`}>
                  <span className="text-xs bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full capitalize hover:bg-rose-100 transition-colors cursor-pointer">{occ}</span>
                </Link>
              ))}
              {style.map(s => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full capitalize">{s}</span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <a
                href={product.affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#8B1A1A] text-white py-4 rounded-full font-semibold text-lg hover:bg-[#A52929] transition-colors shadow-lg shadow-[#8B1A1A]/20"
              >
                Buy on {product.brand.name}
                <ExternalLink size={16} />
              </a>
              <button className="p-4 border-2 border-[#EDE5D8] rounded-full hover:border-[#8B1A1A] hover:text-[#8B1A1A] transition-colors">
                <Heart size={22} />
              </button>
            </div>

            <Link
              href={`/stylist?product=${product.slug}`}
              className="w-full flex items-center justify-center gap-2 border border-[#8B1A1A]/30 text-[#8B1A1A] py-3 rounded-full font-medium hover:bg-[#8B1A1A]/5 transition-colors"
            >
              <Sparkles size={16} />
              Ask Priya about this piece
            </Link>

            <div className="mt-6 p-4 bg-[#F5F0E8] rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                <Globe size={14} className="text-[#D4A843]" />
                <span>Ships to: {product.brand.shippingCountries.replace(/,/g, " · ")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#4A4A4A]">
                <Package size={14} className="text-[#D4A843]" />
                <span>Checkout and payment handled directly by {product.brand.name}</span>
              </div>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="mt-12 max-w-2xl">
            <h2 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-4">About This Piece</h2>
            <div className="ethnic-divider w-16 mb-4" />
            <p className="text-[#4A4A4A] leading-relaxed">{product.description}</p>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-[#2C2C2C] mb-6">More from {product.brand.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similar.map((p) => (
                <ProductCard key={p.id} product={p as Product & { brand: Brand }} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
