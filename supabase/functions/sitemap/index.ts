import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/xml; charset=utf-8",
};

const SITE_BASE_URL = "https://bfsumaroyal.com";

// Static routes configuration
const staticRoutes = [
  { path: "/", changefreq: "weekly", priority: 1.0 },
  { path: "/about", changefreq: "monthly", priority: 0.8 },
  { path: "/join-business", changefreq: "monthly", priority: 0.8 },
  { path: "/blog", changefreq: "daily", priority: 0.9 },
  { path: "/contact", changefreq: "monthly", priority: 0.7 },
  { path: "/faq", changefreq: "monthly", priority: 0.7 },
  { path: "/community", changefreq: "weekly", priority: 0.6 },
  { path: "/products", changefreq: "weekly", priority: 0.8 },
  { path: "/category", changefreq: "weekly", priority: 0.7 },
  { path: "/return-policy", changefreq: "monthly", priority: 0.5 },
  { path: "/terms", changefreq: "monthly", priority: 0.5 },
  // Location pages
  { path: "/nairobi", changefreq: "monthly", priority: 0.8 },
  { path: "/mombasa", changefreq: "monthly", priority: 0.8 },
  { path: "/kisumu", changefreq: "monthly", priority: 0.8 },
  { path: "/nakuru", changefreq: "monthly", priority: 0.8 },
  { path: "/kakamega", changefreq: "monthly", priority: 0.8 },
  { path: "/eldoret", changefreq: "monthly", priority: 0.8 },
  { path: "/thika", changefreq: "monthly", priority: 0.8 },
  { path: "/nyeri", changefreq: "monthly", priority: 0.8 },
  { path: "/machakos", changefreq: "monthly", priority: 0.8 },
  { path: "/kitale", changefreq: "monthly", priority: 0.8 },
];

function generateUrlEntry(loc: string, changefreq: string, priority: number, lastmod?: string): string {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "";
  return `  <url>
    <loc>${loc}</loc>${lastmodTag}
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

    const today = new Date().toISOString().split("T")[0];

    // Generate static route entries with lastmod
    const staticEntries = staticRoutes.map((route) => {
      const loc = `${SITE_BASE_URL}${route.path === "/" ? "" : route.path}`;
      return generateUrlEntry(loc, route.changefreq, route.priority, today);
    });

    // Fetch active products from the database
    const { data: products, error } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
    }

    // Generate product URL entries using slug-based URLs
    const productEntries = (products || []).map((product) => {
      const loc = `${SITE_BASE_URL}/product/${product.slug}`;
      const lastmod = product.updated_at?.split("T")[0];
      return generateUrlEntry(loc, "weekly", 0.8, lastmod);
    });

    // Fetch active categories
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, slug, updated_at")
      .eq("is_active", true)
      .order("name");

    if (catError) {
      console.error("Error fetching categories:", catError);
    }

    // Generate category URL entries
    const categoryEntries = (categories || []).map((category) => {
      const loc = `${SITE_BASE_URL}/category/${category.slug}`;
      const lastmod = category.updated_at?.split("T")[0];
      return generateUrlEntry(loc, "weekly", 0.8, lastmod);
    });

    // Fetch published blog posts
    const { data: blogPosts, error: blogError } = await supabase
      .from("blog_posts")
      .select("slug, updated_at, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (blogError) {
      console.error("Error fetching blog posts:", blogError);
    }

    const blogEntries = (blogPosts || []).map((post) => {
      const loc = `${SITE_BASE_URL}/blog/${post.slug}`;
      const lastmod = (post.updated_at || post.published_at)?.split("T")[0];
      return generateUrlEntry(loc, "weekly", 0.7, lastmod);
    });

    // Fetch blog categories
    const { data: blogCategories, error: blogCatError } = await supabase
      .from("blog_categories")
      .select("slug, created_at")
      .order("name");

    if (blogCatError) {
      console.error("Error fetching blog categories:", blogCatError);
    }

    const blogCategoryEntries = (blogCategories || []).map((cat) => {
      const loc = `${SITE_BASE_URL}/blog/category/${cat.slug}`;
      const lastmod = cat.created_at?.split("T")[0];
      return generateUrlEntry(loc, "weekly", 0.6, lastmod);
    });

    // Fetch wellness hubs
    const { data: hubs } = await supabase
      .from("wellness_hubs")
      .select("slug, updated_at")
      .eq("is_active", true)
      .order("display_order");

    const hubEntries = [
      generateUrlEntry(`${SITE_BASE_URL}/wellness`, "weekly", 0.85, today),
      ...((hubs || []).map((h: any) => {
        const loc = `${SITE_BASE_URL}/wellness/${h.slug}`;
        const lastmod = h.updated_at?.split("T")[0];
        return generateUrlEntry(loc, "weekly", 0.85, lastmod);
      })),
    ];

    // Combine all entries
    const allEntries = [...staticEntries, ...hubEntries, ...categoryEntries, ...productEntries, ...blogEntries, ...blogCategoryEntries].join("\n");

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
