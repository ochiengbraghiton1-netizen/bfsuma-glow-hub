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

    const { messages, action } = body as {
      messages?: unknown;
      action?: unknown;
    };

    // Either a valid `messages` array or a valid `action` string is required.
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

    const productList = (products || []).map(p => `- ${p.name}: KSh ${Number(p.price).toLocaleString()} — ${p.benefit || 'Premium wellness supplement'}`).join("\n");
    const categoryList = (categories || []).map(c => c.name).join(", ");

    const systemPrompt = `You are the BF SUMA Royal website assistant. You help visitors learn about wellness products, pricing, and the BF SUMA business opportunity.

BUSINESS INFO:
- Name: BF SUMA Royal
- Location: Kakamega, Kenya
- Phone/WhatsApp: +254 795 454053
- Email: bfsumaroyal@gmail.com
- Website: bfsumaroyal.com

PRODUCT CATALOG (current prices in KSh):
${productList}

CATEGORIES: ${categoryList}

GUIDELINES:
- Be professional, warm, and helpful.
- Always reference actual products and prices from the catalog above.
- For business opportunity inquiries, explain that BF SUMA Royal offers a distributor program where members earn PV (Point Value), commissions, bonuses, and rewards by selling health supplements.
- Direct users to WhatsApp (+254 795 454053) for personalized assistance.
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
