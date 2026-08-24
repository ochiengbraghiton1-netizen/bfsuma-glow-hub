import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Phone, MapPin, Truck, Star, ArrowRight, ShoppingBag, Sparkles, HelpCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import RelatedWellnessHubs from "@/components/RelatedWellnessHubs";
import LocationLongForm from "@/components/LocationLongForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { autoLinkProducts } from "@/lib/auto-link-products";
import type { LocationData, LocationProduct } from "@/config/locations";

const WHATSAPP_URL = "https://wa.me/254795454053";
const SITE_URL = "https://bfsumaroyal.com";

interface DbProduct {
  id: string; name: string; slug: string;
  benefit: string | null; price: number; image_url: string | null;
}

interface CmsPage {
  hero_title: string | null;
  hero_description: string | null;
  main_content_html: string | null;
  faqs: Array<{ q: string; a: string }> | null;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
}

/** Build a prefilled WhatsApp link with page + product context for higher conversions. */
const buildWa = (text: string, pageUrl: string) =>
  `${WHATSAPP_URL}?text=${encodeURIComponent(`${text}\n\nPage: ${pageUrl}`)}`;

const LocationPage = ({ location }: { location: LocationData }) => {
  const { city, slug, heroSubtext, localContext, landmarks, deliveryTime, deliveryNote, products: staticProducts, testimonials } = location;
  const pageUrl = `${SITE_URL}/${slug}`;
  const [dbProducts, setDbProducts] = useState<Record<string, DbProduct>>({});
  const [dbAssignments, setDbAssignments] = useState<LocationProduct[] | null>(null);
  const [cms, setCms] = useState<CmsPage | null>(null);

  // CMS-overridable per-city SEO content
  useEffect(() => {
    (async () => {
      const { data } = await (supabase as any)
        .from("location_pages")
        .select("hero_title,hero_description,main_content_html,faqs,meta_title,meta_description,og_title,og_description,og_image_url,canonical_url")
        .eq("city_slug", slug)
        .eq("is_published", true)
        .maybeSingle();
      if (data) setCms(data as CmsPage);
    })();
  }, [slug]);

  // Admin-managed city → product assignments (overrides static list when present)
  useEffect(() => {
    (async () => {
      const { data: assigns } = await (supabase as any)
        .from("location_products")
        .select("product_id, reason, position, products!inner(id,name,slug,benefit,price,image_url,is_active)")
        .eq("city_slug", slug)
        .order("position");
      const valid = (assigns || []).filter((a: any) => a.products?.is_active);
      if (valid.length) {
        const mapped: LocationProduct[] = valid.map((a: any) => ({
          name: a.products.name,
          slug: a.products.slug,
          reason: a.reason || a.products.benefit || `Recommended for ${city} residents.`,
        }));
        const pmap: Record<string, DbProduct> = {};
        valid.forEach((a: any) => { pmap[a.products.slug] = a.products; });
        setDbAssignments(mapped);
        setDbProducts(pmap);
      } else {
        setDbAssignments(null);
      }
    })();
  }, [slug, city]);

  const products = dbAssignments ?? staticProducts;

  // Hydrate image/price from DB for static fallback list
  useEffect(() => {
    if (dbAssignments) return;
    const slugs = staticProducts.map(p => p.slug);
    if (!slugs.length) return;
    (async () => {
      const { data } = await supabase
        .from("products")
        .select("id,name,slug,benefit,price,image_url")
        .in("slug", slugs)
        .eq("is_active", true);
      const map: Record<string, DbProduct> = {};
      (data || []).forEach((p: any) => { map[p.slug] = p; });
      setDbProducts(map);
    })();
  }, [dbAssignments, staticProducts]);

  const linkInfo = useMemo(
    () => products.map(p => ({ name: p.name, slug: p.slug })),
    [products]
  );

  const title = cms?.meta_title || `Health Supplements in ${city} Kenya | BF Suma Royal`;
  const description = cms?.meta_description || `Buy premium health supplements in ${city}, Kenya. Boost energy, immunity & wellness with BF Suma Royal. Fast delivery ${deliveryTime}. Order via WhatsApp today!`;
  const heroTitleText = cms?.hero_title || `Buy Health Supplements in ${city}, Kenya`;
  const heroDescriptionText = cms?.hero_description || heroSubtext;

  // LocalBusiness JSON-LD
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `BF SUMA Royal ${city}`,
    url: `${SITE_URL}/${slug}`,
    telephone: "+254795454053",
    email: "bfsumaroyal@gmail.com",
    address: { "@type": "PostalAddress", addressLocality: city, addressCountry: "KE" },
    areaServed: { "@type": "City", name: city, containedInPlace: { "@type": "Country", name: "Kenya" } },
    priceRange: "KSh 2,300 - KSh 7,500",
    description: `Natural health supplements delivered to ${city}. Joint pain, hormonal balance, energy and immunity support.`,
    openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], opens: "08:00", closes: "18:00" },
    sameAs: ["https://www.facebook.com/share/18KxrewVoN/","https://www.instagram.com/bf_suma_royal","https://www.tiktok.com/@bfsumaroyal"],
  };


  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `Supplements in ${city}`, item: `${SITE_URL}/${slug}` },
    ],
  };

  // ItemList for featured local products
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Top Supplements in ${city}, Kenya`,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/product/${p.slug}`,
      name: p.name,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Where can I buy health supplements in ${city}, Kenya?`, acceptedAnswer: { "@type": "Answer", text: `You can buy premium health supplements in ${city} from BF Suma Royal. We offer fast delivery ${deliveryTime} and you can order via WhatsApp or our online store at bfsumaroyal.com.` } },
      { "@type": "Question", name: `How long does delivery take to ${city}?`, acceptedAnswer: { "@type": "Answer", text: `We deliver to ${city} ${deliveryTime}. ${deliveryNote}` } },
      { "@type": "Question", name: `What are the best health supplements available in ${city}?`, acceptedAnswer: { "@type": "Answer", text: `Our top supplements for ${city} residents include ${products.map(p => p.name).join(", ")}. These are chosen specifically for the health needs and lifestyle of people in ${city}.` } },
      { "@type": "Question", name: `Are BF Suma Royal products genuine and certified?`, acceptedAnswer: { "@type": "Answer", text: "Yes, all BF Suma Royal products are GMP-certified, Halal-approved, and sourced directly from the manufacturer. We guarantee 100% authentic wellness products." } },
      { "@type": "Question", name: `Do you deliver to all areas in ${city}?`, acceptedAnswer: { "@type": "Answer", text: `Yes, we deliver to all areas in ${city} including ${landmarks.slice(0, 5).join(", ")}${landmarks.length > 5 ? " and more" : ""}. Contact us via WhatsApp for delivery details.` } },
      { "@type": "Question", name: `Can I order via WhatsApp from ${city}?`, acceptedAnswer: { "@type": "Answer", text: `Yes — most ${city} customers prefer ordering on WhatsApp at +254 795 454 053. Our team confirms availability, total and delivery time within minutes.` } },
      { "@type": "Question", name: `Do you accept M-Pesa payments in ${city}?`, acceptedAnswer: { "@type": "Answer", text: `Yes. We accept M-Pesa, bank transfer and PayPal. Cash on delivery is available in selected ${city} areas — confirm with our team on WhatsApp.` } },
      { "@type": "Question", name: `Are BF SUMA Royal supplements safe to take with my medication?`, acceptedAnswer: { "@type": "Answer", text: `Most of our natural supplements are well tolerated, but always show the product to your doctor or pharmacist if you take prescription medication for blood pressure, diabetes or heart conditions.` } },
      { "@type": "Question", name: `How discreet is delivery to ${city}?`, acceptedAnswer: { "@type": "Answer", text: `All orders to ${city} arrive in plain, unbranded packaging. Only you and our delivery partner know what is inside.` } },
      ...((location.extraFaqs || []).map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))),
      ...((cms?.faqs || []).map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))),
    ],
  };

  return (
    <div className="min-h-screen">
      <PageSEO title={title} description={description} path={`/${slug}`} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <Header />

      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-secondary/90 to-primary/80">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--accent)/0.3),transparent_60%)]" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center py-16 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent animate-glow" />
              <span className="text-accent font-semibold uppercase tracking-wider text-xs">{city}, Kenya</span>
              <Sparkles className="w-5 h-5 text-accent animate-glow" />
            </div>

            <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {heroTitleText}
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">{heroDescriptionText}</p>



            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <a href={buildWa(`Hi, I'd like to order supplements. I'm in ${city}.`, pageUrl)} target="_blank" rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-10 text-lg font-bold rounded-2xl bg-accent text-accent-foreground shadow-[0_0_40px_hsl(43_96%_56%/0.5)] hover:shadow-[0_0_60px_hsl(43_96%_56%/0.7)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300">
                <Phone className="w-5 h-5" />
                Order via WhatsApp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#featured-products" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300">
                <ShoppingBag className="w-5 h-5" />
                View Products
              </a>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ── FEATURED PRODUCTS — moved ABOVE editorial content ── */}
        <section id="featured-products" className="py-14 md:py-20 bg-muted/40 border-b border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="uppercase tracking-wider text-xs font-semibold">Featured for {city}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold mb-3">Top Supplements Available in {city}</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Hand-picked for {city} residents — order via WhatsApp for fast delivery ({deliveryTime}).
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => {
                const db = dbProducts[product.slug];
                const waHref = buildWa(`Hi, I'd like to order ${product.name}. I'm in ${city}.`, pageUrl);
                return (
                  <div key={product.slug} className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-glow transition-all duration-300 flex flex-col">
                    <Link to={`/product/${product.slug}`} className="block">
                      {db?.image_url ? (
                        <img src={db.image_url} alt={`${product.name} | BF SUMA Royal`} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                      ) : (
                        <div className="w-full aspect-square bg-muted flex items-center justify-center text-muted-foreground">
                          <ShoppingBag className="w-12 h-12 opacity-40" />
                        </div>
                      )}
                    </Link>
                    <div className="p-5 flex-1 flex flex-col">
                      <Link to={`/product/${product.slug}`}>
                        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
                      </Link>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-1 line-clamp-4">{product.reason}</p>
                      {db?.price && <p className="font-bold text-primary mb-4">KSh {Number(db.price).toLocaleString()}</p>}
                      <div className="flex gap-2 mt-auto">
                        <Link to={`/product/${product.slug}`} className="flex-1 inline-flex items-center justify-center gap-1 h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                          View Product
                        </Link>
                        <a href={waHref} target="_blank" rel="noopener noreferrer" aria-label={`Order ${product.name} on WhatsApp`}
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
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Why these products are recommended for {city}
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {products.map((p) => (
                  <div key={p.slug} className="border-l-2 border-primary/40 pl-4">
                    <Link to={`/product/${p.slug}`} className="font-semibold text-foreground hover:text-primary transition-colors">{p.name}</Link>
                    <p className="text-sm text-muted-foreground mt-1">{p.reason}</p>
                    <Link to={`/product/${p.slug}`} className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-2 hover:underline">
                      Full ingredients & details <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── LOCAL CONTEXT (now after products) ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Why {city} Residents Choose BF Suma Royal
            </h2>
            <div className="space-y-6">
              {localContext.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-muted-foreground leading-relaxed text-base md:text-lg"
                  dangerouslySetInnerHTML={{ __html: autoLinkProducts(paragraph, linkInfo) }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── LONG-FORM EDITORIAL ── */}
        {cms?.main_content_html && (
          <section className="py-12 md:py-16 bg-background">
            <div
              className="container mx-auto px-4 max-w-3xl prose prose-neutral dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: autoLinkProducts(cms.main_content_html, linkInfo) }}
            />
          </section>
        )}

        <LocationLongForm location={location} />

        {/* ── DELIVERY ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">Fast Delivery to {city}</h2>
            <p className="text-xl text-primary font-semibold mb-4">We deliver to {city} {deliveryTime}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{deliveryNote}</p>
            <a href={buildWa(`Hi, I'd like to place an order for delivery to ${city}.`, pageUrl)} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              <Phone className="w-5 h-5" />
              Order Now for {city} Delivery
            </a>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-12 text-center">What {city} Customers Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-card rounded-2xl p-6 shadow-elegant border border-border">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (<Star key={j} className="w-4 h-4 fill-accent text-accent" />))}
                  </div>
                  <p className="text-muted-foreground italic mb-4 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{t.name}, {t.city}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOCAL AREAS ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Serving All Areas in {city}</h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {landmarks.map((area) => (
                <span key={area} className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">{area}</span>
              ))}
            </div>
            <p className="text-muted-foreground mb-8">
              No matter where you are in {city}, we'll get your supplements to you fast.{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">Contact us</Link>{" "}for any delivery questions.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-center justify-center gap-2 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-2xl md:text-4xl font-bold text-foreground text-center">FAQ – Supplements in {city}</h2>
            </div>
            <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
              Common questions about buying health supplements in {city}, Kenya.
            </p>
            <Accordion type="single" collapsible className="w-full space-y-3">
              {(faqSchema.mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-5 data-[state=open]:shadow-elegant transition-shadow">
                  <AccordionTrigger className="text-left text-sm md:text-base font-semibold text-foreground hover:no-underline py-4">
                    {item.name}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4">
                    <div dangerouslySetInnerHTML={{ __html: autoLinkProducts(item.acceptedAnswer.text, linkInfo) }} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── RELATED WELLNESS HUBS ── */}
        <RelatedWellnessHubs showAll />

        {/* ── INTERNAL LINKS ── */}
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-primary hover:text-accent transition-colors font-medium">← Back to Home</Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/category" className="text-primary hover:text-accent transition-colors font-medium">All Products</Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/blog" className="text-primary hover:text-accent transition-colors font-medium">Health Blog</Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/faq" className="text-primary hover:text-accent transition-colors font-medium">FAQ</Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/join-business" className="text-primary hover:text-accent transition-colors font-medium">Join & Earn</Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LocationPage;
