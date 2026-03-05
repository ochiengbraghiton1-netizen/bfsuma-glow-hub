import { useMemo, lazy, Suspense } from "react";
import Hero from "@/components/Hero";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";
import { useProducts } from "@/hooks/use-products";
import { useProductRatings } from "@/hooks/use-product-ratings";

// Lazy-load below-the-fold sections to reduce main-thread work
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

// FAQ data for structured data
const faqData = [
  {
    question: "What is BF SUMA Royal?",
    answer: "BF SUMA Royal is a global health and wellness company offering premium natural supplements backed by scientific research. We operate in over 40 countries, helping people improve their health while providing legitimate business opportunities through our network marketing model."
  },
  {
    question: "Are BF SUMA Royal products safe and certified?",
    answer: "Yes, all BF SUMA Royal products are manufactured in GMP-certified facilities and undergo rigorous quality testing. Our products are made from 100% natural ingredients and are certified by relevant health authorities. We hold HALAL certification for applicable products."
  },
  {
    question: "How does the BF SUMA Royal business opportunity work?",
    answer: "You can join as a BF SUMA Royal distributor by paying a one-time registration fee of KES 7,000. As a member, you earn through product sales commissions, team bonuses, and leadership rewards. There's no requirement to buy large inventories - you can start small and grow at your own pace."
  },
  {
    question: "Is BF SUMA Royal a pyramid scheme?",
    answer: "No, BF SUMA Royal is a legitimate network marketing company. Unlike pyramid schemes, our income is based on actual product sales, not recruitment alone. We sell real health products with genuine value, and our compensation plan rewards both sales and team building ethically."
  },
  {
    question: "What products does BF SUMA Royal offer?",
    answer: "We offer a wide range of natural health supplements including: NMN Capsules for cellular health, Ganoderma Spore Capsules for immunity, ArthroXtra for joint support, Feminegy for women's health, X-Power Man for men's vitality, and many more specialized wellness products."
  },
  {
    question: "How much can I earn with BF SUMA Royal?",
    answer: "Earnings vary based on your effort and team size. New distributors can earn 15-30% commission on personal sales. As you build a team and advance in rank, you unlock additional bonuses. Top performers earn significant monthly incomes, but results depend on individual commitment."
  },
  {
    question: "How do I get started as a BF SUMA Royal distributor in Kenya?",
    answer: "Getting started is simple: 1) Register through our website or contact us on WhatsApp, 2) Pay the KES 7,000 registration fee, 3) Receive your membership and starter resources, 4) Begin sharing products and building your team with our full support."
  }
];

const Index = () => {
  const { products } = useProducts();
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  const { data: productRatings } = useProductRatings(productIds);
  
  return (
    <div className="min-h-screen">
      <StructuredData faqs={faqData} products={products} productRatings={productRatings} />
      <Header />
      <main className="pt-16"> {/* Offset for fixed header */}
        <Hero />
        <DoctorConsultation />
        <Testimonials />
        <ProductShowcase />
        <CommunityStories />
        <SocialFeed />
        <About />
        <FAQ />
        <JoinEarn />
        <Community />
        <Contact />
        <NewsletterSignup />
        <Chatbot />
        <ExitIntentPopup />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
