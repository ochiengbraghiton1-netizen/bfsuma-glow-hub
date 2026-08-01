// SEO renderer: fetches the static SPA shell (index.html) and rewrites
// per-route <title>, meta, canonical, OG/Twitter, JSON-LD and the visible
// SEO fallback block so crawlers receive unique signals on the first byte.
//
// React still hydrates and runs identically — this only swaps strings inside
// the shell before serving.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const SITE = "https://bfsumaroyal.com";
const SHELL_URL = `${SITE}/index.html`;
const DEFAULT_OG = `${SITE}/og-image.png`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory shell cache (per-isolate).
let shellCache: { html: string; fetchedAt: number } | null = null;
const SHELL_TTL_MS = 5 * 60 * 1000;

async function getShell(): Promise<string> {
  if (shellCache && Date.now() - shellCache.fetchedAt < SHELL_TTL_MS) {
    return shellCache.html;
  }
  const res = await fetch(SHELL_URL, { headers: { "x-seo-render": "1" } });
  const html = await res.text();
  shellCache = { html, fetchedAt: Date.now() };
  return html;
}

interface Meta {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: string;
  h1: string;
  body: string; // inner HTML for the SEO fallback block
  jsonLd?: object[];
  noindex?: boolean;
}

const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…");
const stripHtml = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const buildWhatsAppUrl = (message: string) =>
  `https://wa.me/254795454053?text=${encodeURIComponent(message)}`;

const getProductDisplayName = (slug: string, name: string) =>
  slug === "arthroxtra" ? "ArthroXtra Tablets" : name;

const buildProductIngredients = (slug: string, plainDescription: string) => {
  if (slug === "arthroxtra") {
    return ["Glucosamine", "Chondroitin", "joint-support nutrients"];
  }

  const match = plainDescription.match(/(?:combining|with|includes?|contains?)\s+([^.;:]+)(?:[.;:]|$)/i);
  if (!match) return ["BF SUMA Royal quality-assured wellness ingredients"];

  return match[1]
    .split(/,| and /i)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 6);
};

// ---- Static route map -------------------------------------------------------

