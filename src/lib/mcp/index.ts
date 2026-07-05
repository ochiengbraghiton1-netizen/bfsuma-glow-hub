import { defineMcp } from "@lovable.dev/mcp-js";
import searchProducts from "./tools/search-products";
import getProduct from "./tools/get-product";
import listWellnessHubs from "./tools/list-wellness-hubs";
import listBlogPosts from "./tools/list-blog-posts";

export default defineMcp({
  name: "bfsuma-royal-mcp",
  title: "BF SUMA Royal MCP",
  version: "0.1.0",
  instructions:
    "Tools for exploring the BF SUMA Royal wellness catalog. Use `search_products` to find supplements by keyword, `get_product` for full details of one product by slug, `list_wellness_hubs` for health-goal hub pages, and `list_blog_posts` for recent published articles. All prices are in KES.",
  tools: [searchProducts, getProduct, listWellnessHubs, listBlogPosts],
});
