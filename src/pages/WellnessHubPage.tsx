import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, ArrowRight, Phone, MapPin, HelpCircle, ShoppingBag, BookOpen, Sparkles } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

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
interface Product { id: string; name: string; slug: string; benefit: string | null; price: number; image_url: string | null }
interface Post { id: string; title: string; slug: string; excerpt: string | null; featured_image: string | null }

const SITE = "https://bfsumaroyal.com";
const WHATSAPP = "https://wa.me/254795454053";
const CITIES = ["Nairobi","Mombasa","Kisumu","Nakuru","Eldoret","Kakamega","Thika","Nyeri","Machakos","Kitale"];

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
          .select("id,name,slug,benefit,price,image_url")
          .in("id", pIds).eq("is_active", true);
        // preserve order
        const map = new Map((prods || []).map((p: any) => [p.id, p]));
        setProducts(pIds.map((id: string) => map.get(id)).filter(Boolean) as Product[]);
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
      }
      setLoading(false);
    })();
  }, [slug]);

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
              <Link to="/products" className="inline-flex items-center gap-2 h-12 px-6 rounded-full border-2 border-white/30 text-white hover:bg-white/10 font-semibold">
                <ShoppingBag className="w-4 h-4" /> Shop All Products
              </Link>
            </div>
          </div>
        </section>

        {/* Intro */}
        {hub.intro_html && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-3xl prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: hub.intro_html }} />
          </section>
        )}

        {/* Products */}
        {products.length > 0 && (
          <section className="py-12 bg-muted/40">
            <div className="container mx-auto px-4 max-w-6xl">
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2">Best Products for {hub.name}</h2>
              <p className="text-muted-foreground text-center mb-10">Hand-picked supplements to support your goals.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-elegant transition-all">
                    {p.image_url && <img src={p.image_url} alt={p.name} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" loading="lazy" />}
                    <div className="p-5">
                      <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                      {p.benefit && <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{p.benefit}</p>}
                      <p className="font-bold text-primary">KSh {Number(p.price).toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Articles */}
        {articles.length > 0 && (
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="flex items-center justify-center gap-2 mb-2"><BookOpen className="w-5 h-5 text-primary" /><h2 className="text-2xl md:text-3xl font-bold text-center">Educational Guides</h2></div>
              <p className="text-muted-foreground text-center mb-10">Deep-dive articles to help you make informed choices.</p>
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
        <section className="py-10 bg-muted/30">
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
          <section className="py-12 bg-background">
            <div className="container mx-auto px-4 max-w-3xl">
              <div className="flex items-center justify-center gap-2 mb-6"><HelpCircle className="w-6 h-6 text-primary" /><h2 className="text-2xl md:text-3xl font-bold">Frequently Asked Questions</h2></div>
              <Accordion type="single" collapsible className="space-y-3">
                {hub.faq.map((f, i) => (
                  <AccordionItem key={i} value={`q-${i}`} className="bg-card border border-border rounded-xl px-5">
                    <AccordionTrigger className="text-left font-semibold py-4">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>
        )}

        {/* Internal links */}
        <section className="py-10 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h3 className="font-bold mb-4">Explore other wellness hubs</h3>
            <Link to="/wellness" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
              View all 7 hubs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default WellnessHubPage;
