import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import PageSEO from "@/components/PageSEO";

const faqSchemaData = [
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
    answer: "You can join as a BF SUMA Royal distributor by paying a one-time registration fee of KES 7,000. As a member, you earn through product sales commissions, team bonuses, and leadership rewards."
  },
  {
    question: "Is BF SUMA Royal a pyramid scheme?",
    answer: "No, BF SUMA Royal is a legitimate network marketing company. Unlike pyramid schemes, our income is based on actual product sales, not recruitment alone."
  },
  {
    question: "What products does BF SUMA Royal offer?",
    answer: "We offer a wide range of natural health supplements including: NMN Capsules for cellular health, Ganoderma Spore Capsules for immunity, ArthroXtra for joint support, Feminegy for women's health, X-Power Man for men's vitality, and many more."
  },
  {
    question: "How do I get started as a BF SUMA Royal distributor in Kenya?",
    answer: "Getting started is simple: Register through our website or contact us on WhatsApp, pay the KES 7,000 registration fee, receive your membership and starter resources, then begin sharing products and building your team."
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqSchemaData.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};

const FAQPage = () => {
  return (
    <div className="min-h-screen">
      <PageSEO
        title="FAQ – BF SUMA Royal Kenya | Your Questions Answered"
        description="Get answers about BF SUMA supplements, distributor program & business opportunity in Kenya. Product safety, earnings, delivery & more. Learn now."
        path="/faq"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Header />
      <main className="pt-16">
        <h1 className="sr-only">Frequently Asked Questions – BF SUMA Royal Kenya</h1>
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
