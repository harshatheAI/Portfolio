import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./prisma/dev.db" });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const BRAND_DATA = [
  {
    slug: "karagiri",
    name: "Karagiri",
    website: "https://www.karagiri.com",
    description: "India's most trusted ethnic brand, offering handcrafted sarees, lehengas, and anarkalis.",
    story: "Karagiri connects India's rich textile heritage to the global diaspora. Every piece tells a story of artisan craftsmanship from across India.",
    scrapingDomain: "www.karagiri.com",
    commissionRate: 8,
    shippingCountries: "US,UK,UAE,CA,AU",
  },
  {
    slug: "shobitam",
    name: "Shobitam",
    website: "https://shobitam.com",
    description: "Sarees for the modern Indian woman — started on Etsy, now serving the global NRI community.",
    story: "Founded by two sisters, Shobitam began as an Etsy shop in 2019 and grew to $1.2M/yr by bringing authentic Indian weaves to the diaspora.",
    scrapingDomain: "shobitam.com",
    commissionRate: 10,
    shippingCountries: "US,UK,UAE,CA,AU,SG",
  },
  {
    slug: "theindianethnicco",
    name: "The Indian Ethnic Co.",
    website: "https://www.theindianethnicco.com",
    description: "Handblock prints, natural dyes, and handloom heritage from the hinterlands of India.",
    story: "A Mumbai-based brand on a mission to bring timeless handmade clothing from India's artisan communities to a global audience.",
    scrapingDomain: "www.theindianethnicco.com",
    commissionRate: 9,
    shippingCountries: "US,UK,UAE,CA,AU,SG,EU",
  },
  {
    slug: "ishin",
    name: "Ishin Fashions",
    website: "https://ishinfashions.com",
    description: "Vibrant kurtas, kurtis, palazzo sets, and sarees for the modern ethnic woman.",
    story: "Ishin brings joyful colour and accessible ethnic fashion to women everywhere, with a focus on comfort and occasion versatility.",
    scrapingDomain: "ishin-online.myshopify.com",
    commissionRate: 7,
    shippingCountries: "US,UK,UAE,CA,AU",
  },
  {
    slug: "suta",
    name: "Suta",
    website: "https://www.suta.in",
    description: "Reviving India's handloom tradition through contemporary handwoven sarees and blouses.",
    story: "Started by two sisters Sujata and Taniya, Suta works directly with weavers across India to bring handloom to a new generation.",
    scrapingDomain: "www.suta.in",
    commissionRate: 9,
    shippingCountries: "US,UK,UAE,CA,AU,SG",
  },
  {
    slug: "bunaai",
    name: "Bunaai",
    website: "https://www.bunaai.com",
    description: "Hand-painted and block-printed ethnic wear — from everyday essentials to celebration looks.",
    story: "Bunaai means 'to weave' in Hindi. The brand is dedicated to celebrating India's handcraft traditions through accessible, contemporary designs.",
    scrapingDomain: "www.bunaai.com",
    commissionRate: 8,
    shippingCountries: "US,UK,UAE,CA,AU,SG",
  },
  {
    slug: "fashor",
    name: "Fashor",
    website: "https://fashor.com",
    description: "Chikankari embroidery and modern ethnic wear backed by Blume Ventures.",
    story: "Fashor brings the art of Lucknowi chikankari to modern silhouettes, making heritage embroidery wearable for everyday and special occasions.",
    scrapingDomain: "fashor.com",
    commissionRate: 8,
    shippingCountries: "US,UK,UAE,CA,AU",
  },
  {
    slug: "koskii",
    name: "Koskii",
    website: "https://www.koskii.com",
    description: "Occasion wear redefined — wedding, festive, and party ethnic wear from Bangalore.",
    story: "Koskii designs for real occasions — weddings, festivals, galas — bringing a touch of drama and elegance to the modern Indian woman abroad.",
    scrapingDomain: "www.koskii.com",
    commissionRate: 9,
    shippingCountries: "US,UK,UAE,CA,AU,SG",
  },
  {
    slug: "houseofchikankari",
    name: "House of Chikankari",
    website: "https://www.houseofchikankari.in",
    description: "Exclusively Lucknowi chikankari — artisan-led, GI-certified hand embroidery.",
    story: "Founded to preserve and promote the dying art of Lucknow chikankari, every piece is hand-embroidered by skilled karigars from UP.",
    scrapingDomain: "www.houseofchikankari.in",
    commissionRate: 10,
    shippingCountries: "US,UK,UAE,CA,AU,SG,EU",
  },
  {
    slug: "aachho",
    name: "Aachho",
    website: "https://www.aachho.com",
    description: "Jaipur's heritage crafts — ajrakh, block prints, bandhani — for the global Indian.",
    story: "Aachho is rooted in Rajasthan's 5,000-year-old craft traditions. With a dedicated US site (aachho.co), they're built for the diaspora.",
    scrapingDomain: "www.aachho.com",
    commissionRate: 9,
    shippingCountries: "US,UK,UAE,CA,AU,SG,EU",
  },
];

