import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "get_product",
  title: "Get product details",
  description:
    "Fetch a single BF SUMA Royal product by its URL slug (e.g. 'arthroxtra'). Returns full description, price (KES), benefit, PV value, and stock.",
  inputSchema: {
    slug: z.string().describe("Product slug as it appears in the URL after /product/."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("products")
      .select("name,slug,price,pv_value,benefit,description,image_url,stock_quantity,sku,is_active")
      .eq("slug", slug)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: `No product found for slug: ${slug}` }], isError: true };
    const url = `https://www.bfsumaroyal.com/product/${data.slug}`;
    return {
      content: [{ type: "text", text: JSON.stringify({ ...data, url }, null, 2) }],
      structuredContent: { product: { ...data, url } },
    };
  },
});