const staticMeta: Record<string, Omit<Meta, "canonical">> = {
  "/": {
    title: "BF SUMA Royal | Premium Supplements in Kenya for Energy & Immunity",
    description:
      "Shop trusted natural supplements in Kenya. Boost energy, improve immunity, and support your health with BF SUMA Royal premium wellness products.",
    h1: "BF SUMA Royal — Premium Health Supplements Kenya",
    body: `<p>Premium natural supplements to support immunity, energy and wellness. GMP, ISO and Halal certified. Order via WhatsApp for fast delivery across Kenya.</p>`,
  },
  "/about": {
    title: "About BF SUMA Royal Kenya | Our Journey Since 2006",
    description:
      "Discover BF SUMA Royal's journey from Los Angeles (2006) to a global wellness brand in 15+ countries. GMP, ISO, and Halal certified supplements.",
    h1: "About BF SUMA Royal Kenya",
    body: `<p>Founded in Los Angeles in 2006, BF SUMA Royal is a global wellness brand serving 15+ countries. Our supplements are GMP, ISO 22000, Halal and FDA certified.</p>`,
  },
  "/join-business": {
    title: "Join BF SUMA Royal Business Kenya | Earn with Wellness",
    description:
      "Start your BF SUMA Royal distributor business in Kenya for KES 7,000. Earn commissions selling natural supplements. Register today!",
    h1: "Join the BF SUMA Royal Business in Kenya",
    body: `<p>Become a BF SUMA Royal distributor in Kenya for a one-time KES 7,000 fee. Earn through retail margins, team bonuses and leadership rewards.</p>`,
  },
  "/business/blog": {
    title: "Business & Opportunity Blog | BF SUMA Royal Kenya",
    description:
      "Real stories, income insights and honest advice about building a wellness business with BF SUMA Royal in Kenya.",
    h1: "BF SUMA Royal Business & Opportunity Blog",
    body: `<p>Real distributor stories, income insights, training and honest advice about building a wellness business with BF SUMA Royal in Kenya.</p>`,
  },
  "/blog": {
    title: "Health & Wellness Blog | BF SUMA Royal Kenya",
    description:
      "Read expert health tips, supplement guides, and wellness advice from BF SUMA Royal Kenya. Stay informed and shop natural products.",
    h1: "BF SUMA Royal Health & Wellness Blog",
    body: `<p>Expert health tips, supplement guides and wellness advice for Kenyans — covering immunity, joint care, energy, hormones and healthy aging.</p>`,
  },
  "/contact": {
    title: "Contact BF SUMA Royal | Orders & Support Kenya",
    description:
      "Reach BF SUMA Royal Kenya via WhatsApp, email, or visit us in Kakamega. Get fast support for orders, products, and business inquiries.",
    h1: "Contact BF SUMA Royal Kenya",
    body: `<p>Reach our team in Kakamega via WhatsApp +254 795 454 053 or email bfsumaroyal@gmail.com for orders, product advice and distributor support.</p>`,
  },
  "/faq": {
    title: "FAQ | BF SUMA Royal Kenya - Common Questions",
    description:
      "Get answers about BF SUMA Royal supplements, distributor program, and business opportunity in Kenya. Start your wellness journey today.",
    h1: "Frequently Asked Questions — BF SUMA Royal Kenya",
    body: `<p>Common questions about BF SUMA Royal supplements, ordering, delivery, certifications and the distributor business opportunity in Kenya.</p>`,
  },
  "/community": {
    title: "Community | BF SUMA Royal Kenya Stories",
    description:
      "Real testimonials and success stories from BF SUMA Royal users in Kenya. See how our supplements transform health and build businesses.",
    h1: "BF SUMA Royal Community Stories",
    body: `<p>Real wellness and business success stories from BF SUMA Royal members across Kenya — from Nairobi to Mombasa, Kakamega and beyond.</p>`,
  },
  "/products": {
    title: "Shop Natural Supplements in Kenya | BF SUMA Royal",
    description:
      "Browse the full BF SUMA Royal product catalogue: immunity, joint care, energy, hormones, weight & more. Fast nationwide delivery in Kenya.",
    h1: "BF SUMA Royal Products",
    body: `<p>Browse our full catalogue of GMP-certified natural supplements for immunity, joint health, energy, hormones, weight management and healthy aging.</p>`,
  },
  "/category": {
    title: "Product Categories | BF SUMA Royal Kenya",
    description:
      "Explore BF SUMA Royal supplement categories — joints, immunity, women's wellness, energy, weight & detox. Quality natural products in Kenya.",
    h1: "Browse Product Categories",
    body: `<p>Explore BF SUMA Royal supplement categories: joint care, immune support, women's wellness, energy, weight management and digestive health.</p>`,
  },
  "/return-policy": {
    title: "Return & Exchange Policy | BF SUMA Royal Kenya",
    description:
      "BF SUMA Royal's return and exchange policy. Request exchanges within 72 hours. Covers online and international orders with hassle-free process.",
    h1: "Return & Exchange Policy",
    body: `<p>Our 72-hour return and exchange policy for BF SUMA Royal physical goods, including online and international orders.</p>`,
  },
  "/terms": {
    title: "Terms & Conditions | BF SUMA Royal Kenya",
    description:
      "Read the Terms & Conditions for using BF SUMA Royal website and services. Covers accounts, billing, shipping, and dispute resolution under Kenyan law.",
    h1: "Terms & Conditions",
    body: `<p>The Terms & Conditions governing use of the BF SUMA Royal website, online ordering, distributor accounts and dispute resolution under Kenyan law.</p>`,
  },
};

