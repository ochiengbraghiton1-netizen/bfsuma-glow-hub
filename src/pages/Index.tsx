import { lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";

// Lazy-load Header (contains Sheet/Radix Dialog — heavy) to reduce TBT
const Header = lazy(() => import("@/components/Header"));
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

const StoriesInsights = lazy(() => import("@/components/StoriesInsights"));
const NewsletterSignup = lazy(() => import("@/components/NewsletterSignup"));
const RealPeopleSection = lazy(() => import("@/components/RealPeopleSection"));
const HealthQuizPopup = lazy(() => import("@/components/HealthQuizPopup"));
const StructuredData = lazy(() => import("@/components/StructuredData"));
const ConsultationCTA = lazy(() => import("@/components/ConsultationCTA"));
const SectionNav = lazy(() => import("@/components/SectionNav"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>BF SUMA Royal | Premium Supplements in Kenya for Energy & Immunity</title>
        <meta name="description" content="Shop trusted natural supplements in Kenya. Boost energy, improve immunity, and support your health with BF SUMA Royal premium wellness products." />
        <link rel="canonical" href="https://bfsumaroyal.com/" />
        <meta property="og:title" content="BF SUMA Royal | Premium Supplements in Kenya for Energy & Immunity" />
        <meta property="og:description" content="Shop trusted natural supplements in Kenya. Boost energy, improve immunity, and support your health with BF SUMA Royal premium wellness products." />
        <meta property="og:url" content="https://bfsumaroyal.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bfsumaroyal.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BF SUMA Royal | Premium Supplements in Kenya" />
        <meta name="twitter:description" content="Shop trusted natural supplements in Kenya. Boost energy, immunity & overall wellness with BF SUMA Royal." />
        <meta name="twitter:image" content="https://bfsumaroyal.com/og-image.png" />
      </Helmet>
      <Suspense fallback={<div className="h-16" />}>
        <Header />
      </Suspense>
      <main className="pt-16">
        <Hero />
        <Suspense fallback={null}>
          <RealPeopleSection />
        </Suspense>
        {/* Priority below-fold: testimonials + products */}
        <div className="content-auto">
          <Suspense fallback={null}>
            <DoctorConsultation />
            <ExpertAuthority />
            <Testimonials />
            <ConsultationCTA
              headline="Still unsure? Talk to a wellness expert now."
              subtext="Get free personalised advice on the best supplements for your health goals."
            />
            <CaseStudies />
            <ProductShowcase />
            <ConsultationCTA
              headline="Need help choosing the right product?"
              subtext="Our team can recommend the perfect supplement based on your needs."
            />
          </Suspense>
        </div>
        {/* Secondary content - deferred further */}
        <div className="content-auto">
          <Suspense fallback={null}>
            <StoriesInsights />
            <About />
            <FAQ />
          </Suspense>
        </div>
        {/* Tertiary content */}
        <div className="content-auto">
          <Suspense fallback={null}>
            <JoinEarn />
            <Community />
            <Contact />
            <NewsletterSignup />
            <CertificationsBadges />
          </Suspense>
        </div>
        {/* Interactive overlays + structured data - lowest priority */}
        <Suspense fallback={null}>
          <StructuredData />
          <SectionNav />
          <HealthQuizPopup />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Index;
