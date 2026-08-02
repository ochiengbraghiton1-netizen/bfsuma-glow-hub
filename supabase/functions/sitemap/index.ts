import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_BASE_URL = "https://bfsumaroyal.com";

// Static routes — only canonical 200-OK URLs.
const staticRoutes = [
  { path: "/", changefreq: "daily", priority: 1.0 },
  { path: "/products", changefreq: "weekly", priority: 0.9 },
  { path: "/wellness", changefreq: "monthly", priority: 0.8 },
  { path: "/blog", changefreq: "monthly", priority: 0.6 },
  { path: "/business", changefreq: "monthly", priority: 0.6 },
  { path: "/business/blog", changefreq: "monthly", priority: 0.6 },
  { path: "/about", changefreq: "monthly", priority: 0.6 },
  { path: "/join-business", changefreq: "monthly", priority: 0.6 },
  { path: "/contact", changefreq: "monthly", priority: 0.6 },
  { path: "/faq", changefreq: "monthly", priority: 0.6 },
  { path: "/community", changefreq: "monthly", priority: 0.6 },
  { path: "/return-policy", changefreq: "monthly", priority: 0.5 },
  { path: "/terms", changefreq: "monthly", priority: 0.5 },
];

// City landing pages
const cityRoutes = [
  "/nairobi",
  "/mombasa",
  "/kisumu",
  "/nakuru",
  "/kakamega",
  "/eldoret",
  "/thika",
  "/nyeri",
  "/machakos",
  "/kitale",
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generateUrlEntry(loc: string, changefreq: string, priority: number, lastmod?: string): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${escapeXml(loc)}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Static + city entries (no lastmod: no page-specific timestamp available)
    const staticEntries = staticRoutes.map((route) =>
      generateUrlEntry(
        `${SITE_BASE_URL}${route.path === "/" ? "" : route.path}`,
        route.changefreq,
        route.priority,
      ),
    );

    const cityEntries = cityRoutes.map((path) =>
      generateUrlEntry(`${SITE_BASE_URL}${path}`, "monthly", 0.7),
    );

    const [
      { data: products, error: prodError },
      { data: categories, error: catError },
      { data: blogPosts, error: blogError },
      { data: blogCategories, error: blogCatError },
      { data: hubs, error: hubError },
    ] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("is_active", true).order("name"),
      supabase.from("categories").select("slug, updated_at").eq("is_active", true).order("name"),
      supabase
        .from("blog_posts")
        .select("slug, updated_at, published_at, content_type")
        .eq("status", "published")
        .not("published_at", "is", null)
        .order("published_at", { ascending: false }),
      supabase.from("blog_categories").select("slug, created_at").order("name"),
      supabase.from("wellness_hubs").select("slug, updated_at").eq("is_active", true).order("display_order"),
    ]);

    for (const [label, error] of [
      ["products", prodError],
      ["categories", catError],
      ["blog_posts", blogError],
      ["blog_categories", blogCatError],
      ["wellness_hubs", hubError],
    ] as const) {
      if (error) console.error(`Error fetching ${label}:`, error);
    }

    // Products -> /product/:slug
    const productEntries = (products || [])
      .filter((p: any) => p.slug)
      .map((p: any) => generateUrlEntry(`${SITE_BASE_URL}/product/${p.slug}`, "weekly", 0.9, p.updated_at?.split("T")[0]));

    // Categories -> /category/:slug
    const categoryEntries = (categories || [])
      .filter((c: any) => c.slug)
      .map((c: any) => generateUrlEntry(`${SITE_BASE_URL}/category/${c.slug}`, "weekly", 0.7, c.updated_at?.split("T")[0]));

    // Blog posts split by content_type. Slugs preserved; only the path differs.
    const healthBlogEntries: string[] = [];
    const businessBlogEntries: string[] = [];
    (blogPosts || []).forEach((post: any) => {
      if (!post.slug) return;
      const lastmod = (post.updated_at || post.published_at)?.split("T")[0];
      if (post.content_type === "business") {
        businessBlogEntries.push(
          generateUrlEntry(`${SITE_BASE_URL}/business/blog/${post.slug}`, "monthly", 0.8, lastmod),
        );
      } else {
        healthBlogEntries.push(
          generateUrlEntry(`${SITE_BASE_URL}/blog/${post.slug}`, "monthly", 0.8, lastmod),
        );
      }
    });

    // Blog categories -> /blog/category/:slug
    const blogCategoryEntries = (blogCategories || [])
      .filter((c: any) => c.slug)
      .map((c: any) => generateUrlEntry(`${SITE_BASE_URL}/blog/category/${c.slug}`, "weekly", 0.6, c.created_at?.split("T")[0]));

    // Wellness hubs -> /wellness/:slug
    const hubEntries = (hubs || [])
      .filter((h: any) => h.slug)
      .map((h: any) => generateUrlEntry(`${SITE_BASE_URL}/wellness/${h.slug}`, "monthly", 0.8, h.updated_at?.split("T")[0]));

    const allEntries = [
      ...staticEntries,
      ...cityEntries,
      ...hubEntries,
      ...categoryEntries,
      ...productEntries,
      ...healthBlogEntries,
      ...businessBlogEntries,
      ...blogCategoryEntries,
    ].join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=1800, s-maxage=1800",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
