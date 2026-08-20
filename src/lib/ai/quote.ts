import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, CLAUDE_MODEL, aiEnabled } from "@/lib/ai/client";
import { homeSizes, type HomeSizeValue } from "@/lib/brand";

/**
 * Analyzes a customer's move (home size + free-text description + optional
 * photos) into a structured inventory estimate. Uses Claude vision when an API
 * key is configured; otherwise falls back to a deterministic heuristic so the
 * quote flow works end-to-end with no external dependencies.
 */

export interface InventoryItem {
  name: string;
  quantity: number;
  category: string; // furniture | appliance | box | specialty | misc
  bulky?: boolean;
}

export interface MoveAnalysis {
  items: InventoryItem[];
  estimatedVolumeCuFt: number;
  estimatedWeightLbs: number;
  laborHours: number; // job duration for the crew
  crewSize: number;
  specialtyCount: number;
  summary: string;
  confidence: "vision" | "heuristic";
}

export interface AnalyzeInput {
  homeSize: HomeSizeValue;
  itemsDescription?: string;
  /** data URLs (data:image/...;base64,...) */
  photos?: string[];
}

const CU_FT_PER_MOVER_HOUR = 70;

function baseVolumeFor(homeSize: HomeSizeValue): number {
  return homeSizes.find((h) => h.value === homeSize)?.baseVolume ?? 600;
}

function crewFor(volume: number): number {
  if (volume < 500) return 2;
  if (volume < 1100) return 3;
  if (volume < 1800) return 3;
  return 4;
}

function laborHoursFor(volume: number, crew: number): number {
  const moverHours = volume / CU_FT_PER_MOVER_HOUR;
  const hours = moverHours / crew;
  // round up to nearest half hour, minimum 2h job
  return Math.max(2, Math.round(hours * 2) / 2);
}

const SPECIALTY_KEYWORDS = [
  "piano",
  "safe",
  "gun safe",
  "treadmill",
  "pool table",
  "hot tub",
  "antique",
  "grandfather clock",
  "aquarium",
  "fish tank",
  "gym",
  "peloton",
];

const BULKY_KEYWORDS: Record<string, number> = {
  couch: 55,
  sofa: 55,
  sectional: 90,
  bed: 45,
  mattress: 35,
  dresser: 40,
  wardrobe: 55,
  fridge: 60,
  refrigerator: 60,
  washer: 35,
  dryer: 35,
  desk: 30,
  bookshelf: 30,
  table: 35,
  "dining table": 45,
  tv: 15,
  treadmill: 45,
  piano: 80,
};

/** Deterministic estimator — no network, fully repeatable. */
export function heuristicAnalysis(input: AnalyzeInput): MoveAnalysis {
  const desc = (input.itemsDescription || "").toLowerCase();
  let volume = baseVolumeFor(input.homeSize);

  const items: InventoryItem[] = [];
  let specialtyCount = 0;

  // Detect quantities like "3 beds", "two sofas"
  const wordNums: Record<string, number> = {
    a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  };

  for (const [kw, cuft] of Object.entries(BULKY_KEYWORDS)) {
    const re = new RegExp(`(\\d+|a|an|one|two|three|four|five|six|seven|eight)?\\s*${kw}s?`, "g");
    let m: RegExpExecArray | null;
    let counted = 0;
    while ((m = re.exec(desc)) && counted < 20) {
      const qtyRaw = m[1];
      const qty = qtyRaw ? (wordNums[qtyRaw] ?? (parseInt(qtyRaw, 10) || 1)) : 1;
      counted += qty;
    }
    if (counted > 0) {
      volume += cuft * counted * 0.5; // partial add on top of the home-size baseline
      items.push({
        name: kw.charAt(0).toUpperCase() + kw.slice(1),
        quantity: counted,
        category: ["fridge", "refrigerator", "washer", "dryer"].includes(kw) ? "appliance" : "furniture",
        bulky: cuft >= 45,
      });
    }
  }

  // Box mentions
  const boxMatch = desc.match(/(\d+)\s*(?:boxes|boxs|cartons)/);
  if (boxMatch) {
    const n = parseInt(boxMatch[1], 10);
    volume += n * 3;
    items.push({ name: "Boxes", quantity: n, category: "box" });
  }

  for (const kw of SPECIALTY_KEYWORDS) {
    if (desc.includes(kw)) {
      specialtyCount += 1;
      if (!items.find((i) => i.name.toLowerCase() === kw)) {
        items.push({ name: kw.charAt(0).toUpperCase() + kw.slice(1), quantity: 1, category: "specialty", bulky: true });
      }
    }
  }

  // Photos add confidence + a little volume each (assume each photo shows a room of stuff)
  const photoCount = input.photos?.length ?? 0;
  volume += photoCount * 60;

  volume = Math.round(volume);
  const crewSize = crewFor(volume);
  const laborHours = laborHoursFor(volume, crewSize);
  const weight = Math.round(volume * 7);

  const sizeLabel = homeSizes.find((h) => h.value === input.homeSize)?.label ?? "your home";
  const summary =
    `Based on a ${sizeLabel.toLowerCase()}${desc ? " and the items you described" : ""}` +
    `${photoCount ? ` plus ${photoCount} photo${photoCount > 1 ? "s" : ""}` : ""}, we estimate about ` +
    `${volume.toLocaleString()} cu ft (~${weight.toLocaleString()} lbs). A crew of ${crewSize} ` +
    `should complete the move in roughly ${laborHours} hours.` +
    (specialtyCount ? ` We flagged ${specialtyCount} specialty item(s) for extra care.` : "");

  return {
    items,
    estimatedVolumeCuFt: volume,
    estimatedWeightLbs: weight,
    laborHours,
    crewSize,
    specialtyCount,
    summary,
    confidence: "heuristic",
  };
}

