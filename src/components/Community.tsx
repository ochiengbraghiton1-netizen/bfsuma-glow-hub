import { Button } from "@/components/ui/button";
import { MessageCircle, GraduationCap, Heart } from "lucide-react";
import communityBg from "@/assets/community-bg.jpg";

const Community = () => {
  const openWhatsApp = () => {
    window.open("https://wa.me/254795454053", "_blank");
  };

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background image - lazy loaded */}
      <img
        src={communityBg}
        alt="BF SUMA Royal wellness community training and mentorship program"
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-muted/95" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-6 py-2 rounded-full mb-8 animate-scale-in">
            <Heart className="w-5 h-5" />
            <span className="font-semibold">Community & Training</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground animate-fade-in">
            Grow Your{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Health Business
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed animate-fade-in">
            We offer free mentorship and training to help you grow your health business. 
            Join our wellness community and achieve financial freedom through BF SUMA.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary transition-all duration-300 hover:shadow-glow animate-scale-in">
              <GraduationCap className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">Free Training</h3>
              <p className="text-muted-foreground">
                Access comprehensive business training and product knowledge to succeed as a distributor
              </p>
            </div>

            <div className="bg-card rounded-2xl p-8 border border-border hover:border-accent transition-all duration-300 hover:shadow-gold animate-scale-in" style={{ animationDelay: "0.1s" }}>
              <MessageCircle className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-3 text-foreground">Personal Mentorship</h3>
              <p className="text-muted-foreground">
                Get one-on-one guidance from experienced wellness entrepreneurs
              </p>
            </div>
          </div>

          <Button 
            onClick={openWhatsApp}
            variant="hero" 
            size="xl"
            className="group animate-scale-in"
          >
            <MessageCircle className="w-5 h-5" />
            Chat with Braghiton
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Community;
