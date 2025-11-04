import { Shield, Globe, Award, Leaf } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Globe,
      title: "Global Brand",
      description: "Trusted worldwide for premium wellness products"
    },
    {
      icon: Leaf,
      title: "Natural Ingredients",
      description: "100% natural supplements with proven efficacy"
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "Scientifically tested and certified formulations"
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized excellence in health innovation"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            About{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BF SUMA
            </span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            BF SUMA is a global health and wellness brand offering premium natural supplements 
            that support longevity, immunity, and overall vitality. Trusted worldwide, 
            now empowering entrepreneurs in Kenya to build successful wellness businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="bg-card rounded-2xl p-8 text-center border border-border hover:border-primary transition-all duration-300 hover:shadow-glow hover:-translate-y-2 animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;
