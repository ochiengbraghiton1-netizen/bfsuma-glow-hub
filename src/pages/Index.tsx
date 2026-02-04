import Hero from "@/components/Hero";
import Header from "@/components/Header";
import DoctorConsultation from "@/components/DoctorConsultation";
import ProductShowcase from "@/components/ProductShowcase";
import Testimonials from "@/components/Testimonials";
import JoinEarn from "@/components/JoinEarn";
import Community from "@/components/Community";
import About from "@/components/About";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";
import StructuredData from "@/components/StructuredData";

// FAQ data for structured data
const faqData = [
  {
    question: "What is BF SUMA?",
    answer: "BF SUMA ROYAL is a global health and wellness company founded in 2011, offering premium natural supplements backed by scientific research. We operate in over 40 countries, helping people improve their health while providing legitimate business opportunities through our network marketing model."
  },
  {
    question: "Are BF SUMA ROYAL products safe and certified?",
    answer: "Yes, all BF SUMA ROYAL products are manufactured in GMP-certified facilities and undergo rigorous quality testing. Our products are made from 100% natural ingredients and are certified by relevant health authorities. We hold HALAL certification for applicable products."
  },
  {
    question: "How does the BF SUMA ROYAL business opportunity work?",
    answer: "You can join as a BF SUMA ROYAL distributor by paying a one-time registration fee of KES 7,000. As a member, you earn through product sales commissions, team bonuses, and leadership rewards. There's no requirement to buy large inventories - you can start small and grow at your own pace."
  },
  {
    question: "Is BF SUMA ROYAL a pyramid scheme?",
    answer: "No, BF SUMA ROYAL is a legitimate network marketing company. Unlike pyramid schemes, our income is based on actual product sales, not recruitment alone. We sell real health products with genuine value, and our compensation plan rewards both sales and team building ethically."
  },
  {
    question: "What products does BF SUMA ROYAL offer?",
    answer: "We offer a wide range of natural health supplements including: NMN Capsules for cellular health, Ganoderma Spore Capsules for immunity, ArthroXtra for joint support, Feminegy for women's health, X-Power Man for men's vitality, and many more specialized wellness products."
  },
  {
    question: "How much can I earn with BF SUMA ROYAL?",
    answer: "Earnings vary based on your effort and team size. New distributors can earn 15-30% commission on personal sales. As you build a team and advance in rank, you unlock additional bonuses. Top performers earn significant monthly incomes, but results depend on individual commitment."
  },
  {
    question: "How do I get started as a BF SUMA ROYAL distributor in Kenya?",
    answer: "Getting started is simple: 1) Register through our website or contact us on WhatsApp, 2) Pay the KES 7,000 registration fee, 3) Receive your membership and starter resources, 4) Begin sharing products and building your team with our full support."
  }
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <StructuredData faqs={faqData} />
      <Header />
      <main className="pt-16"> {/* Offset for fixed header */}
        <Hero />
        <DoctorConsultation />
        <Testimonials />
        <ProductShowcase />
        <About />
        <FAQ />
        <JoinEarn />
        <Community />
        <Contact />
        <Chatbot />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
