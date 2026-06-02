import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Briefcase,
  TrendingUp,
  Users,
  GraduationCap,
  CheckCircle2,
  MessageCircle,
  Calendar,
  Play,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

interface BusinessPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image: string | null;
  video_url: string | null;
  is_featured: boolean;
  published_at: string | null;
}

const WHATSAPP_URL =
  "https://wa.me/254795454053?text=Hello%2C%20I%27m%20interested%20in%20the%20BF%20SUMA%20Royal%20business%20opportunity.%20Please%20guide%20me%20on%20how%20to%20register.";

const FAQS = [
  {
    q: "How do I join the BF SUMA Royal business?",
    a: "Registration is KES 7,000 and you get your starter kit, distributor ID, and access to your sponsor's training. You can register through WhatsApp or our Join Business page.",
  },
  {
    q: "Do I need experience in network marketing?",
    a: "No. Most successful BF SUMA Royal distributors started with zero experience. You get step-by-step mentorship from your sponsor plus our training resources.",
  },
  {
    q: "How quickly can I start earning?",
    a: "Earnings depend on activity, not luck. Distributors who follow the system, share products they personally use, and consistently invite others often see their first commissions within their first month.",
  },
  {
    q: "Is this a pyramid scheme?",
    a: "No. BF SUMA Royal is a legitimate direct-selling and distributor model based on real wellness products. You earn from product sales and from helping others build their own teams.",
  },
  {
    q: "Can I do this part-time?",
    a: "Yes. Many of our distributors run their BF SUMA business alongside formal employment, business, or studies using just a smartphone.",
  },
];

const BusinessHubPage = () => {
  const [featured, setFeatured] = useState<BusinessPost[]>([]);
  const [stories, setStories] = useState<BusinessPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image, video_url, is_featured, published_at")
        .eq("status", "published")
        .eq("content_type", "business")
        .order("published_at", { ascending: false })
        .limit(12);
      const posts = (data as BusinessPost[]) || [];
      setFeatured(posts.slice(0, 3));
      setStories(posts.slice(3, 9));
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Helmet>
          <title>BF SUMA Royal Business Hub Kenya | Income Opportunity</title>
          <meta
            name="description"
            content="Build extra income with the BF SUMA Royal distributor business in Kenya. Real stories, training resources, FAQs and step-by-step registration."
          />
          <link rel="canonical" href="https://bfsumaroyal.com/business" />
          <meta property="og:title" content="BF SUMA Royal Business Hub Kenya | Income Opportunity" />
          <meta
            property="og:description"
            content="Build extra income with wellness — real distributor stories, training and resources."
          />
          <meta property="og:url" content="https://bfsumaroyal.com/business" />
          <meta property="og:type" content="website" />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://bfsumaroyal.com/" },
                { "@type": "ListItem", position: 2, name: "Business Hub", item: "https://bfsumaroyal.com/business" },
              ],
            })}
          </script>
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            })}
          </script>
        </Helmet>

        {/* Hero */}
        <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
          <div className="max-w-5xl mx-auto text-center relative z-10">
            <Badge variant="outline" className="mb-4 border-primary/30 text-primary px-4 py-1">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              Business Opportunity Hub
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Build Real Income With{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Wellness People Actually Need
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Ordinary Kenyans are using the BF SUMA Royal distributor system to build
              part-time and full-time income — sharing products that genuinely change lives.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/join-business">
                  Register as a Distributor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Talk on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Why join */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Why distributors choose BF SUMA Royal</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: TrendingUp,
                  title: "Real products, real demand",
                  desc: "You're not selling hype. You're sharing wellness products people in Kenya are already searching for.",
                },
                {
                  icon: Users,
                  title: "Mentor-led support",
                  desc: "Every new distributor gets paired with a sponsor who's already walking the path — not a faceless system.",
                },
                {
                  icon: GraduationCap,
                  title: "Training that fits your life",
                  desc: "Build the business on your phone, around your job or studies. No office, no inventory pressure.",
                },
              ].map((item, i) => (
                <Card key={i} className="border-primary/10 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Business Articles */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
              <div>
                <h2 className="text-3xl font-bold">Business Opportunity Articles</h2>
                <p className="text-muted-foreground mt-1">
                  Practical guides on building income with BF SUMA Royal.
                </p>
              </div>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/business/blog">
                  View all <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>

            {loading ? (
              <p className="text-center text-muted-foreground">Loading…</p>
            ) : featured.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Business articles are being prepared. Check back soon.
              </p>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {featured.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                    {post.featured_image ? (
                      <div className="relative aspect-video overflow-hidden bg-muted">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {post.video_url && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center shadow-lg">
                              <Play className="w-5 h-5 text-primary-foreground ml-0.5" fill="currentColor" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Tag className="w-10 h-10 text-muted-foreground/50" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="h-4 w-4" />
                        {post.published_at && format(new Date(post.published_at), "MMM d, yyyy")}
                      </div>
                      <CardTitle className="line-clamp-2">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.excerpt && <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Button asChild variant="outline" className="w-full">
                        <Link to={`/blog/${post.slug}`}>Read More</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Success Stories */}
        {stories.length > 0 && (
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-2">Success Stories</h2>
              <p className="text-center text-muted-foreground mb-10">
                Real distributors. Real wins. Real Kenya.
              </p>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stories.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-lg">
                        <Link to={`/blog/${post.slug}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </CardTitle>
                      {post.excerpt && <CardDescription className="line-clamp-3">{post.excerpt}</CardDescription>}
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <Link to={`/blog/${post.slug}`} className="text-primary text-sm font-medium inline-flex items-center">
                        Read story <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary to-accent text-primary-foreground p-10 md:p-14 text-center shadow-xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to start your BF SUMA business?</h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Registration is KES 7,000. You get your starter kit, distributor ID,
              one-on-one mentorship and a step-by-step launch plan.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild size="lg" variant="secondary" className="rounded-full">
                <Link to="/join-business">Register Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent border-white text-white hover:bg-white/10">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat with a mentor
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* Training Resources */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Training Resources</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Your first 30 days as a BF SUMA distributor",
                "How to share products without sounding salesy",
                "Using WhatsApp to invite without spamming",
                "Building a team that doesn't fall apart",
              ].map((title, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex items-start gap-4">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">{title}</h3>
                      <p className="text-sm text-muted-foreground">
                        Available through your sponsor after registration.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Training is delivered 1-on-1 by your sponsor and through our distributor community.
            </p>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Business FAQs</h2>
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent>{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BusinessHubPage;
