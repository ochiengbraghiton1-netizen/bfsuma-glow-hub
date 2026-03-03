import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FAQ from "@/components/FAQ";

const FAQPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default FAQPage;
