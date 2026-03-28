import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import Header from "@/components/Header";

const Footer = lazy(() => import("@/components/Footer"));

// Lazy-load below-the-fold sections
const DoctorConsultation = lazy(() => import("@/components/DoctorConsultation"));
const ProductShowcase = lazy(() => import("@/components/ProductShowcase"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const ExpertAuthority = lazy(() => import("@/components/ExpertAuthority"));
const CaseStudies = lazy(() => import("@/components/CaseStudies"));
const CertificationsBadges = lazy(() => import("@/components/CertificationsBadges"));
const JoinEarn = lazy(() => import("@/components/JoinEarn"));
const Community = lazy(() => import("@/components/Community"));
const About = lazy(() => import("@/components/About"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Contact = lazy(() => import("@/components/Contact"));
const Chatbot = lazy(() => import("@/components/Chatbot"));
const StoriesInsights = lazy(() => import("@/components/StoriesInsights"));
const NewsletterSignup = lazy(() => import("@/components/NewsletterSignup"));
const ExitIntentPopup = lazy(() => import("@/components/ExitIntentPopup"));
const StructuredData = lazy(() => import("@/components/StructuredData"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>BF SUMA Royal Kenya | Natural Health Supplements & Business</title>
        <meta name="description" content="Discover natural health supplements in Kenya. Boost energy, balance hormones, and improve wellness. Shop now at BF SUMA Royal." />
        <link rel="canonical" href="https://bfsumaroyal.com/" />
        <meta property="og:title" content="BF SUMA Royal Kenya | Natural Health Supplements & Business" />
        <meta property="og:description" content="Discover natural health supplements in Kenya. Boost energy, balance hormones, and improve wellness. Shop now at BF SUMA Royal." />
        <meta property="og:url" content="https://bfsumaroyal.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bfsumaroyal.com/og-image.png" />
      </Helmet>
      <Header />
      <main className="pt-16">
        <Hero />
        {/* Priority below-fold: testimonials + products */}
        <Suspense fallback={null}>
          <DoctorConsultation />
          <ExpertAuthority />
          <Testimonials />
          <CaseStudies />
          <ProductShowcase />
        </Suspense>
        {/* Secondary content - deferred further */}
        <Suspense fallback={null}>
          <StoriesInsights />
          <About />
          <FAQ />
        </Suspense>
        {/* Tertiary content */}
        <Suspense fallback={null}>
          <JoinEarn />
          <Community />
          <Contact />
          <NewsletterSignup />
          <CertificationsBadges />
        </Suspense>
        {/* Interactive overlays + structured data - lowest priority */}
        <Suspense fallback={null}>
          <StructuredData />
          <Chatbot />
          <ExitIntentPopup />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
