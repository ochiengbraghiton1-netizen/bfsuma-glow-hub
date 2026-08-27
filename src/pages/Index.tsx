import { lazy, Suspense, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import Hero from "@/components/Hero";
import Header from "@/components/Header";

const Footer = lazy(() => import("@/components/Footer"));

/**
 * Mounts children only after the first paint, so below-the-fold chunks and
 * their data fetches never compete with the hero (LCP) for network/CPU.
 */
function useAfterPaint() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    const raf = requestAnimationFrame(() => {
      if (w.requestIdleCallback) w.requestIdleCallback(() => setReady(true), { timeout: 800 });
      else setTimeout(() => setReady(true), 0);
    });
    return () => cancelAnimationFrame(raf);
  }, []);
  return ready;
}

// Lazy-load below-the-fold sections
const ProductShowcase = lazy(() => import("@/components/ProductShowcase"));
const RealResultsMerged = lazy(() => import("@/components/RealResultsMerged"));
const WhyTrustUs = lazy(() => import("@/components/WhyTrustUs"));
const CertificationsStrip = lazy(() => import("@/components/CertificationsStrip"));
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
const ShopByHealthGoal = lazy(() => import("@/components/ShopByHealthGoal"));

const Index = () => {
  const belowFoldReady = useAfterPaint();

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Natural Support for Joint Pain, Energy & Digestion | BF SUMA Royal Kenya</title>
        <meta name="description" content="Helping Kenyans feel better naturally with supplements for joint pain, low energy, bloating, hormonal balance and sleep. Free WhatsApp guidance." />
        <link rel="canonical" href="https://bfsumaroyal.com/" />
        <meta property="og:title" content="Feel Better Naturally | Joint, Energy, Digestion & Hormone Support | BF SUMA Royal" />
        <meta property="og:description" content="Trusted natural supplements for stiff joints, fatigue, bloating, hormonal balance and everyday wellness in Kenya." />
        <meta property="og:url" content="https://bfsumaroyal.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://bfsumaroyal.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BF SUMA Royal | Premium Supplements in Kenya" />
        <meta name="twitter:description" content="Shop trusted natural supplements in Kenya. Boost energy, immunity & overall wellness with BF SUMA Royal." />
        <meta name="twitter:image" content="https://bfsumaroyal.com/og-image.png" />
      </Helmet>
      <Header />
      <main className="pt-16">
        {/* 1. Hero */}
        <Hero />

        {/* Everything below the fold mounts after first paint so it cannot
            delay the hero (LCP). Section order and content are unchanged. */}
        {belowFoldReady && (
          <>
            <div className="content-auto">
              <Suspense fallback={null}>
                {/* 2. Certification strip */}
                <CertificationsStrip />

                {/* 3. What's bothering you today? (includes "Not sure yet?" block) */}
                <ShopByHealthGoal />

                {/* 5. Premium Products */}
                <ProductShowcase />

                {/* 6. Real Results from Real Kenyans (merged before/after + quotes) */}
                <RealResultsMerged />

                {/* 7. Single consultation CTA */}
                <ConsultationCTA
                  headline="Still unsure? Talk to a wellness expert now."
                  subtext="Get free personalised advice on the best supplements for your health goals."
                />

                {/* Why Customers Trust Us (replaces AI expert photos) */}
                <WhyTrustUs />
              </Suspense>
            </div>

            {/* Blog posts */}
            <div className="content-auto">
              <Suspense fallback={null}>
                <StoriesInsights />
                <About />
                <FAQ />
              </Suspense>
            </div>

            <div className="content-auto">
              <Suspense fallback={null}>
                <JoinEarn />
                <Community />
                <Contact />
                <NewsletterSignup />
              </Suspense>
            </div>

            {/* Final section above footer: community photos */}
            <div className="content-auto">
              <Suspense fallback={null}>
                <RealPeopleSection />
              </Suspense>
            </div>

            <Suspense fallback={null}>
              <StructuredData />
              <SectionNav />
              <HealthQuizPopup />
            </Suspense>
          </>
        )}
      </main>
      {belowFoldReady && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
    </div>
  );
};

export default Index;