const VISION_SYSTEM = `You are a senior moving estimator for a professional moving company.
From the customer's home size, written description, and any photos, produce a realistic inventory and effort estimate.
Be practical and slightly conservative (movers would rather over-prepare). Respond with ONLY valid JSON:
{
  "items": [{"name": string, "quantity": number, "category": "furniture"|"appliance"|"box"|"specialty"|"misc", "bulky": boolean}],
  "estimatedVolumeCuFt": number,
  "estimatedWeightLbs": number,
  "laborHours": number,   // total job duration for the whole crew
  "crewSize": number,     // 2-5
  "specialtyCount": number,
  "summary": string       // one friendly paragraph explaining the estimate to the customer
}`;

/** Parses a data URL into { media_type, data }. Returns null if not an image data URL. */
function parseDataUrl(url: string): { media_type: string; data: string } | null {
  const m = url.match(/^data:(image\/[a-zA-Z.+-]+);base64,(.+)$/);
  if (!m) return null;
  return { media_type: m[1], data: m[2] };
}

export async function analyzeMove(input: AnalyzeInput): Promise<MoveAnalysis> {
  if (!aiEnabled()) return heuristicAnalysis(input);

  try {
    const sizeLabel = homeSizes.find((h) => h.value === input.homeSize)?.label ?? "home";
    const content: Anthropic.MessageParam["content"] = [
      {
        type: "text",
        text:
          `Home size: ${sizeLabel}.\n` +
          `Customer description: ${input.itemsDescription || "(none provided)"}\n` +
          `${input.photos?.length ? `${input.photos.length} photo(s) attached below.` : "No photos attached."}`,
      },
    ];

    for (const p of (input.photos || []).slice(0, 8)) {
      const parsed = parseDataUrl(p);
      if (parsed) {
        content.push({
          type: "image",
          source: { type: "base64", media_type: parsed.media_type as "image/jpeg", data: parsed.data },
        });
      }
    }

    const res = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1500,
      system: VISION_SYSTEM,
      messages: [{ role: "user", content }],
    });

    const text = res.content.find((c) => c.type === "text")?.type === "text"
      ? (res.content.find((c) => c.type === "text") as { text: string }).text
      : "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      estimatedVolumeCuFt: Math.round(parsed.estimatedVolumeCuFt) || baseVolumeFor(input.homeSize),
      estimatedWeightLbs:
        Math.round(parsed.estimatedWeightLbs) || Math.round((parsed.estimatedVolumeCuFt || 600) * 7),
      laborHours: parsed.laborHours || 3,
      crewSize: parsed.crewSize || 3,
      specialtyCount: parsed.specialtyCount || 0,
      summary: parsed.summary || "Estimate generated from your photos and description.",
      confidence: "vision",
    };
  } catch (err) {
    console.error("Vision analysis failed, using heuristic:", err);
    return heuristicAnalysis(input);
  }
}
