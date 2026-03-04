import { ArrowRight, Sparkles, ShoppingBag, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: "spring", stiffness: 120 }}
            className="w-full sm:w-auto"
          >
            <button
              onClick={scrollToProducts}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 h-[4.5rem] px-14 text-[1.35rem] font-extrabold tracking-wide rounded-2xl bg-accent text-accent-foreground shadow-[0_0_50px_hsl(43_96%_56%/0.6),0_8px_32px_hsl(43_96%_56%/0.35)] hover:shadow-[0_0_70px_hsl(43_96%_56%/0.8),0_12px_40px_hsl(43_96%_56%/0.5)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ease-out animate-cta-pulse"
            >
              <ShoppingBag className="w-7 h-7" />
              Buy Products
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1.5 transition-transform duration-300" />
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.6, type: "spring", stiffness: 120 }}
            className="w-full sm:w-auto"
          >
            <button
              onClick={goToJoinBusiness}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 h-[4.5rem] px-14 text-[1.35rem] font-extrabold tracking-wide rounded-2xl bg-white/15 backdrop-blur-md text-white border-2 border-accent shadow-[0_0_30px_hsl(43_96%_56%/0.25),inset_0_1px_0_hsl(0_0%_100%/0.15)] hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_50px_hsl(43_96%_56%/0.6),0_8px_32px_hsl(43_96%_56%/0.35)] hover:scale-[1.04] active:scale-[0.98] transition-all duration-300 ease-out"
            >
              <Users className="w-7 h-7" />
              Join the Business
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
