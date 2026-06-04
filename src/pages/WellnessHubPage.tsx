import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ArrowRight, Phone, MapPin, HelpCircle, ShoppingBag, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { autoLinkProducts } from "@/lib/auto-link-products";

interface Hub {
  id: string;
  slug: string;
  name: string;
  hero_title: string;
  hero_description: string;
  intro_html: string | null;
  meta_title: string | null;
  meta_description: string | null;
  faq: { q: string; a: string }[];
}
interface Product {
  id: string; name: string; slug: string;
  benefit: string | null; description: string | null;
  price: number; image_url: string | null;
}
interface Post { id: string; title: string; slug: string; excerpt: string | null; featured_image: string | null }

const SITE = "https://bfsumaroyal.com";
const WHATSAPP = "https://wa.me/254795454053";
const CITIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Kakamega","Thika","Nyeri","Machakos","Kitale"];

// Strip HTML tags for short benefit snippet
const stripHtml = (html: string | null, max = 140): string => {
  if (!html) return "";
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
};

const WellnessHubPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [hub, setHub] = useState<Hub | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: h } = await (supabase as any)
        .from("wellness_hubs")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (!h) { setNotFound(true); setLoading(false); return; }
      setHub(h as Hub);

      const { data: prodLinks } = await (supabase as any)
        .from("wellness_hub_products")
        .select("product_id,position")
        .eq("hub_id", h.id)
        .order("position");
      const pIds = (prodLinks || []).map((l: any) => l.product_id);
      if (pIds.length) {
        const { data: prods } = await supabase.from("products")
          .select("id,name,slug,benefit,description,price,image_url")
          .in("id", pIds).eq("is_active", true);
        const map = new Map((prods || []).map((p: any) => [p.id, p]));
        setProducts(pIds.map((id: string) => map.get(id)).filter(Boolean) as Product[]);
      } else {
        setProducts([]);
      }

      const { data: artLinks } = await (supabase as any)
        .from("wellness_hub_articles")
        .select("blog_post_id,position")
        .eq("hub_id", h.id)
        .order("position");
      const aIds = (artLinks || []).map((l: any) => l.blog_post_id);
      if (aIds.length) {
        const { data: posts } = await supabase.from("blog_posts")
          .select("id,title,slug,excerpt,featured_image")
          .in("id", aIds).eq("status", "published");
        const map = new Map((posts || []).map((p: any) => [p.id, p]));
        setArticles(aIds.map((id: string) => map.get(id)).filter(Boolean) as Post[]);
      } else {
        setArticles([]);
      }
      setLoading(false);
    })();
  }, [slug]);

  // Auto-link product mentions inside intro_html
  const linkedIntro = useMemo(() => {
    if (!hub?.intro_html) return "";
    if (!products.length) return hub.intro_html;
    return autoLinkProducts(hub.intro_html, products.map(p => ({ name: p.name, slug: p.slug })));
  }, [hub?.intro_html, products]);

  if (loading) {
    return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div><Footer /></div>;
  }
  if (notFound || !hub) {
    return <div className="min-h-screen flex flex-col"><Header /><div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><h1 className="text-2xl font-bold mb-2">Hub Not Found</h1><Link to="/wellness" className="text-primary underline">Browse all wellness hubs</Link></div><Footer /></div>;
  }

  const canonical = `${SITE}/wellness/${hub.slug}`;
  const title = hub.meta_title || `${hub.hero_title} | BF SUMA Royal`;
  const description = hub.meta_description || hub.hero_description;

  const faqLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: hub.faq.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Wellness Hubs", item: `${SITE}/wellness` },
      { "@type": "ListItem", position: 3, name: hub.name, item: canonical },
    ],
  };
  const itemListLd = products.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Recommended Products for ${hub.name}`,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE}/product/${p.slug}`,
      name: p.name,
    })),
  } : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
        {itemListLd && <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>}
      </Helmet>

      <Header />
      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="bg-gradient-to-br from-secondary via-secondary/90 to-primary/80 text-white py-16">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 mb-4 text-accent">
              <Sparkles className="w-5 h-5" />
              <span className="uppercase tracking-wider text-xs font-semibold">Wellness Hub</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{hub.hero_title}</h1>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">{hub.hero_description}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href={`${WHATSAPP}?text=Hi, I'd like guidance on ${encodeURIComponent(hub.name)}.`} target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-accent text-accent-foreground font-bold hover:scale-105 transition-transform">
                <Phone className="w-4 h-4" /> Free WhatsApp Consultation
              </a>
              {products.length > 0 ? (
                <a href="#recommended-products" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border-2 border-white/30 text-white hover:bg-white/10 font-semibold">
                  <ShoppingBag className="w-4 h-4" /> View Recommended Products
                </a>
              ) : (
                <Link to="/products" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border-2 border-white/30 text-white hover:bg-white/10 font-semibold">
                  <ShoppingBag className="w-4 h-4" /> Shop All Products
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* RECOMMENDED PRODUCTS — moved ABOVE educational content */}
        {products.length > 0 && (
          <section id="recommended-products" className="py-12 md:py-16 bg-muted/40 border-b border-border">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-2 text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span className="uppercase tracking-wider text-xs font-semibold">Recommended Products</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Best Supplements for {hub.name}</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">Hand-picked formulas that may support your goals. Tap any product for full details and ingredients.</p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
                  const benefitText = p.benefit || stripHtml(p.description, 120);
                  const waMsg = encodeURIComponent(`Hi, I'd like to order ${p.name} (${hub.name}).\n\nPage: ${canonical}`);
                  return (
                    <div key={p.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant transition-all flex flex-col">
                      <Link to={`/product/${p.slug}`} className="block">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                        ) : (
                          <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                            <ShoppingBag className="w-12 h-12 opacity-40" />
                          </div>
                        )}
                      </Link>
                      <div className="p-5 flex-1 flex flex-col">
                        <Link to={`/product/${p.slug}`}>
                          <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                        </Link>
                        {benefitText && <p className="text-sm text-muted-foreground mb-3 line-clamp-3 flex-1">{benefitText}</p>}
                        <p className="font-bold text-primary mb-4">KSh {Number(p.price).toLocaleString()}</p>
                        <div className="flex gap-2 mt-auto">
                          <Link to={`/product/${p.slug}`} className="flex-1 inline-flex items-center justify-center gap-1 h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                            View Product
                          </Link>
                          <a href={`${WHATSAPP}?text=${waMsg}`} target="_blank" rel="noopener noreferrer" aria-label={`Order ${p.name} on WhatsApp`}
                             className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-accent text-accent-foreground hover:scale-105 transition-transform">
                            <Phone className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Why these products */}
              <div className="mt-12 bg-card border border-border rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" /> Why these products are recommended</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {products.map((p) => (
                    <div key={p.id} className="border-l-2 border-primary/40 pl-4">
                      <Link to={`/product/${p.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors">{p.name}</Link>
                      {p.benefit && <p className="text-sm text-muted-foreground mt-1">{p.benefit}</p>}
                      <Link to={`/product/${p.slug}`} className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
                        Full ingredients & details <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Intro / educational content — now BELOW products, with auto-linked product mentions */}
        {linkedIntro && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: linkedIntro }} />
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center justify-center gap-2 mb-2"><BookOpen className="w-5 h-5 text-primary" /><h2 className="text-2xl md:text-3xl font-bold text-center">Related Articles</h2></div>
              <p className="text-muted-foreground text-center mb-10">Deep-dive guides to help you make informed choices.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((a) => (
                  <Link key={a.id} to={`/blog/${a.slug}`} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant transition-all">
                    {a.featured_image && <img src={a.featured_image} alt={a.title} className="w-full aspect-video object-cover group-hover:scale-105 transition-transform" loading="lazy" />}
                    <div className="p-5">
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">{a.title}</h3>
                      {a.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{a.excerpt}</p>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* City availability */}
        <section className="py-10 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-xl font-bold mb-4 flex items-center justify-center gap-2"><MapPin className="w-5 h-5 text-primary" /> Available across Kenya</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {CITIES.map((c) => (
                <Link key={c} to={`/${c.toLowerCase()}`} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20">
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        {hub.faq?.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="flex items-center justify-center gap-2 mb-6"><HelpCircle className="w-6 h-6 text-primary" /><h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2></div>
              <Accordion type="single" collapsible className="space-y-3">
                {hub.faq.map((f, i) => {
                  const linkedAnswer = products.length
                    ? autoLinkProducts(f.a, products.map(p => ({ name: p.name, slug: p.slug })))
                    : f.a;
                  return (
                    <AccordionItem key={i} value={`q-${i}`} className="bg-card border border-border rounded-xl px-5">
                      <AccordionTrigger className="text-left font-semibold py-4">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4">
                        <div dangerouslySetInnerHTML={{ __html: linkedAnswer }} />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </section>
        )}

        {/* Final CTA */}
        <section className="py-12 bg-gradient-to-br from-primary to-secondary text-white">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Not sure which product is right for you?</h2>
            <p className="text-white/90 mb-6">Chat with our wellness team on WhatsApp — free, confidential, no pressure.</p>
            <a href={`${WHATSAPP}?text=Hi, I'd like guidance on ${encodeURIComponent(hub.name)}.`} target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-accent text-accent-foreground font-bold hover:scale-105 transition-transform">
              <Phone className="w-4 h-4" /> Free WhatsApp Consultation
            </a>
          </div>
        </section>

        {/* Internal links */}
        <section className="py-10 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h3 className="font-bold mb-4">Explore other wellness hubs</h3>
            <Link to="/wellness" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              View all hubs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WellnessHubPage;
