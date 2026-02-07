import { Globe, Award, Users, Heart, CheckCircle, Lightbulb, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const timelineEvents = [
  {
    year: "2006",
    title: "The Beginning",
    description:
      "BF SUMA (Bright Future Superior Unique Manufacturer of America) was founded in Los Angeles, California, USA, with a clear mission: to improve quality of life through scientifically formulated herbal and nutritional supplements.",
  },
  {
    year: "2006–2008",
    title: "Building the Foundation",
    description:
      "BF SUMA established strong research and development capabilities, working within a broader pharmaceutical ecosystem associated with Bright Future Pharmaceutical Lab Ltd. Multiple wellness formulations were developed, laying the groundwork for international expansion.",
  },
  {
    year: "2009",
    title: "Entry into Africa",
    description:
      "BF SUMA officially entered the African market, choosing Kenya as its first point of entry. Kenya became the strategic base for African operations due to its central position in East Africa and growing demand for quality wellness products.",
    highlight: true,
  },
  {
    year: "2011",
    title: "Expansion in Kenya",
    description:
      "Formal partnerships and distributor networks were established in Kenya. BF SUMA began opening shops, hosting trainings, and building a strong community around health education and product awareness.",
  },
  {
    year: "2013",
    title: "West Africa Growth",
    description:
      "BF SUMA expanded into Nigeria, establishing operations that later grew into major cities including Lagos, Abuja, Port Harcourt, and Kaduna. This marked the brand's strong entry into West Africa.",
  },
  {
    year: "2014",
    title: "Southern & East Africa Expansion",
    description:
      "BF SUMA Limited Tanzania was officially established, headquartered in Dar es Salaam. From Tanzania, distribution extended into Zambia, Burundi, parts of the Democratic Republic of Congo (DRC), and Namibia.",
  },
  {
    year: "2015–2020",
    title: "Continental Growth",
    description:
      "BF SUMA continued expanding its African footprint through a structured distributor and shop-based model, reaching Uganda, Ghana, Zambia, Burundi, DRC, and Namibia. The company strengthened brand recognition, hosted large regional events, and empowered thousands through wellness entrepreneurship.",
  },
  {
    year: "2023",
    title: "15+ Years of Impact in Africa",
    description:
      "BF SUMA celebrated over 15 years of presence in Africa, marking a journey of growth, community impact, and improved wellness across the continent.",
    highlight: true,
  },
  {
    year: "Today",
    title: "A Global Wellness Brand",
    description:
      "Today, BF SUMA operates as a trusted global health and wellness company with 200+ supplement formulations, patents registered in USA, China, Japan, India, and South Korea, and distribution across 15+ countries worldwide.",
    highlight: true,
  },
];

const coreValues = [
  { icon: Heart, title: "Trust", description: "Building lasting relationships through honesty and reliability." },
  { icon: Users, title: "Care", description: "Prioritizing the well-being of our customers and community." },
  { icon: Award, title: "Respect", description: "Valuing every individual in our global wellness family." },
  { icon: Lightbulb, title: "Innovation", description: "Continuously advancing our formulations and services." },
];

const certifications = [
  { name: "GMP Certified", description: "Good Manufacturing Practice certified facilities" },
  { name: "ISO 9001:2015", description: "International quality management standards" },
  { name: "Halal Certified", description: "Products certified for Halal compliance" },
  { name: "FDA Registered", description: "Registered with Food & Drug Administration" },
];

const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About BF SUMA ROYAL Kenya - Our Journey Since 2006",
  description:
    "Discover BF SUMA's journey from Los Angeles in 2006 to becoming a trusted global wellness brand across 15+ countries. Learn about our mission, vision, and 15+ years of impact in Africa.",
  url: "https://bfsuma-glow-hub.lovable.app/about",
  mainEntity: {
    "@type": "Organization",
    name: "BF SUMA ROYAL Kenya",
    alternateName: ["BF SUMA", "Bright Future Superior Unique Manufacturer of America"],
    foundingDate: "2006",
    foundingLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Los Angeles",
        addressRegion: "California",
        addressCountry: "USA",
      },
    },
    numberOfEmployees: "1000+",
    areaServed: "15+ Countries",
    url: "https://bfsuma-glow-hub.lovable.app",
    logo: "https://bfsuma-glow-hub.lovable.app/favicon.png",
    sameAs: [
      "https://www.facebook.com/profile.php?id=100067452825041",
      "https://www.instagram.com/ochiengbraghiton254",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+254795454053",
      contactType: "sales",
      availableLanguage: ["English", "Swahili"],
    },
    hasCredential: [
      { "@type": "EducationalOccupationalCredential", credentialCategory: "GMP Certified" },
      { "@type": "EducationalOccupationalCredential", credentialCategory: "ISO 9001:2015" },
      { "@type": "EducationalOccupationalCredential", credentialCategory: "Halal Certified" },
      { "@type": "EducationalOccupationalCredential", credentialCategory: "FDA Registered" },
    ],
  },
};

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About BF SUMA ROYAL Kenya - Our Journey Since 2006</title>
        <meta
          name="description"
          content="Discover BF SUMA's journey from Los Angeles in 2006 to becoming a trusted global wellness brand. Learn about our 15+ years of impact in Africa, mission, vision, and core values."
        />
        <meta
          name="keywords"
          content="BF SUMA history, BF SUMA journey, wellness company Kenya, natural supplements manufacturer, BF SUMA Africa, health products Kenya, GMP certified supplements"
        />
        <link rel="canonical" href="https://bfsuma-glow-hub.lovable.app/about" />

        {/* Open Graph */}
        <meta property="og:title" content="About BF SUMA ROYAL Kenya - Our Journey Since 2006" />
        <meta
          property="og:description"
          content="From Los Angeles in 2006 to 15+ countries today. Discover BF SUMA's journey of innovation, growth, and wellness impact across Africa."
        />
        <meta property="og:url" content="https://bfsuma-glow-hub.lovable.app/about" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bfsuma-glow-hub.lovable.app/og-image.png" />
        <meta property="og:site_name" content="BF SUMA ROYAL Kenya" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About BF SUMA ROYAL Kenya - Our Journey Since 2006" />
        <meta
          name="twitter:description"
          content="From Los Angeles in 2006 to 15+ countries today. Discover BF SUMA's journey of innovation and wellness impact."
        />
        <meta name="twitter:image" content="https://bfsuma-glow-hub.lovable.app/og-image.png" />

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
              Our{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Journey
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed mb-8">
              From Los Angeles in 2006 to a trusted global wellness brand across 15+ countries —
              helping people live healthier lives and build brighter futures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                To improve the quality of life worldwide by providing effective, safe, and innovative
                health and wellness products.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-card rounded-2xl p-8 border border-border"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-6">
                <Globe className="w-7 h-7 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-muted-foreground leading-relaxed">
                To become a trusted global leader in wellness, empowering individuals and communities
                across the world.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The BF SUMA Story</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A chronological journey from our founding to becoming a global wellness leader.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-translate-x-1/2" />

            {timelineEvents.map((event, index) => {
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                  className={`relative flex items-start gap-6 mb-12 last:mb-0 ${
                    isEven ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Year bubble */}
                  <div
                    className={`absolute left-0 md:left-1/2 md:-translate-x-1/2 z-10 flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm ${
                      event.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border-2 border-primary text-primary"
                    }`}
                  >
                    {event.year.length > 4 ? (
                      <span className="text-xs text-center leading-tight px-1">{event.year}</span>
                    ) : (
                      event.year
                    )}
                  </div>

                  {/* Content card */}
                  <div
                    className={`ml-24 md:ml-0 md:w-[calc(50%-4rem)] ${
                      isEven ? "md:pr-8 md:text-right" : "md:pl-8 md:text-left"
                    }`}
                  >
                    <div
                      className={`bg-card rounded-xl p-6 border ${
                        event.highlight ? "border-primary shadow-lg" : "border-border"
                      }`}
                    >
                      <h3 className="text-xl font-bold mb-2 text-foreground">{event.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block md:w-[calc(50%-4rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Innovation Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Innovation & Global Reach</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our commitment to research and development has led to major achievements.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Sparkles, value: "200+", label: "Supplement Formulations" },
              { icon: Globe, value: "15+", label: "Countries Worldwide" },
              { icon: Award, value: "5", label: "International Patents" },
              { icon: CheckCircle, value: "100%", label: "U.S. Quality Standards" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                className="bg-card rounded-2xl p-6 text-center border border-border hover:border-primary transition-all duration-300"
              >
                <stat.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at BF SUMA.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
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
      <section className="py-16">
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
      <section className="py-16 bg-muted/30">
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
