import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Star, ShieldCheck, Globe, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";
import { GI_TAGS, OCCASIONS } from "@/lib/constants";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { inStock: true },
    include: { brand: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
}

async function getBrands() {
  return prisma.brand.findMany({ where: { active: true }, take: 10 });
}

export default async function HomePage() {
  const [featuredProducts, brands] = await Promise.all([getFeaturedProducts(), getBrands()]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#F5F0E8]">
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ethnic-bg" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="4" fill="#8B1A1A"/>
                <path d="M0 30 Q15 15 30 30 Q45 45 60 30" stroke="#D4A843" strokeWidth="1" fill="none"/>
                <path d="M30 0 Q45 15 30 30 Q15 45 30 60" stroke="#D4A843" strokeWidth="1" fill="none"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ethnic-bg)"/>
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-[#D4A843]/30 px-4 py-2 rounded-full text-sm text-[#8B1A1A] font-medium mb-6">
                <Sparkles size={14} className="text-[#D4A843]" />
                AI-powered personal stylist for Indians abroad
              </div>

              <h1 className="font-serif text-5xl lg:text-6xl font-bold text-[#2C2C2C] leading-tight mb-6">
                Your Indian
                <br />
                <span className="gradient-text">ethnic wardrobe,</span>
                <br />
                curated for you
              </h1>

              <p className="text-lg text-[#4A4A4A] leading-relaxed mb-8 max-w-md">
                Shop sarees, lehengas, kurtas &amp; more from India&apos;s top artisan brands — with Priya, your AI stylist, guiding every look.
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {OCCASIONS.slice(0, 6).map((occ) => (
                  <Link
                    key={occ.slug}
                    href={`/discover?occasion=${occ.slug}`}
                    className="flex items-center gap-1.5 bg-white border border-[#EDE5D8] hover:border-[#8B1A1A] text-sm px-3 py-1.5 rounded-full transition-colors hover:text-[#8B1A1A]"
                  >
                    <span>{occ.icon}</span>
                    <span>{occ.label}</span>
                  </Link>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/stylist"
                  className="flex items-center gap-2 bg-[#8B1A1A] text-white px-6 py-3 rounded-full font-medium hover:bg-[#A52929] transition-colors shadow-lg shadow-[#8B1A1A]/20"
                >
                  <Sparkles size={16} />
                  Chat with Priya
                </Link>
                <Link
                  href="/discover"
                  className="flex items-center gap-2 border-2 border-[#8B1A1A] text-[#8B1A1A] px-6 py-3 rounded-full font-medium hover:bg-[#8B1A1A] hover:text-white transition-colors"
                >
                  Browse All
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:grid grid-cols-2 gap-3">
              {featuredProducts.slice(0, 4).map((product, i) => {
                const images = parseJsonField<string[]>(product.images, []);
                const giTags = parseJsonField<string[]>(product.giTags, []);
                const heights = ["aspect-square", "aspect-[3/4]", "aspect-[4/3]", "aspect-[3/4]"];
                return (
                  <Link
                    key={product.id}
                    href={`/discover/${product.slug}`}
                    className={`relative rounded-2xl overflow-hidden group ${heights[i]}`}
                  >
                    <Image
                      src={images[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="250px"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {giTags.length > 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="gi-badge">⚜️ GI</span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#8B1A1A] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { n: "10", label: "Artisan Brands" },
              { n: "32+", label: "Curated Products" },
              { n: "24", label: "GI Craft Tags" },
              { n: "6+", label: "Countries Served" },
            ].map(({ n, label }) => (
              <div key={label}>
                <div className="font-serif text-3xl font-bold text-[#D4A843]">{n}</div>
                <div className="text-sm text-white/70 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-4">Your Personal Stylist, Always On</h2>
            <p className="text-[#4A4A4A] max-w-xl mx-auto">Three steps to finding the perfect Indian outfit, wherever you are in the world.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "✨", title: "Take the Style Quiz", desc: "Tell Priya your occasions, style preferences, and budget. 2 minutes.", link: "/onboarding/style-quiz", cta: "Start Quiz" },
              { step: "02", icon: "💬", title: "Chat with Priya", desc: "Your AI stylist who understands Indian occasions, international weather & global sizing.", link: "/stylist", cta: "Meet Priya" },
              { step: "03", icon: "🛍️", title: "Shop with Confidence", desc: "Click through to the brand directly. Real artisans, authentic pieces, international shipping.", link: "/discover", cta: "Browse Now" },
            ].map(({ step, icon, title, desc, link, cta }) => (
              <div key={step} className="relative bg-[#F5F0E8] rounded-2xl p-8 hover:shadow-lg transition-shadow">
                <div className="font-serif text-7xl font-bold text-[#EDE5D8] absolute top-4 right-6 leading-none select-none">{step}</div>
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-serif text-xl font-bold text-[#2C2C2C] mb-3">{title}</h3>
                <p className="text-[#4A4A4A] text-sm leading-relaxed mb-5">{desc}</p>
                <Link href={link} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8B1A1A] hover:gap-2.5 transition-all">
                  {cta} <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-[#F5F0E8]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-3">New Arrivals</h2>
              <div className="ethnic-divider w-24" />
            </div>
            <Link href="/discover" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#8B1A1A] hover:underline">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => {
              const images = parseJsonField<string[]>(product.images, []);
              const giTags = parseJsonField<string[]>(product.giTags, []);
              const discount = product.comparePrice
                ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
                : 0;
              return (
                <Link key={product.id} href={`/discover/${product.slug}`} className="group bg-white rounded-xl overflow-hidden product-hover shadow-sm border border-[#EDE5D8]/60">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F0E8]">
                    <Image
                      src={images[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="300px"
                      unoptimized
                    />
                    <div className="absolute top-2 left-2 flex gap-1.5">
                      {giTags.length > 0 && <span className="gi-badge">⚜️ GI</span>}
                      {discount > 0 && <span className="bg-[#8B1A1A] text-white text-xs font-bold px-2 py-0.5 rounded-full">-{discount}%</span>}
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-[#8B1A1A] font-semibold uppercase tracking-wide mb-1">{product.brand.name}</div>
                    <h3 className="text-sm font-medium text-[#2C2C2C] line-clamp-2 leading-snug">{product.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="font-semibold text-sm">₹{product.price.toLocaleString("en-IN")}</span>
                      {product.comparePrice && <span className="text-xs text-[#8A8A8A] line-through">₹{product.comparePrice.toLocaleString("en-IN")}</span>}
                    </div>
                    {giTags.length > 0 && <div className="mt-1 text-xs text-[#D4A843]">{GI_TAGS[giTags[0]]?.label}</div>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* GI feature */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="gi-badge mb-6 inline-flex text-sm">⚜️ GI Certified Crafts</div>
              <h2 className="font-serif text-4xl font-bold text-[#2C2C2C] mb-4">India&apos;s Geographical Indication Heritage</h2>
              <p className="text-[#4A4A4A] leading-relaxed mb-6">
                We tag every product with its official GI (Geographical Indication) certification — India&apos;s government-registered mark of authentic regional craft.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(GI_TAGS).slice(0, 6).map(([slug, tag]) => (
                  <Link key={slug} href={`/discover?gi=${slug}`} className="flex items-start gap-2 p-3 bg-[#F5F0E8] rounded-lg hover:bg-[#EDE5D8] transition-colors group">
                    <span className="text-[#D4A843] mt-0.5">⚜️</span>
                    <div>
                      <div className="text-xs font-semibold text-[#2C2C2C] group-hover:text-[#8B1A1A]">{tag.label}</div>
                      <div className="text-xs text-[#8A8A8A]">{tag.state}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/discover?gi=true" className="mt-6 inline-flex items-center gap-2 text-[#8B1A1A] font-medium hover:underline">
                Explore all GI crafts <ArrowRight size={14} />
              </Link>
            </div>
            <div className="bg-gradient-to-br from-[#8B1A1A] to-[#2C2C2C] rounded-3xl p-8 text-white">
              <div className="font-serif text-2xl font-bold mb-2">24 GI Craft Tags</div>
              <p className="text-white/70 text-sm mb-6">Every piece tagged with its certified regional origin</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(GI_TAGS).slice(0, 12).map(([slug, tag]) => (
                  <span key={slug} className="text-xs px-2.5 py-1 bg-white/10 rounded-full text-white/80">{tag.label}</span>
                ))}
                <span className="text-xs px-2.5 py-1 bg-[#D4A843]/20 rounded-full text-[#D4A843]">+12 more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand strip */}
      <section className="py-16 bg-[#F5F0E8]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-[#2C2C2C] mb-10">Curated from India&apos;s Best</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link key={brand.id} href={`/brands/${brand.slug}`} className="flex flex-col items-center justify-center bg-white border border-[#EDE5D8] rounded-xl p-5 hover:border-[#8B1A1A] hover:shadow-md transition-all group text-center">
                <div className="w-10 h-10 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center mb-3">
                  <span className="text-[#8B1A1A] font-serif font-bold text-lg">{brand.name[0]}</span>
                </div>
                <span className="text-xs font-semibold text-[#2C2C2C] group-hover:text-[#8B1A1A] transition-colors">{brand.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AI Stylist CTA */}
      <section className="py-20 bg-[#2C2C2C]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-6">👗</div>
          <h2 className="font-serif text-4xl lg:text-5xl font-bold text-white mb-4">Meet Priya, Your AI Stylist</h2>
          <p className="text-white/70 text-lg mb-8 leading-relaxed">
            Tell her about your upcoming Indian wedding in Houston, Diwali in London, or everyday life in Toronto. She&apos;ll find the perfect outfit with cultural context and sizing guidance.
          </p>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left max-w-lg mx-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#8B1A1A] flex items-center justify-center text-white text-xs font-bold shrink-0">P</div>
              <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-white/90 text-sm">
                Hi! I&apos;m Priya 👋 Tell me about your occasion — what are you shopping for today?
              </div>
            </div>
            <div className="flex items-start gap-3 justify-end">
              <div className="bg-[#8B1A1A] rounded-2xl rounded-tr-sm px-4 py-2.5 text-white text-sm max-w-xs">
                My cousin&apos;s wedding in New York next month — I need a lehenga under ₹12,000 that can travel well 💫
              </div>
            </div>
          </div>
          <Link href="/stylist" className="inline-flex items-center gap-2 bg-[#D4A843] text-[#2C2C2C] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#E8C870] transition-colors">
            <Sparkles size={20} />
            Start Chatting with Priya
          </Link>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-white border-t border-[#EDE5D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Globe size={22} />, title: "Ships Worldwide", desc: "US, UK, UAE, CA, AU & more" },
              { icon: <ShieldCheck size={22} />, title: "Verified Artisans", desc: "GI-certified craft brands" },
              { icon: <Heart size={22} />, title: "Secure Checkout", desc: "Direct on brand websites" },
              { icon: <Star size={22} />, title: "100% Authentic", desc: "Official brand products" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="text-[#D4A843] shrink-0 mt-0.5">{icon}</div>
                <div>
                  <div className="font-semibold text-sm text-[#2C2C2C]">{title}</div>
                  <div className="text-xs text-[#8A8A8A]">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-[#F5F0E8]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-[#2C2C2C] text-center mb-10">From Our Community</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { text: "Priya helped me find the perfect Kanjivaram saree for my friend's wedding in San Jose. She even explained how to coordinate the blouse colour!", name: "Deepika M.", location: "San Jose, CA", emoji: "🇺🇸" },
              { text: "Finally a platform that understands NRI needs. I love the GI tag filter — found a genuine Lucknow chikankari kurta for Eid in 5 minutes.", name: "Zara K.", location: "London, UK", emoji: "🇬🇧" },
              { text: "The occasion planner is genius. Priya planned my entire wardrobe for a 10-day India trip with 3 weddings. The styling advice was spot on!", name: "Ananya S.", location: "Dubai, UAE", emoji: "🇦🇪" },
            ].map(({ text, name, location, emoji }) => (
              <div key={name} className="bg-white rounded-2xl p-6 shadow-sm border border-[#EDE5D8]">
                <div className="flex gap-1 text-[#D4A843] mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-[#4A4A4A] text-sm leading-relaxed mb-4">&ldquo;{text}&rdquo;</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#8B1A1A]/10 flex items-center justify-center font-serif font-bold text-[#8B1A1A] text-sm">
                    {name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#2C2C2C]">{name}</div>
                    <div className="text-xs text-[#8A8A8A]">{emoji} {location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
