import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SITE_URL = "https://bfsumaroyal.com";

const STATIC_PAGES = [
  { path: "/", title: "Homepage", priority: 1.0 },
  { path: "/about", title: "About", priority: 0.8 },
  { path: "/join-business", title: "Join Business", priority: 0.8 },
  { path: "/checkout", title: "Checkout", priority: 0.6 },
  { path: "/auth", title: "Sign In", priority: 0.5 },
  { path: "/blog", title: "Blog", priority: 0.9 },
  { path: "/contact", title: "Contact", priority: 0.7 },
  { path: "/faq", title: "FAQ", priority: 0.7 },
  { path: "/community", title: "Community", priority: 0.7 },
  { path: "/return-policy", title: "Return Policy", priority: 0.5 },
  { path: "/terms", title: "Terms & Conditions", priority: 0.5 },
  { path: "/nairobi", title: "Nairobi", priority: 0.8 },
  { path: "/mombasa", title: "Mombasa", priority: 0.8 },
  { path: "/kisumu", title: "Kisumu", priority: 0.8 },
  { path: "/nakuru", title: "Nakuru", priority: 0.8 },
  { path: "/kakamega", title: "Kakamega", priority: 0.8 },
  { path: "/eldoret", title: "Eldoret", priority: 0.8 },
  { path: "/thika", title: "Thika", priority: 0.8 },
  { path: "/nyeri", title: "Nyeri", priority: 0.8 },
  { path: "/machakos", title: "Machakos", priority: 0.8 },
  { path: "/kitale", title: "Kitale", priority: 0.8 },
];

const EDGE_FUNCTIONS = [
  "sitemap",
  "chat-assistant",
  "create-order",
  "mpesa-stk-push",
  "mpesa-callback",
  "mpesa-query",
  "send-order-confirmation",
  "get-paypal-client-id",
  "indexnow",
  "site-health",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check DB connectivity + get counts
    const [productsRes, blogRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("categories").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);

    const dbConnected = !productsRes.error && !blogRes.error && !categoriesRes.error;

    // Build dynamic page URLs (blog posts with slugs)
    const { data: blogPosts } = await supabase
      .from("blog_posts")
      .select("slug, title")
      .eq("status", "published")
      .limit(100);

    const dynamicBlogPages = (blogPosts || []).map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      title: p.title,
      type: "blog_post",
    }));

    const pages = STATIC_PAGES.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      title: p.title,
      priority: p.priority,
      type: "static",
    }));

    return new Response(
      JSON.stringify({
        status: dbConnected ? "healthy" : "degraded",
        timestamp: new Date().toISOString(),
        database: dbConnected ? "connected" : "error",
        site_url: SITE_URL,
        pages: [...pages, ...dynamicBlogPages],
        dynamic_pages: {
          products: productsRes.count ?? 0,
          blog_posts: blogRes.count ?? 0,
          categories: categoriesRes.count ?? 0,
        },
        edge_functions: EDGE_FUNCTIONS,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ status: "error", message: error.message, timestamp: new Date().toISOString() }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
