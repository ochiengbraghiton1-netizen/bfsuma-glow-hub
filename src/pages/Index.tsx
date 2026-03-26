import { lazy, Suspense } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Lazy-load below-the-fold sections
const DoctorConsultation = lazy(() => import("@/components/DoctorConsultation"));
const ProductShowcase = lazy(() => import("@/components/ProductShowcase"));
const Testimonials = lazy(() => import("@/components/Testimonials"));
const JoinEarn = lazy(() => import("@/components/JoinEarn"));
const Community = lazy(() => import("@/components/Community"));
const About = lazy(() => import("@/components/About"));
const FAQ = lazy(() => import("@/components/FAQ"));
const Contact = lazy(() => import("@/components/Contact"));
const Chatbot = lazy(() => import("@/components/Chatbot"));
const CommunityStories = lazy(() => import("@/components/blog/CommunityStories"));
const SocialFeed = lazy(() => import("@/components/SocialFeed"));
const NewsletterSignup = lazy(() => import("@/components/NewsletterSignup"));
const ExitIntentPopup = lazy(() => import("@/components/ExitIntentPopup"));
const StructuredData = lazy(() => import("@/components/StructuredData"));

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <Hero />
        {/* Priority below-fold: testimonials + products */}
        <Suspense fallback={null}>
          <DoctorConsultation />
          <Testimonials />
          <ProductShowcase />
        </Suspense>
        {/* Secondary content - deferred further */}
        <Suspense fallback={null}>
          <CommunityStories />
          <SocialFeed />
          <About />
          <FAQ />
        </Suspense>
        {/* Tertiary content */}
        <Suspense fallback={null}>
          <JoinEarn />
          <Community />
          <Contact />
          <NewsletterSignup />
        </Suspense>
        {/* Interactive overlays + structured data - lowest priority */}
        <Suspense fallback={null}>
          <StructuredData />
          <Chatbot />
          <ExitIntentPopup />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
