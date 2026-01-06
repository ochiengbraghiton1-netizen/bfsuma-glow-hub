import Hero from "@/components/Hero";
import Header from "@/components/Header";
import DoctorConsultation from "@/components/DoctorConsultation";
import ProductShowcase from "@/components/ProductShowcase";
import Testimonials from "@/components/Testimonials";
import JoinEarn from "@/components/JoinEarn";
import Community from "@/components/Community";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16"> {/* Offset for fixed header */}
        <Hero />
        <DoctorConsultation />
        <Testimonials />
        <ProductShowcase />
        <JoinEarn />
        <Community />
        <About />
        <Contact />
        <Chatbot />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
