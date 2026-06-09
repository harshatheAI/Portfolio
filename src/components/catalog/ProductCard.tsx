"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Sparkles, ExternalLink } from "lucide-react";
import { formatINR, formatUSD, parseJsonField } from "@/lib/utils";
import { GI_TAGS } from "@/lib/constants";
import { useState } from "react";
import type { Product, Brand } from "@/generated/prisma/client";

type ProductWithBrand = Product & { brand: Brand };

interface ProductCardProps {
  product: ProductWithBrand;
  showBrand?: boolean;
}

const OCCASION_COLORS: Record<string, string> = {
  wedding: "bg-rose-50 text-rose-700",
  festive: "bg-amber-50 text-amber-700",
  bridal: "bg-pink-50 text-pink-700",
  casual: "bg-green-50 text-green-700",
  office: "bg-blue-50 text-blue-700",
  party: "bg-purple-50 text-purple-700",
  diwali: "bg-orange-50 text-orange-700",
  eid: "bg-teal-50 text-teal-700",
  sangeet: "bg-violet-50 text-violet-700",
  navratri: "bg-red-50 text-red-700",
  haldi: "bg-yellow-50 text-yellow-700",
};

export default function ProductCard({ product, showBrand = true }: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const images = parseJsonField<string[]>(product.images, []);
  const occasions = parseJsonField<string[]>(product.occasions, []);
  const giTags = parseJsonField<string[]>(product.giTags, []);
  const firstImage = images[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600";
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl overflow-hidden product-hover shadow-sm border border-[#EDE5D8]/60">
      {/* Image */}
      <Link href={`/discover/${product.slug}`} className="block relative overflow-hidden aspect-[3/4] bg-[#F5F0E8]">
        <Image
          src={firstImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          unoptimized
        />

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {giTags.length > 0 && (
            <span className="gi-badge">⚜️ GI</span>
          )}
          {discount > 0 && (
            <span className="bg-[#8B1A1A] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
            className={`p-2 rounded-full shadow-md transition-colors ${wishlisted ? "bg-[#8B1A1A] text-white" : "bg-white text-[#4A4A4A] hover:text-[#8B1A1A]"}`}
          >
            <Heart size={16} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <Link
            href={`/stylist?product=${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-white rounded-full shadow-md text-[#4A4A4A] hover:text-[#8B1A1A] transition-colors"
          >
            <Sparkles size={16} />
          </Link>
        </div>

        {/* Occasion tag - bottom overlay on hover */}
        {occasions.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-wrap gap-1">
              {occasions.slice(0, 2).map((occ) => (
                <span
                  key={occ}
                  className="text-xs text-white/90 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full capitalize"
                >
                  {occ}
                </span>
              ))}
            </div>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        {showBrand && (
          <div className="text-xs text-[#8B1A1A] font-semibold uppercase tracking-wide mb-1">
            {product.brand.name}
          </div>
        )}
        <Link href={`/discover/${product.slug}`}>
          <h3 className="text-sm font-medium text-[#2C2C2C] leading-snug line-clamp-2 hover:text-[#8B1A1A] transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#2C2C2C]">{formatINR(product.price)}</span>
            <span className="ml-1 text-xs text-[#8A8A8A]">({formatUSD(product.price)})</span>
            {product.comparePrice && (
              <div className="text-xs text-[#8A8A8A] line-through">{formatINR(product.comparePrice)}</div>
            )}
          </div>

          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-[#8B1A1A] border border-[#8B1A1A]/30 px-2.5 py-1.5 rounded-full hover:bg-[#8B1A1A] hover:text-white transition-colors"
          >
            Buy <ExternalLink size={11} />
          </a>
        </div>

        {/* GI tag detail */}
        {giTags.length > 0 && (
          <div className="mt-2 text-xs text-[#D4A843] font-medium">
            {GI_TAGS[giTags[0]]?.label}
          </div>
        )}
      </div>
    </div>
  );
}
