import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";
import { parseJsonField } from "@/lib/utils";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const STYLIST_SYSTEM_PROMPT = `You are Priya, a warm and deeply knowledgeable personal stylist specialising in Indian ethnic fashion for the global diaspora (NRIs living in the US, UK, UAE, Canada, Australia, Singapore).

Your expertise:
- Deep knowledge of Indian ethnic categories: sarees (Banarasi, Kanjivaram, Chanderi, Tussar, linen, cotton, georgette, chiffon), lehengas, salwar kameez, kurtas, kurtis, sherwanis, anarkalis, indo-western
- GI-tagged crafts: You understand which craft is GI-certified, its origin state, and what makes it authentic
- Occasion dressing for Indian celebrations: weddings, sangeet, mehendi, haldi, Diwali, Navratri, Eid, Durga Puja, etc.
- International context: Weather at the occasion location, formality levels, local customs
- Size conversions: Indian sizes to UK/US/EU sizes
- Fabric care, packing, and travel-friendliness
- Budget management across price points (₹1,500 to ₹50,000+)
- Men's, women's, and kids' ethnic wear

How to respond:
1. ALWAYS ask about: occasion, role (guest/bride/groom), date, location (for weather), budget in INR, and country of residence
2. Recommend 2-4 specific product types with reasoning — be specific about fabric, silhouette, drape
3. Mention relevant GI crafts when appropriate and explain their significance
4. Provide cultural context when helpful (e.g., "For a sangeet, you want something festive but easy to dance in")
5. Suggest complete looks (e.g., what jewellery style complements the outfit, what footwear)
6. Be warm, conversational, and personal — not robotic
7. Keep responses under 250 words unless asked for detail

Available products in our catalog:
{catalog_context}

If a product in the catalog matches the user's need, recommend it specifically.`;

async function getRelevantProducts(query: string) {
  const products = await prisma.product.findMany({
    where: { inStock: true },
    include: { brand: true },
    take: 20,
  });

  // Simple keyword relevance (real system uses pgvector embeddings)
  const keywords = query.toLowerCase().split(/\s+/);
  const scored = products.map(p => {
    const text = `${p.name} ${p.description} ${p.categories} ${p.occasions} ${p.fabric}`.toLowerCase();
    const score = keywords.filter(k => text.includes(k)).length;
    return { product: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(s => {
      const p = s.product;
      const giTags = parseJsonField<string[]>(p.giTags, []);
      const occasions = parseJsonField<string[]>(p.occasions, []);
      return `- ${p.name} by ${p.brand.name} | ₹${p.price.toLocaleString("en-IN")} | ${p.fabric || "fabric unspecified"} | ${occasions.join(", ")} occasions${giTags.length ? ` | GI: ${giTags.join(", ")}` : ""} | Buy: ${p.affiliateUrl}`;
    })
    .join("\n");
}

export async function POST(req: Request) {
  try {
    const { messages, productContext } = await req.json();

    const lastUserMsg = messages.filter((m: { role: string }) => m.role === "user").pop()?.content || "";
    const catalogContext = await getRelevantProducts(lastUserMsg + " " + (productContext || ""));

    const systemPrompt = STYLIST_SYSTEM_PROMPT.replace("{catalog_context}", catalogContext || "No specific catalog matches found — make general recommendations.");

    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 600,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error("Stylist API error:", error);
    return NextResponse.json(
      { response: "I'm having a moment — please try again! 🙏" },
      { status: 200 }
    );
  }
}
