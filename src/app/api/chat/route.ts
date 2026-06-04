import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface ChatRequest {
  message: string;
  locale?: string;
}

interface ProductResult {
  code: string;
  description: string;
  names: { pt?: string; en?: string; ar?: string } | null;
  image: string | null;
  price: number | null;
  prices: Record<string, number> | null;
  category: string;
  type: string;
  includes: string[];
}

// ─── Keyword intelligence ──────────────────────────────────────────
const INTENT_MAP: Record<string, { categories: string[]; keywords: string[]; reply: string }> = {
  vip: {
    categories: ["vip-sets"],
    keywords: ["vip", "luxury", "premium", "executive", "فخم", "في اي بي", "luxo", "premium"],
    reply: "Here are our premium VIP gift sets — perfect for executives and special clients! ⭐",
  },
  cork: {
    categories: ["cork-eco"],
    keywords: ["cork", "eco", "sustainable", "green", "كورك", "بيئي", "cortiça", "ecológico"],
    reply: "Check out our eco-friendly cork collection — sustainable and stylish! 🌿",
  },
  notebook: {
    categories: ["notebooks-premium", "notebooks-usb"],
    keywords: ["notebook", "notepad", "journal", "diary", "usb", "دفتر", "نوت", "caderno"],
    reply: "Here are our best notebooks — some even come with USB drives! 📓",
  },
  tech: {
    categories: ["tech-gifts"],
    keywords: ["tech", "technology", "gadget", "electronic", "power bank", "charger", "تقنية", "تكنولوجيا", "tecnologia"],
    reply: "Tech gifts that impress! Here are our latest gadgets 🔌",
  },
  pen: {
    categories: ["pens-writing"],
    keywords: ["pen", "writing", "قلم", "أقلام", "caneta", "escrever"],
    reply: "Great choice! Here are our premium pens and writing instruments ✒️",
  },
  business: {
    categories: ["business-gifts", "corporate-sets"],
    keywords: ["business", "corporate", "office", "company", "employee", "gift", "هدايا", "شركات", "موظفين", "empresarial", "corporativo"],
    reply: "Professional business gifts for your team! Here are our top picks 💼",
  },
  promotional: {
    categories: ["promotional"],
    keywords: ["promotional", "promo", "cheap", "bulk", "quantity", "دعائي", "ترويجي", "promocional"],
    reply: "Budget-friendly promotional items — great for large quantities! 📦",
  },
  set: {
    categories: ["vip-sets", "corporate-sets"],
    keywords: ["set", "kit", "bundle", "combo", "طقم", "مجموعة", "conjunto", "kit"],
    reply: "Gift sets are always a hit! Here are our curated bundles 🎁",
  },
};

function detectIntent(message: string): { categories: string[]; reply: string } | null {
  const lower = message.toLowerCase();
  for (const intent of Object.values(INTENT_MAP)) {
    if (intent.keywords.some((kw) => lower.includes(kw))) {
      return { categories: intent.categories, reply: intent.reply };
    }
  }
  return null;
}

// ─── Smart greeting detection ──────────────────────────────────────
const GREETINGS = ["hi", "hello", "hey", "مرحبا", "اهلا", "السلام", "olá", "oi", "bom dia", "boa tarde"];
function isGreeting(msg: string): boolean {
  const lower = msg.toLowerCase().trim();
  return GREETINGS.some((g) => lower.startsWith(g)) || lower.length < 4;
}

// ─── Logo-related detection ────────────────────────────────────────
const LOGO_KEYWORDS = ["logo", "brand", "mockup", "preview", "لوجو", "شعار", "logotipo", "marca"];
function isLogoRequest(msg: string): boolean {
  return LOGO_KEYWORDS.some((kw) => msg.toLowerCase().includes(kw));
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ reply: "Please type a message!", products: [] });
    }

    // 1. Greeting
    if (isGreeting(message)) {
      return NextResponse.json({
        reply: "Hello! 👋 Welcome to Coroa Cósmica! I can help you find the perfect corporate gifts. Tell me what you're looking for — VIP sets, notebooks, tech gadgets, eco-friendly items, or anything else!",
        products: [],
        action: "greeting",
      });
    }

    // 2. Logo request
    if (isLogoRequest(message)) {
      return NextResponse.json({
        reply: "Great idea! 🎨 Upload your company logo using the 📎 button below, then pick any product — I'll show you a preview of how your logo would look on it!",
        products: [],
        action: "logo_prompt",
      });
    }

    // 3. Product search by intent
    const intent = detectIntent(message);
    if (intent) {
      const { data: products } = await supabase
        .from("products")
        .select("code, description, names, image, price, prices, category, type, includes")
        .in("category", intent.categories)
        .limit(6);

      return NextResponse.json({
        reply: intent.reply,
        products: products || [],
        action: "products",
      });
    }

    // 4. General search (fallback — search by text in code/description)
    const { data: searchResults } = await supabase
      .from("products")
      .select("code, description, names, image, price, prices, category, type, includes")
      .or(`description.ilike.%${message}%,code.ilike.%${message}%`)
      .limit(6);

    if (searchResults && searchResults.length > 0) {
      return NextResponse.json({
        reply: `I found ${searchResults.length} product(s) matching "${message}" 🔍`,
        products: searchResults,
        action: "products",
      });
    }

    // 5. Nothing found — suggest categories
    return NextResponse.json({
      reply: `I couldn't find exact matches for "${message}" 🤔 Try asking about:\n• **VIP gift sets** — luxury executive gifts\n• **Cork/Eco** — sustainable products\n• **Notebooks** — premium journals with USB\n• **Tech gadgets** — power banks, chargers\n• **Pens** — premium writing instruments\n• **Business gifts** — corporate branding items\n\nOr just describe what you need! 😊`,
      products: [],
      action: "suggest",
    });
  } catch (err) {
    console.error("Chat API error:", err);
    return NextResponse.json({
      reply: "Sorry, something went wrong. Please try again! 🙏",
      products: [],
    });
  }
}
