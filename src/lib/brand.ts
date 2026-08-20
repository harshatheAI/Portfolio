/**
 * Central brand + company profile.
 *
 * Everything a non-technical operator would want to change lives here or in the
 * PricingConfig table (see /admin). Swap these values for the movers company's
 * real details and the whole site updates.
 */
export const company = {
  name: "Brother Bear Moving",
  shortName: "Brother Bear",
  tagline: "Moving made easy — handled with bear-hug care.",
  description:
    "A local, family-run moving company. Get an instant online quote, book a crew in minutes, and track your move in real time.",
  phone: "(555) 268-6683",
  phoneHref: "tel:+15552686683",
  email: "hello@brotherbearmoving.com",
  bookingEmail: "book@brotherbearmoving.com",
  address: {
    line1: "1200 Timber Ridge Rd",
    city: "Asheville",
    state: "NC",
    zip: "28801",
  },
  license: "USDOT 3921004 · NC MC 4471",
  hours: "Mon–Sat, 7:00 AM – 7:00 PM",
  foundedYear: 2016,
  rating: 4.9,
  reviewCount: 412,
  movesCompleted: "9,000+",
  serviceRadiusMiles: 120,
  serviceAreas: [
    "Asheville",
    "Hendersonville",
    "Black Mountain",
    "Weaverville",
    "Arden",
    "Fletcher",
    "Waynesville",
    "Brevard",
  ],
  social: {
    google: "https://maps.app.goo.gl/KGLi4Jz4ZQNo7YCr7",
    instagram: "#",
    facebook: "#",
  },
} as const;

export const homeSizes = [
  { value: "STUDIO", label: "Studio", rooms: "Studio apartment", baseVolume: 350 },
  { value: "ONE_BED", label: "1 Bedroom", rooms: "1-bed home / apt", baseVolume: 550 },
  { value: "TWO_BED", label: "2 Bedroom", rooms: "2-bed home / apt", baseVolume: 900 },
  { value: "THREE_BED", label: "3 Bedroom", rooms: "3-bed house", baseVolume: 1400 },
  { value: "FOUR_BED_PLUS", label: "4+ Bedroom", rooms: "4+ bed house", baseVolume: 2000 },
  { value: "OFFICE", label: "Office / Commercial", rooms: "Office move", baseVolume: 1200 },
  { value: "OTHER", label: "Just a few items", rooms: "Small / partial move", baseVolume: 200 },
] as const;

export type HomeSizeValue = (typeof homeSizes)[number]["value"];

export const addons = [
  {
    id: "packing",
    name: "Full packing service",
    blurb: "Our crew boxes everything for you — materials included.",
    icon: "PackageOpen",
  },
  {
    id: "unpacking",
    name: "Unpacking at destination",
    blurb: "We unbox and set up so you can settle in fast.",
    icon: "PackageCheck",
  },
  {
    id: "storage",
    name: "Storage (per month)",
    blurb: "Climate-controlled storage if your timelines don't line up.",
    icon: "Warehouse",
  },
  {
    id: "specialty",
    name: "Specialty items",
    blurb: "Pianos, safes, gym equipment, antiques — handled with extra care.",
    icon: "Piano",
  },
  {
    id: "insurance",
    name: "Full-value protection",
    blurb: "Upgrade from basic liability to full replacement coverage.",
    icon: "ShieldCheck",
  },
  {
    id: "disassembly",
    name: "Furniture disassembly",
    blurb: "Beds, tables and shelving taken apart and rebuilt.",
    icon: "Wrench",
  },
] as const;

export type AddonId = (typeof addons)[number]["id"];
