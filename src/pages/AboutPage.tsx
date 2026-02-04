import { Shield, Globe, Award, Leaf, Users, Heart, CheckCircle, Building } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const certifications = [
  { name: "GMP Certified", description: "Good Manufacturing Practice certified facilities" },
  { name: "ISO 9001:2015", description: "International quality management standards" },
  { name: "Halal Certified", description: "Products certified for Halal compliance" },
  { name: "FDA Registered", description: "Registered with Food & Drug Administration" },
];

const milestones = [
  { year: "2007", title: "Founded in China", description: "BF SUMA was established with a vision to bring natural wellness to the world." },
  { year: "2012", title: "Global Expansion", description: "Expanded operations to over 30 countries across Asia and Africa." },
  { year: "2018", title: "Kenya Launch", description: "Official launch in Kenya, empowering local entrepreneurs." },
  { year: "2023", title: "Regional Hub", description: "Kenya becomes a major distribution hub for East Africa." },
];

const teamValues = [
  { icon: Heart, title: "Customer First", description: "We prioritize the health and satisfaction of every customer." },
  { icon: Shield, title: "Integrity", description: "Transparency and honesty in all our business practices." },
  { icon: Users, title: "Community", description: "Building a supportive network of wellness entrepreneurs." },
  { icon: Award, title: "Excellence", description: "Committed to the highest quality in everything we do." },
];

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "About BF SUMA ROYAL Kenya",
  "description": "Learn about BF SUMA ROYAL, a global leader in natural health and wellness products. Discover our story, mission, values, and certifications.",
  "url": "https://bfsuma-glow-hub.lovable.app/about",
  "mainEntity": {
    "@type": "Organization",
    "name": "BF SUMA ROYAL Kenya",
    "foundingDate": "2007",
    "numberOfEmployees": "1000+",
    "areaServed": "50+ Countries"
  }
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About BF SUMA ROYAL Kenya - Our Story, Mission & Certifications</title>
        <meta name="description" content="Learn about BF SUMA ROYAL, a global leader in natural health and wellness products with 50+ countries, 200+ products. Discover our story, values, GMP & ISO certifications." />
        <meta name="keywords" content="BF SUMA ROYAL about, BF SUMA history, wellness company Kenya, natural supplements manufacturer, GMP certified supplements" />
        <link rel="canonical" href="https://bfsuma-glow-hub.lovable.app/about" />
        <meta property="og:title" content="About BF SUMA ROYAL Kenya - Our Story & Mission" />
        <meta property="og:description" content="Learn about BF SUMA ROYAL, a global leader in natural health and wellness products with 50+ countries, 200+ products." />
        <meta property="og:url" content="https://bfsuma-glow-hub.lovable.app/about" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(aboutPageSchema)}</script>
      </Helmet>
      <Header />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                BF SUMA ROYAL
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              A global leader in natural health and wellness products, empowering millions 
              to live healthier, more vibrant lives through science-backed nutrition.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  BF SUMA was founded in 2007 with a simple yet powerful mission: to harness 
                  the healing power of nature and make premium health supplements accessible 
                  to everyone, everywhere.
                </p>
                <p>
                  Today, we operate in over 50 countries, with a dedicated team of scientists, 
                  nutritionists, and wellness experts working together to develop innovative 
                  products that support longevity, immunity, and overall vitality.
                </p>
                <p>
                In Kenya, BF SUMA ROYAL has become a trusted name in wellness, offering not just 
                  world-class products but also a unique business opportunity for entrepreneurs 
                  who want to build their own wellness business.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { icon: Globe, label: "50+ Countries", sublabel: "Global Presence" },
                { icon: Users, label: "1M+ Members", sublabel: "Worldwide Network" },
                { icon: Leaf, label: "200+ Products", sublabel: "Natural Formulas" },
                { icon: Building, label: "15+ Years", sublabel: "Industry Experience" },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary transition-all duration-300"
                >
                  <stat.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-foreground">{stat.label}</div>
                  <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline / Milestones */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From humble beginnings to a global wellness brand, here's how we've grown.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {milestone.year}
                  </div>
                  {index < milestones.length - 1 && (
                    <div className="w-0.5 h-full bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at BF SUMA.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Certifications & Quality</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to quality is backed by international certifications and rigorous testing.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {certifications.map((cert, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="bg-card rounded-xl p-6 border border-border flex items-start gap-4"
              >
                <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">{cert.name}</h3>
                  <p className="text-sm text-muted-foreground">{cert.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto text-center bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl p-8 md:p-12 border border-border"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of entrepreneurs building successful wellness businesses with BF SUMA ROYAL.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="premium" size="lg">
                <Link to="/join-business">Become a Distributor</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/#products">Browse Products</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;