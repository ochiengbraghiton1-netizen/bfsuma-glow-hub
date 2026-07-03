import { Star, ArrowRight, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import HorizontalCarousel, { CarouselItem } from "@/components/ui/horizontal-carousel";

const caseStudies = [
  {
    name: "Jane Akinyi",
    location: "Nairobi",
    before: "Constant fatigue and low energy levels affecting daily productivity",
    after: "Improved energy and focus within 3 weeks of consistent use",
    product: "NMN Sharp Mind",
    rating: 5,
  },
  {
    name: "Peter Omondi",
    location: "Kisumu",
    before: "Joint stiffness making morning walks painful and difficult",
    after: "Noticeable improvement in joint flexibility after 4 weeks",
    product: "ArthroXtra Tablets",
    rating: 5,
  },
  {
    name: "Mary Wambui",
    location: "Nakuru",
    before: "Frequent digestive discomfort and irregular digestion",
    after: "Improved digestive comfort and regularity within 2 weeks",
    product: "ConstiRelax",
    rating: 5,
  },
  {
    name: "Samuel Kiprop",
    location: "Eldoret",
    before: "Low stamina during workouts and slow recovery times",
    after: "Better endurance and faster recovery noticed in 3 weeks",
    product: "Gym Effect",
    rating: 4,
  },
  {
    name: "Agnes Njeri",
    location: "Mombasa",
    before: "Hormonal imbalance affecting mood and daily well-being",
    after: "Felt more balanced and comfortable after one month of use",
    product: "Feminegy Capsules",
    rating: 5,
  },
];

const quotes = [
  {
    name: "Sarah M.",
    location: "Nairobi",
    text: "The NMN capsules have given me so much more energy. I feel 10 years younger!",
    rating: 5,
    product: "NMN Capsules",
  },
  {
    name: "John K.",
    location: "Mombasa",
    text: "ArthroXtra has been life-changing for my joint pain. I can walk without discomfort now.",
    rating: 5,
    product: "ArthroXtra Tablets",
  },
  {
    name: "Grace W.",
    location: "Kisumu",
    text: "The consultation was so helpful. They recommended exactly what I needed.",
    rating: 5,
    product: "Free Consultation",
  },
];

const RealResultsMerged = () => {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-foreground">
            Real Results from Real Kenyans
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Genuine before-and-after journeys from customers across Kenya.
          </p>
        </div>

        {/* Before / After primary format */}
        <HorizontalCarousel ariaLabel="Customer before and after results">
          {caseStudies.map((study, idx) => (
            <CarouselItem key={idx}>
              <Card className="p-5 bg-card border-border/50 hover:shadow-glow transition-shadow duration-300 h-full">
                <div className="flex items-center gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < study.rating ? "fill-accent text-accent" : "text-border"}`}
                    />
                  ))}
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-destructive/10 text-destructive flex items-center justify-center text-xs font-bold">
                      B
                    </span>
                    <p className="text-sm text-muted-foreground">{study.before}</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      A
                    </span>
                    <p className="text-sm text-foreground font-medium">{study.after}</p>
                  </div>
                </div>
                <div className="border-t border-border/50 pt-3">
                  <p className="font-semibold text-foreground text-sm">{study.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {study.location} • {study.product}
                  </p>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </HorizontalCarousel>

        {/* Star quotes secondary */}
        <div className="grid md:grid-cols-3 gap-4 mt-10">
          {quotes.map((t, i) => (
            <Card
              key={i}
              className="p-5 bg-background border-border/50 hover:shadow-glow transition-all duration-300"
            >
              <Quote className="w-6 h-6 text-primary/30 mb-3" />
              <p className="text-sm text-foreground mb-3 italic">"{t.text}"</p>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(t.rating)].map((_, idx) => (
                  <Star key={idx} className="w-3.5 h-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.location} • {t.product}
              </p>
            </Card>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-lg mx-auto italic">
          * Individual results may vary. These testimonials reflect personal experiences and are not intended as medical claims.
        </p>
      </div>
    </section>
  );
};

export default RealResultsMerged;
