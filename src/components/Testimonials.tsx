import { Star, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah M.",
    location: "Nairobi",
    text: "The NMN capsules have given me so much more energy. I feel 10 years younger!",
    rating: 5,
    product: "NMN Capsules"
  },
  {
    name: "John K.",
    location: "Mombasa", 
    text: "ArthroXtra has been life-changing for my joint pain. I can walk without discomfort now.",
    rating: 5,
    product: "ArthroXtra Tablets"
  },
  {
    name: "Grace W.",
    location: "Kisumu",
    text: "The consultation was so helpful. They recommended exactly what I needed.",
    rating: 5,
    product: "Free Consultation"
  }
];

const certifications = [
  { name: "GMP Certified", description: "Good Manufacturing Practice" },
  { name: "Halal Certified", description: "Islamic Dietary Standard" },
  { name: "ISO 22000", description: "Food Safety Management" },
  { name: "KEBS Approved", description: "Kenya Bureau of Standards" },
];

const Testimonials = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {certifications.map((cert, index) => (
            <div 
              key={cert.name}
              className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-medium text-foreground">{cert.name}</span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Trusted by Thousands
          </h3>
          <p className="text-muted-foreground">
            Real results from real customers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 bg-card border-border/50 hover:shadow-glow transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${(index + 4) * 100}ms` }}
            >
              <Quote className="w-8 h-8 text-primary/30 mb-4" />
              <p className="text-foreground mb-4 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location} • {testimonial.product}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
