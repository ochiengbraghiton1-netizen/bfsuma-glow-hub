import { FlaskConical, ShieldCheck, MessageCircle, Users } from "lucide-react";

const points = [
  {
    icon: FlaskConical,
    title: "Clinically Tested Formulations",
    copy: "Every supplement is backed by research and manufactured to strict quality standards.",
  },
  {
    icon: ShieldCheck,
    title: "GMP & Halal Certified",
    copy: "Produced in certified facilities meeting global safety and dietary standards.",
  },
  {
    icon: MessageCircle,
    title: "Free Wellness Guidance",
    copy: "Chat with our team on WhatsApp for personalised, no-pressure advice.",
  },
  {
    icon: Users,
    title: "1,000+ Kenyans Supported",
    copy: "Trusted by customers across Nairobi, Mombasa, Kisumu and beyond.",
  },
];

const WhyTrustUs = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Customers Trust Us</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Real quality, real support and real results, the foundation of BF SUMA Royal.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {points.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="bg-card border border-border/60 rounded-2xl p-6 hover:border-primary/40 hover:shadow-elegant transition-all text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyTrustUs;
