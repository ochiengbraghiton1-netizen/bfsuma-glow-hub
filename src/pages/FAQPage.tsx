import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ, { faqs } from "@/components/FAQ";
import PageSEO from "@/components/PageSEO";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
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
        title="FAQ | Delivery, M-Pesa, Authenticity | BF Suma Royal Kenya"
        description="Answers on delivery areas, M-Pesa payment, order tracking and how to verify genuine BF Suma products in Kenya."
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
