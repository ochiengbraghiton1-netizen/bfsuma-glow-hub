import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const badRequest = (error: string) =>
    new Response(JSON.stringify({ error }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return badRequest("Invalid JSON body");
    }
    if (!body || typeof body !== "object") return badRequest("Invalid request body");

    const { messages, action, pageContext } = body as {
      messages?: unknown;
      action?: unknown;
      pageContext?: unknown;
    };

    // Either a valid messages array or a valid action string is required.
    const hasAction = typeof action === "string" && action.trim().length > 0;
    const validMessages =
      Array.isArray(messages) &&
      messages.length > 0 &&
      messages.every(
        (m: any) =>
          m && typeof m === "object" &&
          typeof m.role === "string" &&
          ["user", "assistant", "system"].includes(m.role) &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      );

    if (!hasAction && !validMessages) {
      return badRequest(
        "`messages` must be a non-empty array of { role: 'user'|'assistant'|'system', content: string }, or provide an `action`."
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch products for context
    const { data: products } = await supabase
      .from("products")
      .select("name, price, benefit")
      .eq("is_active", true)
      .order("name")
      .limit(50);

    // Fetch categories
    const { data: categories } = await supabase
      .from("categories")
      .select("name")
      .eq("is_active", true);

    // Fetch FAQ-like content
    const { data: siteContent } = await supabase
      .from("site_content")
      .select("section_key, title, content")
      .limit(20);

    // Live promotions
    const nowIso = new Date().toISOString();
    const { data: promotions } = await supabase
      .from("promotions")
      .select("code, name, description, discount_type, discount_value, min_order_amount, start_date, end_date")
      .eq("is_active", true)
      .limit(10);

    // Live leadership / team profiles
    const { data: team } = await supabase
      .from("team_profiles")
      .select("name, role, bio")
      .eq("is_active", true)
      .order("display_order")
      .limit(10);

    const productList = (products || []).map(p => `- ${p.name}: KSh ${Number(p.price).toLocaleString()} — ${p.benefit || 'Premium wellness supplement'}`).join("\n");
    const categoryList = (categories || []).map(c => c.name).join(", ");

    const activePromos = (promotions || []).filter(p => {
      const startsOk = !p.start_date || p.start_date <= nowIso;
      const endsOk = !p.end_date || p.end_date >= nowIso;
      return startsOk && endsOk;
    });
    const promoList = activePromos.length
      ? activePromos.map(p => {
          const value = p.discount_type === "percentage"
            ? `${Number(p.discount_value)}% off`
            : `KSh ${Number(p.discount_value).toLocaleString()} off`;
          const min = p.min_order_amount ? ` (minimum order KSh ${Number(p.min_order_amount).toLocaleString()})` : "";
          return `- Code ${p.code}: ${p.name} — ${value}${min}`;
        }).join("\n")
      : "No active promotions right now.";

    const teamList = (team || []).length
      ? (team || []).map(t => `- ${t.name}, ${t.role}${t.bio ? `: ${t.bio}` : ""}`).join("\n")
      : "Local mentorship team based in Kakamega, Kenya.";

    const siteContentList = (siteContent || [])
      .map(s => `- ${s.title || s.section_key}: ${(s.content || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400)}`)
      .join("\n");

    const contextLine = typeof pageContext === "string" && pageContext.trim().length > 0
      ? `\nVISITOR IS CURRENTLY ON THIS PAGE: ${pageContext.trim().slice(0, 200)}\nTailor your answer to that page when it is relevant.\n`
      : "";

    const systemPrompt = `You are the BF SUMA Royal website assistant. You help visitors learn about wellness products, pricing, and the BF SUMA business opportunity.

BUSINESS INFO:
- Name: BF SUMA Royal
- Location: Kakamega, Kenya (serving all 47 counties)
- Phone/WhatsApp: +254 795 454053
- Email: bfsumaroyal@gmail.com
- Website: bfsumaroyal.com
${contextLine}
PRODUCT CATALOG (current prices in KSh):
${productList}

CATEGORIES: ${categoryList}

ACTIVE PROMOTIONS:
${promoList}

LEADERSHIP AND MENTORSHIP TEAM:
${teamList}

SITE CONTENT:
${siteContentList}

BUSINESS OPPORTUNITY (accurate official details):
- Joining costs KES 7,000 in total: a KES 3,000 Starter Kit (wellness guide, product overview, branded bag, starter product) plus KES 4,000 Product Activation, which is about 20 PV of real stock you can use yourself or sell. The KES 4,000 is stock, not a fee.
- Day-One advantage: because activation gives about 20 PV, a new member starts at 2 Star with a 5% Overriding Performance Bonus.
- Star progression: 1 Star (starter kit), 2 Star (CGV 0+, personal 20 PV+, 5%), 3 Star (CGV 300+, 20 PV+, 9%), 4 Star (1,000+, 30 PV+, 13%), 5 Star (5,000+, 40 PV+, 17%), 6 Star (8,000+, 50 PV+, 22%), 7 Star (12,000+, 50 PV+, 28%). Leader ranks run Silver Leader through Senior Crown Leader with Leader Development Bonus from 5% up to 25%.
- Eight earning routes: retail profit (about 20%), Overriding Performance Bonus (up to 28%), Leader Development Bonus (up to 25%), Leadership Status Bonus (6.5%), Leader Growth Bonus (3%), National Performance Fund (7.5%, includes the 4 Star and 7 Star Special Support), Senior Special Status Bonus (up to 6%), plus Trip and Car Awards.
- First cash milestone: the US$50 4 Star Special Support Award, typically reached in about 60 to 90 days with consistent activity.
- Glossary: PV is Point Value, PPV is personal point value, CGV is cumulative group volume, PGV is personal group volume.
- Members must stay active each month to qualify for bonuses. Results vary by effort; never promise guaranteed income.
- Mentorship and onboarding happen locally in Kakamega and over WhatsApp.

ORDERS, DELIVERY AND RETURNS:
- Orders are completed over WhatsApp (+254 795 454053) with M-Pesa, or by card through the secure PayPal option on the site.
- Delivery: same day in Kakamega and Nairobi where possible, typically 24 to 48 hours to other counties. Shipping fees depend on the delivery location and are shown at checkout.
- Returns: unopened, sealed products in original packaging can be exchanged or credited within 72 hours of delivery. Opened supplements cannot be returned for hygiene and safety reasons.

GUIDELINES:
- Be professional, warm, and helpful.
- Always reference actual products, prices, and promotions from the live data above.
- Use the business opportunity, delivery, and returns details above exactly; never invent figures.
- Direct users to WhatsApp (+254 795 454053) for personalized assistance or to place an order.
- Keep responses concise (2-4 sentences) unless the user asks for detail.
- Never mention competitor products or make medical claims.
- Do NOT include any medical disclaimers in your responses. Focus on benefits and helping the customer.
- IMPORTANT: Do NOT use markdown formatting like **bold**, *italic*, or any special symbols. Use plain text only. No asterisks, no hashtags for headers. Write naturally as if you're chatting.`;

    // For quick reply actions, generate a focused response
    let userMessages: Array<{ role: string; content: string }> = validMessages
      ? (messages as Array<{ role: string; content: string }>)
      : [];
    if (hasAction) {
      const actionPrompts: Record<string, string> = {
        products: "Tell me about your product catalog. What wellness products do you offer?",
        prices: "Show me your current product prices and price list.",
        join: "Tell me about the BF SUMA Royal business opportunity and how I can join as a distributor.",
        contact: "What are your contact details, business address, and how can I reach you?",
        health_issue:
          "I have a health concern I would like help with. Ask me what my main concern is, then recommend suitable BF SUMA Royal products from the catalog.",
      };
      const key = (action as string).trim();
      userMessages = [{ role: "user", content: actionPrompts[key] || key }];
    }


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          ...userMessages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "We're experiencing high traffic. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Assistant is temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
