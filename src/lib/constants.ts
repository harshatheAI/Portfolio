export const CATEGORIES = [
  { slug: "saree", label: "Sarees" },
  { slug: "lehenga", label: "Lehengas" },
  { slug: "kurta", label: "Kurtas & Suits" },
  { slug: "sherwani", label: "Sherwanis" },
  { slug: "salwar-kameez", label: "Salwar Kameez" },
  { slug: "anarkali", label: "Anarkalis" },
  { slug: "indo-western", label: "Indo-Western" },
  { slug: "dupatta", label: "Dupattas & Stoles" },
  { slug: "blouse", label: "Blouses" },
  { slug: "kurti", label: "Kurtis" },
] as const;

export const OCCASIONS = [
  { slug: "wedding", label: "Wedding", icon: "💍" },
  { slug: "festive", label: "Festive", icon: "🢮" },
  { slug: "diwali", label: "Diwali", icon: "🢮" },
  { slug: "eid", label: "Eid", icon: "🌙" },
  { slug: "navratri", label: "Navratri", icon: "💃" },
  { slug: "bridal", label: "Bridal", icon: "👰" },
  { slug: "sangeet", label: "Sangeet", icon: "🎶" },
  { slug: "haldi", label: "Haldi", icon: "🌼" },
  { slug: "mehendi", label: "Mehendi", icon: "🌿" },
  { slug: "casual", label: "Casual / Everyday", icon: "☀️" },
  { slug: "office", label: "Office Wear", icon: "💼" },
  { slug: "party", label: "Party / Date Night", icon: "✨" },
] as const;

export const GI_TAGS: Record<string, { label: string; state: string; desc: string }> = {
  banarasi_silk: { label: "Banarasi Silk", state: "Uttar Pradesh", desc: "Hand-woven silk sarees with intricate zari work from Varanasi, with over 2,000 years of history." },
  kanjivaram_silk: { label: "Kanjivaram Silk", state: "Tamil Nadu", desc: "Pure mulberry silk woven in Kanchipuram using the traditional korvai technique for the border." },
  lucknow_chikankari: { label: "Lucknow Chikankari", state: "Uttar Pradesh", desc: "Delicate hand-embroidery on fine fabric, a royal craft from the Nawabi era of Lucknow." },
  chanderi: { label: "Chanderi", state: "Madhya Pradesh", desc: "Lightweight fabric with a lustrous sheen and fine texture, woven with silk and cotton in Chanderi town." },
  maheshwari: { label: "Maheshwari", state: "Madhya Pradesh", desc: "Woven in Maheshwar town for Holkar queens. Known for reversible borders and fine silk-cotton blend." },
  sambalpuri: { label: "Sambalpuri Ikat", state: "Odisha", desc: "Tie-dye resist-dyeing on threads before weaving, creating traditional geometric patterns." },
  paithani: { label: "Paithani Silk", state: "Maharashtra", desc: "Pure silk sarees with zari work woven in Paithan town. Known for the distinctive peacock motif." },
  patola: { label: "Patola Silk", state: "Gujarat", desc: "Double ikat silk sarees made only in Patan, Gujarat. One of India's most labour-intensive weaves." },
  muga_silk: { label: "Muga Silk", state: "Assam", desc: "Golden-hued wild silk indigenous to Assam. Naturally shiny and extraordinarily durable." },
  tussar_silk: { label: "Tussar Silk", state: "Jharkhand / Bihar", desc: "Wild silk with a natural golden-beige colour and rich texture, spun from Tussar silkworm cocoons." },
  phulkari: { label: "Phulkari Embroidery", state: "Punjab", desc: "Traditional Punjabi craft of floral embroidery using vibrant silk thread on coarse cotton fabric." },
  pochampally_ikat: { label: "Pochampally Ikat", state: "Telangana", desc: "Geometric ikat weaving from Pochampally village, designated a GI for its unique warp-weft pattern." },
  kalamkari: { label: "Kalamkari", state: "Andhra Pradesh", desc: "Hand-painted or block-printed fabric using a kalam (pen). Features scenes from Hindu mythology." },
  kota_doria: { label: "Kota Doria", state: "Rajasthan", desc: "Lightweight cotton-silk blend from Kota town. Distinctive square check patterns and airy texture." },
  bandhani: { label: "Bandhani", state: "Gujarat / Rajasthan", desc: "Ancient tie-dye craft creating tiny dots of colour. A traditional craft at least 5,000 years old." },
  kashmiri_pashmina: { label: "Kashmiri Pashmina", state: "Jammu & Kashmir", desc: "Ultra-fine cashmere hand-spun and woven from Changthangi goat undercoat. Symbol of Kashmiri luxury." },
  kashmiri_sozni: { label: "Kashmiri Sozni", state: "Jammu & Kashmir", desc: "Fine needlework embroidery with silk on pashmina. Motifs inspired by Mughal gardens and chinar leaves." },
  bagh_print: { label: "Bagh Print", state: "Madhya Pradesh", desc: "Natural dye block printing from Bagh village using indigo, pomegranate and rusty iron as dyes." },
  ajrakh: { label: "Ajrakh Block Print", state: "Gujarat / Rajasthan", desc: "Ancient resist-printing technique using natural dyes and carved wooden blocks in geometric patterns." },
  baluchari: { label: "Baluchari Saree", state: "West Bengal", desc: "Silk sarees from Bishnupur with narrative scenes from Hindu epics woven on the pallu." },
  ilkal_saree: { label: "Ilkal Saree", state: "Karnataka", desc: "Hand-woven in Ilkal town with distinctive art silk top body and pure silk border in contrast colour." },
  tangail_cotton: { label: "Tangail Cotton Saree", state: "West Bengal", desc: "Delicate hand-woven cotton sarees from the Tangail weavers who migrated to West Bengal." },
  pilkhuwa_blockprint: { label: "Pilkhuwa Hand Block Print", state: "Uttar Pradesh", desc: "Bed linen and fabric with traditional hand block prints from the Pilkhuwa weaving cluster." },
  tharu_embroidery: { label: "Tharu Embroidery", state: "Uttar Pradesh", desc: "Vibrant needlework by the Tharu tribal community of the Himalayan foothills with geometric motifs." },
};

