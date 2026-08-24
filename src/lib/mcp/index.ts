import { defineMcp, auth } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listWellnessHubs from "./tools/list-wellness-hubs";
import listBlogPosts from "./tools/list-blog-posts";

const SUPABASE_URL = "https://sboaeutgckyiwunfmxqp.supabase.co";

export default defineMcp({
  name: "bfsuma-royal-mcp",
  title: "BF SUMA Royal MCP",
  version: "0.1.0",
  instructions:
    "Tools for exploring the BF SUMA Royal wellness catalog. Use `search_products` to find supplements by keyword, `get_product` for full details of one product by slug, `list_wellness_hubs` for health-goal hub pages, and `list_blog_posts` for recent published articles. All prices are in KES.",
  // Require a verified OAuth bearer token on every MCP request. Anonymous
  // callers get a 401 with the RFC 9728 protected-resource challenge.
  auth: auth.oauth.issuer({
    issuer: `${SUPABASE_URL}/auth/v1`,
    resource: `${SUPABASE_URL}/functions/v1/mcp`,
    acceptedAudiences: ["authenticated"],
    resourceName: "BF SUMA Royal MCP",
  }),
  tools: [searchProducts, getProduct, listWellnessHubs, listBlogPosts],
});
