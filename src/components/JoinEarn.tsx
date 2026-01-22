import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Award, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import joinEarnBg from "@/assets/join-earn-bg.jpg";

const JoinEarn = () => {
  const navigate = useNavigate();
  
  const goToJoinBusiness = () => {
    navigate("/join-business");
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: "Earn Income",
      description: "Build a profitable business with generous commissions"
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with like-minded wellness entrepreneurs"
    },
    {
      icon: Award,
      title: "Get Recognition",
      description: "Unlock bonuses, rewards, and achievement milestones"
    }
  ];

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background image - lazy loaded */}
      <img
        src={joinEarnBg}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/95 via-primary/90 to-secondary/95" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
            Turn Your Health Passion into{" "}
            <span className="bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              Income
            </span>
          </h2>
          
          <p className="text-xl mb-12 text-white/90 leading-relaxed animate-fade-in">
            Partner with BF SUMA Kenya as an independent distributor. 
            Sell health supplements, earn points, bonuses, and commissions — 
            while promoting wellness and changing lives.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-12 h-12 text-accent mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                  <p className="text-white/80">{benefit.description}</p>
                </div>
              );
            })}
          </div>

          <Button 
            onClick={goToJoinBusiness}
            variant="premium" 
            size="xl"
            className="group animate-scale-in"
          >
            Join the Business
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JoinEarn;