const cityMeta: Record<string, { title: string; description: string }> = {
  nairobi: {
    title: "Health Supplements in Nairobi Kenya | BF Suma Royal",
    description:
      "Buy premium health supplements in Nairobi, Kenya. Boost energy, immunity & wellness with BF Suma Royal. Fast delivery within 24 hours. Order now!",
  },
  mombasa: {
    title: "Health Supplements in Mombasa Kenya | BF Suma Royal",
    description:
      "Buy natural health supplements in Mombasa, Kenya. Stay hydrated & energized in the coastal climate. Fast 1-2 day delivery. Order via WhatsApp!",
  },
  kisumu: {
    title: "Health Supplements in Kisumu Kenya | BF Suma Royal",
    description:
      "Buy health supplements in Kisumu, Kenya. Boost immunity & energy by Lake Victoria. Fast 1-2 day delivery across Kisumu County. Order today!",
  },
  nakuru: {
    title: "Health Supplements in Nakuru Kenya | BF Suma Royal",
    description:
      "Buy wellness supplements in Nakuru, Kenya. Strengthen immunity in the Rift Valley climate. Fast 1-2 day delivery. Order via WhatsApp now!",
  },
  kakamega: {
    title: "Health Supplements in Kakamega Kenya | BF Suma Royal",
    description:
      "Buy health supplements in Kakamega, Kenya — our home base. Same-day delivery! Boost energy & wellness naturally. Order via WhatsApp today!",
  },
  eldoret: {
    title: "Health Supplements in Eldoret Kenya | BF Suma Royal",
    description:
      "Buy health supplements in Eldoret, Kenya. Fuel your active highland lifestyle with premium wellness products. Fast 1-2 day delivery. Order now!",
  },
  thika: {
    title: "Health Supplements in Thika Kenya | BF Suma Royal",
    description:
      "Buy natural health supplements in Thika, Kenya. Boost energy & immunity near the Superhighway. Fast 24-hour delivery. Order via WhatsApp!",
  },
  nyeri: {
    title: "Health Supplements in Nyeri Kenya | BF Suma Royal",
    description:
      "Buy premium supplements in Nyeri, Kenya. Support your highland wellness with joint care & immunity boosters. Fast 1-2 day delivery. Order today!",
  },
  machakos: {
    title: "Health Supplements in Machakos Kenya | BF Suma Royal",
    description:
      "Buy wellness supplements in Machakos, Kenya. Boost immunity & energy in the semi-arid climate. Fast 24-hour delivery. Order via WhatsApp!",
  },
  kitale: {
    title: "Health Supplements in Kitale Kenya | BF Suma Royal",
    description:
      "Buy natural supplements in Kitale, Kenya. Support your farming lifestyle with joint care & immune boosters. Delivery in 2-3 days. Order now!",
  },
};

// Routes that should not be indexed (logged-in / transactional)
const noIndexPrefixes = [
  "/auth",
  "/admin",
  "/account",
  "/affiliate",
  "/distributor",
  "/checkout",
  "/order-",
  "/my-orders",
  "/forgot-password",
  "/reset-password",
];

// ---- Meta builders ----------------------------------------------------------