export const STYLE_PERSONAS = [
  { slug: "TRADITIONAL", label: "Timeless Traditional", desc: "Classic silhouettes, heritage weaves, and authentic craftsmanship", color: "#8B1A1A" },
  { slug: "FUSION", label: "Modern Fusion", desc: "Contemporary cuts with ethnic fabrics — best of both worlds", color: "#2563EB" },
  { slug: "CONTEMPORARY", label: "Contemporary Ethnic", desc: "Clean lines, minimal embellishments, everyday elegance", color: "#059669" },
  { slug: "BRIDAL", label: "Bridal & Festive", desc: "Maximalist grandeur for your most special occasions", color: "#D4A843" },
] as const;

export const COUNTRIES = [
  { code: "US", label: "United States", currency: "USD", rate: 84 },
  { code: "UK", label: "United Kingdom", currency: "GBP", rate: 107 },
  { code: "UAE", label: "UAE / Dubai", currency: "AED", rate: 23 },
  { code: "CA", label: "Canada", currency: "CAD", rate: 61 },
  { code: "AU", label: "Australia", currency: "AUD", rate: 54 },
  { code: "SG", label: "Singapore", currency: "SGD", rate: 62 },
  { code: "EU", label: "Europe", currency: "EUR", rate: 90 },
  { code: "NZ", label: "New Zealand", currency: "NZD", rate: 51 },
] as const;

export const BRANDS = [
  { slug: "karagiri", name: "Karagiri", tagline: "The Most Trusted Ethnic Brand" },
  { slug: "shobitam", name: "Shobitam", tagline: "Sarees for the Modern Indian Woman" },
  { slug: "theindianethnicco", name: "The Indian Ethnic Co.", tagline: "Handcrafted Heritage" },
  { slug: "ishin", name: "Ishin Fashions", tagline: "Ethnic Fashion for Every Woman" },
  { slug: "suta", name: "Suta", tagline: "Reviving Indian Handloom" },
  { slug: "bunaai", name: "Bunaai", tagline: "Handmade With Love" },
  { slug: "fashor", name: "Fashor", tagline: "Chikankari & Beyond" },
  { slug: "koskii", name: "Koskii", tagline: "Occasion Wear Redefined" },
  { slug: "houseofchikankari", name: "House of Chikankari", tagline: "Authentic Lucknowi Craft" },
  { slug: "aachho", name: "Aachho", tagline: "Jaipur Heritage, Global Reach" },
] as const;
