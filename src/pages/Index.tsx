import Hero from "@/components/Hero";
import DoctorConsultation from "@/components/DoctorConsultation";
import ProductShowcase from "@/components/ProductShowcase";
import JoinEarn from "@/components/JoinEarn";
import Community from "@/components/Community";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Chatbot from "@/components/Chatbot";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";

const Index = () => {
  return (
    <div className="min-h-screen">
      <ThemeToggle />
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
