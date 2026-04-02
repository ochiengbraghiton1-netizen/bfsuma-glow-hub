import { Link } from "react-router-dom";
import { Phone, MapPin, Truck, Star, ArrowRight, ShoppingBag, Sparkles, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { LocationData } from "@/config/locations";

const WHATSAPP_URL = "https://wa.me/254795454053";
const SITE_URL = "https://bfsumaroyal.com";

const LocationPage = ({ location }: { location: LocationData }) => {
  const { city, slug, heroSubtext, localContext, landmarks, deliveryTime, deliveryNote, products, testimonials } = location;

  const title = `Health Supplements in ${city} Kenya | BF Suma Royal`;
  const description = `Buy premium health supplements in ${city}, Kenya. Boost energy, immunity & wellness with BF Suma Royal. Fast delivery ${deliveryTime}. Order via WhatsApp today!`;

  // LocalBusiness JSON-LD
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    name: `BF Suma Royal – ${city}`,
    url: `${SITE_URL}/${slug}`,
    telephone: "+254795454053",
    email: "bfsumaroyal@gmail.com",
    areaServed: {
      "@type": "City",
      name: city,
      containedInPlace: { "@type": "Country", name: "Kenya" },
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Kakamega",
      addressRegion: "Western",
      addressCountry: "KE",
    },
    description: `Premium natural health supplements available in ${city}, Kenya. GMP-certified, Halal-approved wellness products with fast delivery ${deliveryTime}.`,
    priceRange: "KES 1,000 – KES 10,000",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "08:00",
      closes: "18:00",
    },
    sameAs: [
      "https://www.facebook.com/share/1G6uTXLkpw/",
      "https://www.instagram.com/bf_suma_royal",
      "https://www.tiktok.com/@bfsumaroyal",
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: `Supplements in ${city}`, item: `${SITE_URL}/${slug}` },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Where can I buy health supplements in ${city}, Kenya?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `You can buy premium health supplements in ${city} from BF Suma Royal. We offer fast delivery ${deliveryTime} and you can order via WhatsApp or our online store at bfsumaroyal.com.`,
        },
      },
      {
        "@type": "Question",
        name: `How long does delivery take to ${city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `We deliver to ${city} ${deliveryTime}. ${deliveryNote}`,
        },
      },
      {
        "@type": "Question",
        name: `What are the best health supplements available in ${city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Our top supplements for ${city} residents include ${products.map(p => p.name).join(", ")}. These are chosen specifically for the health needs and lifestyle of people in ${city}.`,
        },
      },
      {
        "@type": "Question",
        name: `Are BF Suma Royal products genuine and certified?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all BF Suma Royal products are GMP-certified, Halal-approved, and sourced directly from the manufacturer. We guarantee 100% authentic wellness products.",
        },
      },
      {
        "@type": "Question",
        name: `Do you deliver to all areas in ${city}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes, we deliver to all areas in ${city} including ${landmarks.slice(0, 5).join(", ")}${landmarks.length > 5 ? " and more" : ""}. Contact us via WhatsApp for delivery details.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen">
      <PageSEO title={title} description={description} path={`/${slug}`} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      <main className="pt-16">
        {/* ── HERO ── */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-secondary via-secondary/90 to-primary/80">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--accent)/0.3),transparent_60%)]" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center py-20 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-accent animate-glow" />
              <span className="text-accent font-semibold uppercase tracking-wider text-xs">
                {city}, Kenya
              </span>
              <Sparkles className="w-5 h-5 text-accent animate-glow" />
            </div>

            <h1 className="text-3xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Buy Health Supplements in{" "}
              <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
                {city}, Kenya
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
              {heroSubtext}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
              <a
                href={`${WHATSAPP_URL}?text=Hi, I'd like to order supplements. I'm in ${city}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 h-14 px-10 text-lg font-bold rounded-2xl bg-accent text-accent-foreground shadow-[0_0_40px_hsl(43_96%_56%/0.5)] hover:shadow-[0_0_60px_hsl(43_96%_56%/0.7)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300"
              >
                <Phone className="w-5 h-5" />
                Order via WhatsApp
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-14 px-8 text-lg font-semibold rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 transition-all duration-300"
              >
                <ShoppingBag className="w-5 h-5" />
                Browse All Products
              </Link>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* ── LOCAL CONTEXT ── */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-8 text-center">
              Why {city} Residents Choose BF Suma Royal
            </h2>
            <div className="space-y-6">
              {localContext.map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed text-base md:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 text-center">
              Top Supplements for {city}
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Chosen specifically for the health needs and lifestyle of {city} residents.
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.slug}
                  className="bg-card rounded-2xl p-6 shadow-elegant border border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {product.name}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {product.reason}
                  </p>
                  <Link
                    to={`/product/${product.slug}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors text-sm"
                  >
                    View Product <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── DELIVERY ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Fast Delivery to {city}
            </h2>
            <p className="text-xl text-primary font-semibold mb-4">
              We deliver to {city} {deliveryTime}
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {deliveryNote}
            </p>
            <a
              href={`${WHATSAPP_URL}?text=Hi, I'd like to place an order for delivery to ${city}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-12 px-8 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Order Now for {city} Delivery
            </a>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="py-16 md:py-24 bg-muted/50">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-12 text-center">
              What {city} Customers Say
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="bg-card rounded-2xl p-6 shadow-elegant border border-border"
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="w-4 h-4 fill-accent text-accent"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground italic mb-4 leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {t.name}, {t.city}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── LOCAL AREAS ── */}
        <section className="py-16 md:py-20 bg-background">
          <div className="container mx-auto px-4 max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Serving All Areas in {city}
            </h2>
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {landmarks.map((area) => (
                <span
                  key={area}
                  className="px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm"
                >
                  {area}
                </span>
              ))}
            </div>
            <p className="text-muted-foreground mb-8">
              No matter where you are in {city}, we'll get your supplements to you fast.{" "}
              <Link to="/contact" className="text-primary hover:underline font-medium">
                Contact us
              </Link>{" "}
              for any delivery questions.
            </p>
          </div>
        </section>

        {/* ── INTERNAL LINKS ── */}
        <section className="py-12 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/" className="text-primary hover:text-accent transition-colors font-medium">
                ← Back to Home
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/category" className="text-primary hover:text-accent transition-colors font-medium">
                All Products
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/blog" className="text-primary hover:text-accent transition-colors font-medium">
                Health Blog
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/faq" className="text-primary hover:text-accent transition-colors font-medium">
                FAQ
              </Link>
              <span className="text-muted-foreground">|</span>
              <Link to="/join-business" className="text-primary hover:text-accent transition-colors font-medium">
                Join & Earn
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LocationPage;
