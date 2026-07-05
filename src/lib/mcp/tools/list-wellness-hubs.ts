import { defineTool } from "@lovable.dev/mcp-js";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "list_wellness_hubs",
  title: "List wellness hubs",
  description:
    "List all active wellness hub pages (health goal categories such as Joint Pain, Sleep & Recovery). Returns name, slug, and hero description.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("wellness_hubs")
      .select("name,slug,hero_title,hero_description")
      .eq("is_active", true)
      .order("display_order", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const hubs = (data ?? []).map((h) => ({ ...h, url: `https://www.bfsumaroyal.com/wellness/${h.slug}` }));
    return {
      content: [{ type: "text", text: JSON.stringify(hubs, null, 2) }],
      structuredContent: { hubs },
    };
  },
});
