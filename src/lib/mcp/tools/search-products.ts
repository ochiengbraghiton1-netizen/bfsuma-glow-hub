import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "search_products",
  title: "Search products",
  description:
    "Search the BF SUMA Royal supplement catalog by keyword. Returns matching active products with name, slug, price (KES), benefit, and stock status.",
  inputSchema: {
    query: z.string().describe("Keyword to match against product name, benefit, or description. Use empty string to list all."),
    limit: z.number().int().min(1).max(50).optional().describe("Max results (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, limit }) => {
    const supabase = getPublicSupabase();
    const max = limit ?? 10;
    let q = supabase
      .from("products")
      .select("name,slug,price,benefit,description,stock_quantity,sku")
      .eq("is_active", true)
      .limit(max);
    if (query.trim()) {
      const pattern = `%${query.trim()}%`;
      q = q.or(`name.ilike.${pattern},benefit.ilike.${pattern},description.ilike.${pattern}`);
    }
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
