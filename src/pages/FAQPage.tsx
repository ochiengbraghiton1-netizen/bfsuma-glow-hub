import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";
import PageSEO from "@/components/PageSEO";

const FAQPage = () => {
  return (
    <div className="min-h-screen">
      <PageSEO
        title="FAQ | BF SUMA Royal Kenya - Common Questions"
        description="Frequently asked questions about BF SUMA Royal products, business opportunity, and distributor program in Kenya."
        path="/faq"
      />
      <Header />
      <main className="pt-16">
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