const PRODUCT_TEMPLATES = [
  { brandSlug: "karagiri", name: "Banarasi Silk Saree in Deep Crimson", price: 8500, comparePrice: 12000, categories: ["saree", "silk"], occasions: ["wedding", "festive"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["banarasi_silk"], fabric: "Pure Silk", description: "Hand-woven pure silk Banarasi saree with intricate gold zari work. Features a rich pallu with traditional motifs.", images: JSON.stringify(["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"]), colors: ["crimson", "gold"], sizes: ["Free Size"] },
  { brandSlug: "karagiri", name: "Kanjivaram Silk Saree in Emerald Green", price: 11500, comparePrice: 18000, categories: ["saree", "silk"], occasions: ["wedding", "bridal"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["kanjivaram_silk"], fabric: "Pure Kanjivaram Silk", description: "Authentic Kanjivaram silk saree woven using the traditional korvai technique. Deep emerald body with contrast maroon border.", images: JSON.stringify(["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600", "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600"]), colors: ["emerald", "maroon"], sizes: ["Free Size"] },
  { brandSlug: "karagiri", name: "Chanderi Silk Suit Set in Blush Pink", price: 4200, comparePrice: 6500, categories: ["salwar-kameez", "suit-set"], occasions: ["festive", "party"], style: ["contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["chanderi"], fabric: "Chanderi Silk", description: "Three-piece Chanderi silk suit set in delicate blush pink. Includes kurta, bottom, and sheer dupatta.", images: JSON.stringify(["https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=600", "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600"]), colors: ["blush", "pink"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "karagiri", name: "Embroidered Lehenga Choli in Royal Blue", price: 14500, comparePrice: 22000, categories: ["lehenga"], occasions: ["wedding", "sangeet", "bridal"], style: ["traditional", "festive"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Georgette", description: "Heavy embroidered lehenga choli perfect for sangeet or as a wedding guest. Comes with matching blouse and dupatta.", images: JSON.stringify(["https://images.unsplash.com/photo-1609825488888-3a766db05542?w=600", "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600"]), colors: ["royal blue", "gold"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "shobitam", name: "Linen Saree with Temple Border in Saffron", price: 3200, comparePrice: null, categories: ["saree", "linen"], occasions: ["casual", "office"], style: ["contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Pure Linen", description: "Everyday linen saree with a woven temple border. Light enough for all-day wear, beautiful enough for the office.", images: JSON.stringify(["https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600", "https://images.unsplash.com/photo-1585320806297-9794b3e4abb3?w=600"]), colors: ["saffron", "gold"], sizes: ["Free Size"] },
  { brandSlug: "shobitam", name: "Handwoven Cotton Saree with Zari Border", price: 2800, comparePrice: 4200, categories: ["saree", "cotton"], occasions: ["casual", "festive"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Cotton", description: "Soft handwoven cotton saree with a contrasting zari border. Ideal for daily wear or casual festive occasions.", images: JSON.stringify(["https://images.unsplash.com/photo-1631233859263-41a0c2572cd0?w=600", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"]), colors: ["ivory", "gold"], sizes: ["Free Size"] },
  { brandSlug: "shobitam", name: "Patola Silk Dupatta in Midnight Blue", price: 5500, comparePrice: 7800, categories: ["dupatta"], occasions: ["festive", "wedding"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["patola"], fabric: "Patola Silk", description: "Authentic double ikat Patola dupatta from Patan, Gujarat. Each piece takes weeks to weave by skilled artisans.", images: JSON.stringify(["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600", "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=600"]), colors: ["midnight blue", "red", "gold"], sizes: ["Free Size"] },
  { brandSlug: "theindianethnicco", name: "Ajrakh Block Print Kurta in Indigo", price: 2900, comparePrice: null, categories: ["kurta"], occasions: ["casual", "office"], style: ["fusion", "traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["ajrakh"], fabric: "Cotton", description: "Natural-dyed ajrakh block print kurta in classic indigo and white. Ethically made with vegetable dyes.", images: JSON.stringify(["https://images.unsplash.com/photo-1631233859263-41a0c2572cd0?w=600", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"]), colors: ["indigo", "white"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "theindianethnicco", name: "Hand Block Printed Chanderi Suit", price: 4800, comparePrice: 6200, categories: ["salwar-kameez", "suit-set"], occasions: ["festive", "office", "casual"], style: ["fusion"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["chanderi", "pilkhuwa_blockprint"], fabric: "Chanderi", description: "Three-piece Chanderi suit with artisan block printing. Includes kurta, pants, and printed dupatta.", images: JSON.stringify(["https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=600", "https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600"]), colors: ["teal", "white"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "theindianethnicco", name: "Bagh Print Saree in Earthy Rust", price: 3600, comparePrice: 5000, categories: ["saree"], occasions: ["casual", "festive"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["bagh_print"], fabric: "Cotton Silk", description: "Earthy rust bagh print saree from Madhya Pradesh. Natural vegetable dyes give each piece a unique character.", images: JSON.stringify(["https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600", "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600"]), colors: ["rust", "black"], sizes: ["Free Size"] },
  { brandSlug: "ishin", name: "Floral Print Anarkali Suit in Peach", price: 1800, comparePrice: 3200, categories: ["anarkali", "kurta"], occasions: ["festive", "party", "casual"], style: ["fusion", "contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Georgette", description: "Flowy georgette anarkali with a bold floral print. Comes with matching churidar and dupatta.", images: JSON.stringify(["https://images.unsplash.com/photo-1609825488888-3a766db05542?w=600", "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600"]), colors: ["peach", "gold"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "ishin", name: "Straight Kurta Set with Palazzo in Teal", price: 1600, comparePrice: 2400, categories: ["kurta", "kurti"], occasions: ["casual", "office"], style: ["contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Rayon", description: "Comfortable teal kurta and wide-leg palazzo set. Versatile enough for office days and casual brunches.", images: JSON.stringify(["https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=600", "https://images.unsplash.com/photo-1585320806297-9794b3e4abb3?w=600"]), colors: ["teal"], sizes: ["XS", "S", "M", "L", "XL", "XXL", "3XL"] },
  { brandSlug: "ishin", name: "Embroidered Kurta Set for Girls in Pink", price: 1200, comparePrice: 1800, categories: ["kurta"], occasions: ["festive", "casual"], style: ["fusion"], gender: "WOMEN", ageGroup: "KIDS", giTags: [], fabric: "Cotton Silk", description: "Cute embroidered kurta set for little girls. Pairs beautifully with matching leggings for festive occasions.", images: JSON.stringify(["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600", "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=600"]), colors: ["pink", "gold"], sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"] },
  { brandSlug: "suta", name: "Handwoven Linen Saree in Moss Green", price: 3800, comparePrice: null, categories: ["saree", "linen"], occasions: ["casual", "office"], style: ["contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Pure Handwoven Linen", description: "Woven by master weavers in West Bengal, this moss green linen saree drapes effortlessly and breathes beautifully.", images: JSON.stringify(["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600", "https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600"]), colors: ["moss green"], sizes: ["Free Size"] },
  { brandSlug: "suta", name: "Tussar Silk Saree in Natural Gold", price: 6200, comparePrice: 8500, categories: ["saree", "silk"], occasions: ["festive", "wedding"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["tussar_silk"], fabric: "Tussar Silk", description: "Wild tussar silk in its natural golden hue. Minimal adornment lets the fabric's natural lustre speak.", images: JSON.stringify(["https://images.unsplash.com/photo-1631233859263-41a0c2572cd0?w=600", "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600"]), colors: ["natural gold", "beige"], sizes: ["Free Size"] },
  { brandSlug: "suta", name: "Cotton Saree with Embroidered Border", price: 2600, comparePrice: null, categories: ["saree", "cotton"], occasions: ["casual", "office"], style: ["contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Cotton", description: "Crisp cotton saree with a contrast hand-embroidered border. Perfect for daily office wear.", images: JSON.stringify(["https://images.unsplash.com/photo-1585320806297-9794b3e4abb3?w=600", "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"]), colors: ["white", "navy"], sizes: ["Free Size"] },
  { brandSlug: "bunaai", name: "Hand-Painted Silk Kurta in Sunset Orange", price: 3200, comparePrice: 4800, categories: ["kurta"], occasions: ["festive", "party"], style: ["fusion", "contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Silk", description: "Each piece is hand-painted by artisans in Jaipur. Sunset orange with abstract brush strokes.", images: JSON.stringify(["https://images.unsplash.com/photo-1609825488888-3a766db05542?w=600", "https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=600"]), colors: ["orange", "gold"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "bunaai", name: "Block Print Co-ord Set in Turquoise", price: 2800, comparePrice: null, categories: ["kurta", "indo-western"], occasions: ["casual", "festive"], style: ["fusion"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Cotton", description: "Matching block print crop top and palazzos in fresh turquoise. Easy to dress up or down.", images: JSON.stringify(["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600", "https://images.unsplash.com/photo-1588421357574-87938a86fa28?w=600"]), colors: ["turquoise", "white"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "fashor", name: "Chikankari Kurta Set in White", price: 2400, comparePrice: 3600, categories: ["kurta", "salwar-kameez"], occasions: ["casual", "festive", "office"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["lucknow_chikankari"], fabric: "Georgette", description: "Classic white chikankari kurta with hand-embroidered floral motifs. The quintessential Indian summer look.", images: JSON.stringify(["https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600", "https://images.unsplash.com/photo-1631233859263-41a0c2572cd0?w=600"]), colors: ["white"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "fashor", name: "Chikankari Saree in Pastel Lavender", price: 4800, comparePrice: 6800, categories: ["saree"], occasions: ["festive", "wedding", "party"], style: ["traditional", "contemporary"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["lucknow_chikankari"], fabric: "Georgette", description: "Delicate lavender georgette saree with all-over chikankari embroidery. Graceful and ethereal.", images: JSON.stringify(["https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600", "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"]), colors: ["lavender", "white"], sizes: ["Free Size"] },
  { brandSlug: "fashor", name: "Chikankari Sharara Set in Mint Green", price: 3200, comparePrice: 4500, categories: ["salwar-kameez", "indo-western"], occasions: ["festive", "sangeet", "party"], style: ["fusion"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["lucknow_chikankari"], fabric: "Georgette", description: "Trendy sharara set with intricate chikankari work. Perfect for mehendi or sangeet nights.", images: JSON.stringify(["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600", "https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=600"]), colors: ["mint", "white"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "koskii", name: "Sequin Lehenga Set in Magenta Pink", price: 18500, comparePrice: 28000, categories: ["lehenga"], occasions: ["wedding", "sangeet", "party"], style: ["festive"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Net with Sequins", description: "Show-stopping sequin lehenga in bold magenta. Heavy embellishment on the skirt with a complementary blouse and dupatta.", images: JSON.stringify(["https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600", "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=600"]), colors: ["magenta", "gold"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "koskii", name: "Embroidered Anarkali Gown in Wine Red", price: 8900, comparePrice: 13500, categories: ["anarkali"], occasions: ["wedding", "festive", "party"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: [], fabric: "Velvet", description: "Floor-length velvet anarkali with heavy thread embroidery. A statement piece for winter weddings.", images: JSON.stringify(["https://images.unsplash.com/photo-1590735213920-68192a487bc2?w=600", "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600"]), colors: ["wine", "gold"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "houseofchikankari", name: "Chikankari Kurti in Powder Blue", price: 1800, comparePrice: 2600, categories: ["kurti"], occasions: ["casual", "office"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["lucknow_chikankari"], fabric: "Cotton", description: "Everyday chikankari kurti in soothing powder blue. Hand-embroidered by artisans in Lucknow.", images: JSON.stringify(["https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600", "https://images.unsplash.com/photo-1585320806297-9794b3e4abb3?w=600"]), colors: ["powder blue", "white"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "houseofchikankari", name: "Chikankari Men's Kurta in Off-White", price: 2200, comparePrice: 3200, categories: ["kurta"], occasions: ["festive", "wedding", "casual"], style: ["traditional"], gender: "MEN", ageGroup: "ADULT", giTags: ["lucknow_chikankari"], fabric: "Cotton", description: "Classic off-white chikankari kurta for men. Perfect for Eid, Diwali, or any festive occasion.", images: JSON.stringify(["https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600", "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600"]), colors: ["off-white"], sizes: ["S", "M", "L", "XL", "XXL", "3XL"] },
  { brandSlug: "houseofchikankari", name: "Chikankari Sharara in Lilac", price: 3800, comparePrice: 5200, categories: ["salwar-kameez", "indo-western"], occasions: ["festive", "wedding", "sangeet"], style: ["traditional", "fusion"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["lucknow_chikankari"], fabric: "Georgette", description: "Dreamy lilac sharara with delicate chikankari. A versatile piece that transitions from day to night.", images: JSON.stringify(["https://images.unsplash.com/photo-1631233859263-41a0c2572cd0?w=600", "https://images.unsplash.com/photo-1609825488888-3a766db05542?w=600"]), colors: ["lilac", "white"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "aachho", name: "Bandhani Saree in Vivid Yellow", price: 4200, comparePrice: 6000, categories: ["saree"], occasions: ["festive", "haldi", "navratri"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["bandhani"], fabric: "Georgette", description: "Traditional Rajasthani bandhani saree in vibrant yellow. Perfect for haldi ceremonies or Navratri.", images: JSON.stringify(["https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=600", "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600"]), colors: ["yellow", "orange"], sizes: ["Free Size"] },
  { brandSlug: "aachho", name: "Kota Doria Suit Set in Aqua", price: 3400, comparePrice: null, categories: ["salwar-kameez", "suit-set"], occasions: ["casual", "festive"], style: ["traditional"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["kota_doria"], fabric: "Kota Doria", description: "Lightweight Kota Doria three-piece suit in refreshing aqua. Ideal for summer weddings or festive events.", images: JSON.stringify(["https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600", "https://images.unsplash.com/photo-1614251056216-f748f76cd228?w=600"]), colors: ["aqua", "gold"], sizes: ["XS", "S", "M", "L", "XL"] },
  { brandSlug: "aachho", name: "Jaipuri Block Print Kurta Set in Terracotta", price: 2600, comparePrice: 3800, categories: ["kurta", "suit-set"], occasions: ["casual", "festive"], style: ["traditional", "fusion"], gender: "WOMEN", ageGroup: "ADULT", giTags: ["ajrakh"], fabric: "Cotton", description: "Earthy terracotta Jaipuri block print kurta with straight pants. Comes with contrast dupatta.", images: JSON.stringify(["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600", "https://images.unsplash.com/photo-1585320806297-9794b3e4abb3?w=600"]), colors: ["terracotta", "rust"], sizes: ["XS", "S", "M", "L", "XL", "XXL"] },
  { brandSlug: "karagiri", name: "Silk Kurta Pajama Set in Ivory", price: 5600, comparePrice: 8200, categories: ["kurta", "salwar-kameez"], occasions: ["wedding", "festive"], style: ["traditional"], gender: "MEN", ageGroup: "ADULT", giTags: [], fabric: "Silk", description: "Sophisticated ivory silk kurta pajama with subtle thread work. Ideal for wedding ceremonies.", images: JSON.stringify(["https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600"]), colors: ["ivory", "gold"], sizes: ["S", "M", "L", "XL", "XXL", "3XL"] },
  { brandSlug: "koskii", name: "Embroidered Sherwani in Midnight Blue", price: 22000, comparePrice: 32000, categories: ["sherwani"], occasions: ["wedding", "bridal"], style: ["traditional"], gender: "MEN", ageGroup: "ADULT", giTags: [], fabric: "Velvet", description: "Regal midnight blue velvet sherwani with thread and sequin embroidery. The perfect groom or baraat look.", images: JSON.stringify(["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=600"]), colors: ["midnight blue", "gold"], sizes: ["S", "M", "L", "XL", "XXL"] },
  { brandSlug: "aachho", name: "Nehru Jacket in Jaipuri Print", price: 2800, comparePrice: 3800, categories: ["kurta", "indo-western"], occasions: ["festive", "casual", "party"], style: ["fusion"], gender: "MEN", ageGroup: "ADULT", giTags: [], fabric: "Cotton", description: "Vibrant Jaipuri print Nehru jacket — layer over a plain kurta or with jeans for a fusion look.", images: JSON.stringify(["https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=600", "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600"]), colors: ["multicolor", "navy"], sizes: ["S", "M", "L", "XL", "XXL"] },
];

async function main() {
  console.log("Seeding database...");

  const brands: Record<string, string> = {};
  for (const b of BRAND_DATA) {
    const brand = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: b,
      create: b,
    });
    brands[b.slug] = brand.id;
    console.log(`  Brand: ${b.name}`);
  }

  let productCount = 0;
  for (const p of PRODUCT_TEMPLATES) {
    const brandId = brands[p.brandSlug];
    if (!brandId) continue;

    const slug = `${p.brandSlug}-${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-${Math.random().toString(36).substr(2, 6)}`;

    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        brandId,
        externalId: `seed-${productCount + 1}`,
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? undefined,
        currency: "INR",
        images: p.images,
        categories: JSON.stringify(p.categories),
        occasions: JSON.stringify(p.occasions),
        style: JSON.stringify(p.style),
        gender: p.gender,
        ageGroup: p.ageGroup,
        giTags: JSON.stringify(p.giTags),
        fabric: p.fabric,
        sizes: JSON.stringify(p.sizes),
        colors: JSON.stringify(p.colors),
        inStock: true,
        affiliateUrl: `${BRAND_DATA.find(b => b.slug === p.brandSlug)?.website}?ref=drape`,
        sourceUrl: `${BRAND_DATA.find(b => b.slug === p.brandSlug)?.website}/products/${slug}`,
      },
    });
    productCount++;
  }
  console.log(`  ${productCount} products seeded`);

  const hashedPassword = await bcrypt.hash("demo12345", 10);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@drape.ai" },
    update: {},
    create: {
      email: "demo@drape.ai",
      name: "Priya Sharma",
      password: hashedPassword,
      country: "US",
      city: "New York",
    },
  });

  await prisma.styleProfile.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      persona: "FUSION",
      colorPrefs: JSON.stringify(["jewel-tones", "pastels"]),
      occasionFocus: JSON.stringify(["wedding", "festive"]),
      budgetMin: 3000,
      budgetMax: 15000,
      gender: "WOMEN",
      favoriteBrands: JSON.stringify(["suta", "bunaai", "fashor"]),
      baseCountry: "US",
    },
  });

  console.log(`  Demo user: demo@drape.ai / demo12345`);
  console.log("Seeding complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
