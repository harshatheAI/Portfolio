"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIES, OCCASIONS, BRANDS } from "@/lib/constants";
import { SlidersHorizontal, X } from "lucide-react";

const PRICE_RANGES = [
  { label: "Under ₹3,000", min: 0, max: 3000 },
  { label: "₹3,000 – ₹8,000", min: 3000, max: 8000 },
  { label: "₹8,000 – ₹20,000", min: 8000, max: 20000 },
  { label: "₹20,000+", min: 20000, max: 999999 },
];

export default function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/discover?${params.toString()}`);
  }, [router, searchParams]);

  const clearAll = useCallback(() => {
    router.push("/discover");
  }, [router]);

  const hasFilters = Array.from(searchParams.keys()).some(k => k !== "page");

  const active = {
    category: searchParams.get("category"),
    occasion: searchParams.get("occasion"),
    brand: searchParams.get("brand"),
    gender: searchParams.get("gender"),
    ageGroup: searchParams.get("ageGroup"),
    gi: searchParams.get("gi"),
    priceMin: searchParams.get("priceMin"),
    priceMax: searchParams.get("priceMax"),
  };

  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="sticky top-24">
        <div className="flex items-center justify-between mb-4">
          <h3 className="flex items-center gap-2 font-semibold text-[#2C2C2C]">
            <SlidersHorizontal size={16} />
            Filters
          </h3>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-[#8B1A1A] hover:underline flex items-center gap-1">
              <X size={12} /> Clear all
            </button>
          )}
        </div>

        {/* GI Only */}
        <div className="mb-6">
          <button
            onClick={() => updateFilter("gi", "true")}
            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
              active.gi === "true"
                ? "bg-[#D4A843]/10 border-[#D4A843] text-[#5A3800]"
                : "border-[#EDE5D8] hover:border-[#D4A843] text-[#4A4A4A]"
            }`}
          >
            ⚜️ GI Certified Only
          </button>
        </div>

        {/* Gender */}
        <FilterSection title="Gender">
          {["WOMEN", "MEN", "UNISEX"].map(g => (
            <FilterChip
              key={g}
              label={g === "WOMEN" ? "Women" : g === "MEN" ? "Men" : "Unisex"}
              active={active.gender === g}
              onClick={() => updateFilter("gender", g)}
            />
          ))}
        </FilterSection>

        {/* Age Group */}
        <FilterSection title="Age Group">
          {["ADULT", "TEEN", "KIDS"].map(a => (
            <FilterChip
              key={a}
              label={a === "ADULT" ? "Adults" : a === "TEEN" ? "Teens" : "Kids"}
              active={active.ageGroup === a}
              onClick={() => updateFilter("ageGroup", a)}
            />
          ))}
        </FilterSection>

        {/* Category */}
        <FilterSection title="Category">
          {CATEGORIES.map(cat => (
            <FilterChip
              key={cat.slug}
              label={cat.label}
              active={active.category === cat.slug}
              onClick={() => updateFilter("category", cat.slug)}
            />
          ))}
        </FilterSection>

        {/* Occasion */}
        <FilterSection title="Occasion">
          {OCCASIONS.map(occ => (
            <FilterChip
              key={occ.slug}
              label={`${occ.icon} ${occ.label}`}
              active={active.occasion === occ.slug}
              onClick={() => updateFilter("occasion", occ.slug)}
            />
          ))}
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price">
          {PRICE_RANGES.map(p => (
            <FilterChip
              key={p.label}
              label={p.label}
              active={active.priceMin === String(p.min) && active.priceMax === String(p.max)}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                const isActive = params.get("priceMin") === String(p.min);
                if (isActive) {
                  params.delete("priceMin");
                  params.delete("priceMax");
                } else {
                  params.set("priceMin", String(p.min));
                  params.set("priceMax", String(p.max));
                }
                router.push(`/discover?${params.toString()}`);
              }}
            />
          ))}
        </FilterSection>

        {/* Brand */}
        <FilterSection title="Brand">
          {BRANDS.map(b => (
            <FilterChip
              key={b.slug}
              label={b.name}
              active={active.brand === b.slug}
              onClick={() => updateFilter("brand", b.slug)}
            />
          ))}
        </FilterSection>
      </div>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8A8A8A] mb-2.5">{title}</h4>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-[#8B1A1A] text-white border-[#8B1A1A]"
          : "border-[#EDE5D8] text-[#4A4A4A] hover:border-[#8B1A1A] hover:text-[#8B1A1A]"
      }`}
    >
      {label}
    </button>
  );
}
