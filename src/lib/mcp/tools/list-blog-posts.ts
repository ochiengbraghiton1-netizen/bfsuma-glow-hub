import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getPublicSupabase } from "../supabase";

export default defineTool({
  name: "list_blog_posts",
  title: "List blog posts",
  description:
    "List published BF SUMA Royal blog posts. Returns title, slug, excerpt, and published date. Newest first.",
  inputSchema: {
    limit: z.number().int().min(1).max(50).optional().describe("Max posts to return (default 10)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }) => {
    const supabase = getPublicSupabase();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("title,slug,excerpt,published_at,featured_image")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit ?? 10);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const posts = (data ?? []).map((p) => ({ ...p, url: `https://www.bfsumaroyal.com/blog/${p.slug}` }));
    return {
      content: [{ type: "text", text: JSON.stringify(posts, null, 2) }],
      structuredContent: { posts },
    };
  },
});