async function buildMeta(pathname: string, supabase: ReturnType<typeof createClient>): Promise<Meta> {
  const canonical = `${SITE}${pathname === "/" ? "" : pathname}`;

  if (noIndexPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return {
      title: "BF SUMA Royal Kenya",
      description: "BF SUMA Royal account area.",
      canonical,
      h1: "BF SUMA Royal",
      body: "<p>Loading…</p>",
      noindex: true,
    };
  }

  // /product/:slug
  const productMatch = pathname.match(/^\/product\/([^\/]+)$/);
  if (productMatch) {
    const slug = decodeURIComponent(productMatch[1]);
    const { data } = await supabase
      .from("products")
      .select("id,name,slug,price,benefit,description,image_url,sku,stock_quantity,track_inventory")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (!data) {
      return {
        title: "Product Not Found | BF SUMA Royal Kenya",
        description: "This product is unavailable. Browse all BF SUMA Royal natural supplements in Kenya.",
        canonical,
        h1: "Product Not Found",
        body: `<p>Sorry, this product is unavailable. <a href="/products">Browse all products</a>.</p>`,
        noindex: true,
      };
    }

    const plain = stripHtml(data.description || "");
    const displayName = getProductDisplayName(data.slug, data.name);
    const ingredients = buildProductIngredients(data.slug, plain);
    const desc = truncate(
      data.slug === "arthroxtra"
        ? "ArthroXtra Tablets support joint comfort, flexibility, cartilage wellness, and smoother everyday movement. Order in Kenya from BF SUMA Royal."
        : data.benefit
          ? `${displayName} – ${data.benefit}. Top-rated natural supplement in Kenya. Fast delivery. Order now at BF SUMA Royal.`
          : plain || `Buy ${displayName} in Kenya. Effective natural health supplement with fast nationwide delivery.`,
      160,
    );
    const isOOS = data.track_inventory && (data.stock_quantity ?? 0) <= 0;
    const title = data.slug === "arthroxtra"
      ? "ArthroXtra Tablets — Joint Support Supplement Kenya | BF SUMA Royal"
      : truncate(`Buy ${displayName} in Kenya | BF SUMA Royal`, 60);
    const whatsappUrl = buildWhatsAppUrl(`Hi BF SUMA Royal, I want to order ${displayName} from ${canonical}`);

    return {
      title,
      description: desc,
      canonical,
      ogImage: data.image_url || DEFAULT_OG,
      ogType: "product",
      h1: displayName,
      body: `
        <p>${escapeHtml(data.benefit || plain || `${displayName} natural supplement.`)}</p>
        <p><strong>Price:</strong> KSh ${Number(data.price).toLocaleString()}</p>
        <p><strong>Ingredients:</strong> ${ingredients.map(escapeHtml).join(", ")}.</p>
        <p>${escapeHtml(plain).slice(0, 700)}</p>
        <p><a href="${whatsappUrl}" rel="nofollow">Order ${escapeHtml(displayName)} on WhatsApp</a></p>
        <p><a href="/products">View all products</a> · <a href="/contact">Contact us</a></p>`,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: displayName,
          description: desc,
          image: [data.image_url || DEFAULT_OG],
          sku: data.sku || data.slug,
          url: canonical,
          brand: { "@type": "Brand", name: "BF SUMA Royal" },
          offers: {
            "@type": "Offer",
            price: Number(data.price).toFixed(2),
            priceCurrency: "KES",
            availability: isOOS ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            url: canonical,
            priceValidUntil: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
            seller: { "@type": "Organization", name: "BF SUMA Royal Kenya" },
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "KE",
              returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
              merchantReturnDays: 3,
              returnMethod: "https://schema.org/ReturnByMail",
              returnFees: "https://schema.org/FreeReturn",
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: { "@type": "MonetaryAmount", value: "300", currency: "KES" },
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "KE" },
              deliveryTime: {
                "@type": "ShippingDeliveryTime",
                handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
                transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
              },
            },
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE },
            { "@type": "ListItem", position: 2, name: "Products", item: `${SITE}/products` },
            { "@type": "ListItem", position: 3, name: displayName, item: canonical },
          ],
        },
      ],
    };
  }

  // /blog/:slug
  const blogMatch = pathname.match(/^\/blog\/([^\/]+)$/);
  if (blogMatch && blogMatch[1] !== "category") {
    const slug = decodeURIComponent(blogMatch[1]);
    const { data } = await supabase
      .from("blog_posts")
      .select("title,slug,excerpt,content,featured_image,meta_title,meta_description,published_at,updated_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (data) {
      const desc = truncate(data.meta_description || stripHtml(data.excerpt || data.content || ""), 160);
      return {
        title: truncate(data.meta_title || `${data.title} | BF SUMA Royal Blog`, 60),
        description: desc || `Read ${data.title} on the BF SUMA Royal Kenya wellness blog.`,
        canonical,
        ogImage: data.featured_image || DEFAULT_OG,
        ogType: "article",
        h1: data.title,
        body: `<p>${escapeHtml(stripHtml(data.excerpt || data.content || "").slice(0, 400))}</p>
               <p><a href="/blog">More articles</a></p>`,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: data.title,
            description: desc,
            image: data.featured_image ? [data.featured_image] : [DEFAULT_OG],
            datePublished: data.published_at,
            dateModified: data.updated_at,
            url: canonical,
            author: { "@type": "Organization", name: "BF SUMA Royal" },
            publisher: {
              "@type": "Organization",
              name: "BF SUMA Royal",
              logo: { "@type": "ImageObject", url: `${SITE}/favicon.png` },
            },
          },
        ],
      };
    }
  }

  // /blog/category/:slug
  const blogCatMatch = pathname.match(/^\/blog\/category\/([^\/]+)$/);
  if (blogCatMatch) {
    const slug = decodeURIComponent(blogCatMatch[1]);
    const { data } = await supabase
      .from("blog_categories")
      .select("name,description")
      .eq("slug", slug)
      .maybeSingle();
    const name = data?.name || slug;
    return {
      title: truncate(`${name} Articles | BF SUMA Royal Blog`, 60),
      description: truncate(
        data?.description || `Read ${name} articles on the BF SUMA Royal Kenya wellness blog. Expert tips and natural supplement guides.`,
        160,
      ),
      canonical,
      h1: `${name} Articles`,
      body: `<p>Browse ${escapeHtml(name)} articles from the BF SUMA Royal wellness blog.</p>`,
    };
  }

  // /category/:slug
  const catMatch = pathname.match(/^\/category\/([^\/]+)$/);
  if (catMatch) {
    const slug = decodeURIComponent(catMatch[1]);
    const { data } = await supabase
      .from("categories")
      .select("name,description")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    const name = data?.name || slug;
    return {
      title: truncate(`${name} Supplements in Kenya | BF SUMA Royal`, 60),
      description: truncate(
        data?.description ||
          `Shop ${name} supplements from BF SUMA Royal Kenya. Quality natural products with fast nationwide delivery.`,
        160,
      ),
      canonical,
      h1: `${name} Supplements in Kenya`,
      body: `<p>${escapeHtml(data?.description || `Shop ${name} supplements from BF SUMA Royal.`)}</p>`,
    };
  }

  // /wellness index
  if (pathname === "/wellness") {
    return {
      title: "Wellness Hubs | BF SUMA Royal Kenya",
      description: "Explore 7 wellness hubs from BF SUMA Royal Kenya — joint pain, weight, digestion, hormones, energy, sleep & immunity.",
      canonical,
      h1: "Wellness Hubs",
      body: `<p>Curated supplements, expert guides and FAQs across 7 wellness areas Kenyans care about most.</p>`,
    };
  }
  // /wellness/:slug
  const hubMatch = pathname.match(/^\/wellness\/([^\/]+)$/);
  if (hubMatch) {
    const hubSlug = decodeURIComponent(hubMatch[1]);
    const { data } = await supabase
      .from("wellness_hubs")
      .select("name,hero_title,hero_description,meta_title,meta_description,faq")
      .eq("slug", hubSlug).eq("is_active", true).maybeSingle();
    if (data) {
      const desc = truncate(data.meta_description || data.hero_description, 160);
      const faqArr = Array.isArray(data.faq) ? data.faq : [];
      return {
        title: truncate(data.meta_title || `${data.hero_title} | BF SUMA Royal`, 60),
        description: desc, canonical, h1: data.hero_title,
        body: `<p>${escapeHtml(data.hero_description)}</p><p><a href="/wellness">All wellness hubs</a> · <a href="/products">Shop products</a></p>`,
        jsonLd: [
          { "@context": "https://schema.org", "@type": "FAQPage",
            mainEntity: faqArr.map((f: any) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
          { "@context": "https://schema.org", "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE },
              { "@type": "ListItem", position: 2, name: "Wellness Hubs", item: `${SITE}/wellness` },
              { "@type": "ListItem", position: 3, name: data.name, item: canonical },
            ] },
        ],
      };
    }
  }

  // City pages (single-segment slug)
  const cityMatch = pathname.match(/^\/([a-z][a-z-]+)$/);
  if (cityMatch && cityMeta[cityMatch[1]]) {
    const c = cityMeta[cityMatch[1]];
    const cityName = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1);
    return {
      title: c.title,
      description: c.description,
      canonical,
      h1: `Health Supplements in ${cityName}, Kenya`,
      body: `<p>BF SUMA Royal delivers premium natural supplements to ${escapeHtml(cityName)} and surrounding areas. Fast delivery, GMP-certified products, and dedicated local support.</p>`,
    };
  }

  // Static
  const sm = staticMeta[pathname];
  if (sm) return { ...sm, canonical };

  // Fallback (unknown path) — don't lie to crawlers
  return {
    title: "Page Not Found | BF SUMA Royal Kenya",
    description: "The page you requested could not be found. Browse BF SUMA Royal natural supplements and wellness resources.",
    canonical,
    h1: "Page Not Found",
    body: `<p>Sorry, this page does not exist. <a href="/">Return home</a> or <a href="/products">browse products</a>.</p>`,
    noindex: true,
  };
}

