import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroBg from "@/assets/wellness-hero.jpg";

const Hero = () => {
  const navigate = useNavigate();
  
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  const goToJoinBusiness = () => {
    navigate("/join-business");
  };

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Hero background image - LCP element */}
      <img
        src={heroBg}
        alt="BF SUMA Royal premium wellness supplements and natural health products display"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: "center" }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/90 via-secondary/70 to-primary/80" />
      
      {/* Floating particles animation */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-accent/30"
            style={{
              width: Math.random() * 10 + 5 + "px",
              height: Math.random() * 10 + 5 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              animation: `float ${Math.random() * 6 + 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-6 animate-scale-in">
          <Sparkles className="w-6 h-6 text-accent animate-glow" />
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">
            Trusted Wellness Products
          </span>
          <Sparkles className="w-6 h-6 text-accent animate-glow" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Premium Supplements for Better Health
          <br />
          <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
            Backed by a Real Business Opportunity
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
          BF SUMA Royal offers trusted wellness products designed to support your health journey. Whether you're looking for quality supplements or a flexible way to earn, you've come to the right place.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            onClick={scrollToProducts}
            variant="premium" 
            size="xl"
            className="group"
          >
            Buy Products
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            onClick={goToJoinBusiness}
            variant="glass" 
            size="xl"
          >
            Join the Business
          </Button>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
