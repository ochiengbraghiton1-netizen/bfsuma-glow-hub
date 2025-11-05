import Hero from "@/components/Hero";
import DoctorConsultation from "@/components/DoctorConsultation";
import ProductShowcase from "@/components/ProductShowcase";
import JoinEarn from "@/components/JoinEarn";
import Community from "@/components/Community";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <DoctorConsultation />
      <ProductShowcase />
      <JoinEarn />
      <Community />
      <About />
      <Contact />
      <Chatbot />
      <Footer />
    </div>
  );
};

export default Index;
