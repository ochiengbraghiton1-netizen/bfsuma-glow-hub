import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, Stethoscope, Heart, Calendar } from "lucide-react";
import doctorImg from "@/assets/doctor-consultation.jpg";

const DoctorConsultation = () => {
  const openWhatsApp = () => {
    const message = encodeURIComponent("Hi! I'd like to book a free wellness consultation.");
    window.open(`https://wa.me/254795454053?text=${message}`, "_blank");
  };

  const benefits = [
    {
      icon: Stethoscope,
      title: "Expert Guidance",
      description: "Certified wellness professionals",
    },
    {
      icon: Heart,
      title: "Personalized Care",
      description: "Tailored health recommendations",
    },
    {
      icon: Calendar,
      title: "Free Consultation",
      description: "No-cost initial assessment",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Consult a Wellness Expert
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get personalized health guidance from certified wellness doctors. Book a free consultation today and begin your journey to better health.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center max-w-6xl mx-auto">
          {/* Image Section */}
          <div className="relative group animate-scale-in">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
            <img
              src={doctorImg}
              alt="Wellness consultation"
              className="relative rounded-3xl shadow-elegant w-full h-[400px] object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="space-y-6">
            <div className="grid gap-4">
              {benefits.map((benefit, index) => (
                <Card
                  key={index}
                  className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-br from-primary to-accent">
                      <benefit.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1 text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Button
              onClick={openWhatsApp}
              variant="hero"
              size="xl"
              className="w-full"
            >
              <MessageCircle className="w-5 h-5" />
              Book a Consultation
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Available via WhatsApp • Response within 24 hours
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DoctorConsultation;