// ---- HTML rewriting ---------------------------------------------------------

function applyMeta(shell: string, meta: Meta): string {
  const title = escapeHtml(meta.title);
  const desc = escapeHtml(meta.description);
  const url = meta.canonical;
  const image = meta.ogImage || DEFAULT_OG;
  const ogType = meta.ogType || "website";

  let html = shell;

  // <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);

  // meta name="title"
  html = html.replace(
    /<meta\s+name=["']title["'][^>]*>/i,
    `<meta name="title" content="${title}" />`,
  );

  // meta name="description"
  html = html.replace(
    /<meta\s+name=["']description["'][^>]*>/i,
    `<meta name="description" content="${desc}" />`,
  );

  // canonical — insert if the SPA shell intentionally omits a static canonical.
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${url}" />`,
    );
  } else {
    html = html.replace(/<\/head>/i, `    <link rel="canonical" href="${url}" />\n  </head>`);
  }

  // Open Graph
  html = html.replace(/<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+property=["']og:description["'][^>]*>/i,
    `<meta property="og:description" content="${desc}" />`,
  );
  html = html.replace(
    /<meta\s+property=["']og:image["'][^>]*>/i,
    `<meta property="og:image" content="${escapeHtml(image)}" />`,
  );
  html = html.replace(
    /<meta\s+property=["']og:type["'][^>]*>/i,
    `<meta property="og:type" content="${ogType}" />`,
  );

  // Twitter
  html = html.replace(/<meta\s+name=["']twitter:url["'][^>]*>/i, `<meta name="twitter:url" content="${url}" />`);
  html = html.replace(/<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(
    /<meta\s+name=["']twitter:description["'][^>]*>/i,
    `<meta name="twitter:description" content="${desc}" />`,
  );
  html = html.replace(
    /<meta\s+name=["']twitter:image["'][^>]*>/i,
    `<meta name="twitter:image" content="${escapeHtml(image)}" />`,
  );

  // robots
  if (meta.noindex) {
    html = html.replace(
      /<meta\s+name=["']robots["'][^>]*>/i,
      `<meta name="robots" content="noindex, nofollow" />`,
    );
  }

  // JSON-LD: inject before </head>
  if (meta.jsonLd?.length) {
    const blocks = meta.jsonLd
      .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
      .join("\n    ");
    html = html.replace(/<\/head>/i, `    ${blocks}\n  </head>`);
  }

  // SEO fallback block — replace the whole hidden crawler fallback body.
  const fallback = `
        <h1>${escapeHtml(meta.h1)}</h1>
        ${meta.body}
        <nav aria-label="Site navigation">
          <a href="/">Home</a> · <a href="/products">Products</a> · <a href="/blog">Blog</a> ·
          <a href="/about">About</a> · <a href="/faq">FAQ</a> · <a href="/contact">Contact</a>
        </nav>`;

  const fallbackOpen = html.match(/<div\s+class=["']seo-fallback["'][^>]*>/i);
  if (fallbackOpen?.index !== undefined) {
    const contentStart = fallbackOpen.index + fallbackOpen[0].length;
    const bodyClose = html.search(/<\/body>/i);
    const searchEnd = bodyClose === -1 ? html.length : bodyClose;
    const closeStart = html.lastIndexOf("</div>", searchEnd);

    if (closeStart > contentStart) {
      html = `${html.slice(0, contentStart)}<main>${fallback}</main>${html.slice(closeStart)}`;
    }
  }

  return html;
}

// ---- Handler ---------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // Allow callers to pass the original path via ?path=, otherwise use req URL.
    const pathParam = url.searchParams.get("path") || url.pathname;
    let pathname = pathParam.startsWith("/") ? pathParam : `/${pathParam}`;
    // Strip query string if forwarded
    pathname = pathname.split("?")[0];
    // Normalise trailing slash (except root)
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.replace(/\/+$/, "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );

    const [shell, meta] = await Promise.all([getShell(), buildMeta(pathname, supabase)]);
    const html = applyMeta(shell, meta);

    return new Response(html, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
        "X-SEO-Render": "1",
      },
    });
  } catch (err) {
    console.error("seo-render error", err);
    // On failure, fall back to the raw shell so the SPA still loads.
    try {
      const shell = await getShell();
      return new Response(shell, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8", "X-SEO-Render": "fallback" },
      });
    } catch {
      return new Response("Internal error", { status: 500 });
    }
  }
});
