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
  { path: "/checkout", changefreq: "monthly", priority: 0.6 },
  { path: "/auth", changefreq: "monthly", priority: 0.5 },
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

    // Generate static route entries
    const staticEntries = staticRoutes.map((route) => {
      const loc = `${SITE_BASE_URL}${route.path === "/" ? "" : route.path}`;
      return generateUrlEntry(loc, route.changefreq, route.priority);
    });

    // Fetch active products from the database
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, updated_at")
      .eq("is_active", true)
      .order("name");

    if (error) {
      console.error("Error fetching products:", error);
    }

    // Generate product URL entries
    const productEntries = (products || []).map((product) => {
      // Create URL-friendly slug from product name
      const slug = product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const loc = `${SITE_BASE_URL}/product/${product.id}`;
      const lastmod = product.updated_at?.split("T")[0];
      return generateUrlEntry(loc, "weekly", 0.7, lastmod);
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

    // Combine all entries
    const allEntries = [...staticEntries, ...categoryEntries, ...productEntries].join("\n");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allEntries}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
});
