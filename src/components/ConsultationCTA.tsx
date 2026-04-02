import { Link } from "react-router-dom";
import { Stethoscope, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL = "https://wa.me/254795454053?text=Hi%2C%20I'd%20like%20to%20book%20a%20free%20health%20consultation.";

interface ConsultationCTAProps {
  headline?: string;
  subtext?: string;
}

const ConsultationCTA = ({
  headline = "Still unsure? Talk to a wellness expert now.",
  subtext = "Get free personalised advice on the best supplements for your health goals.",
}: ConsultationCTAProps) => {
  return (
    <section className="py-10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <Stethoscope className="w-8 h-8 text-primary mx-auto mb-3" />
        <h3 className="text-lg md:text-xl font-bold text-foreground mb-2">
          {headline}
        </h3>
        <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
          {subtext}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Button asChild size="lg" className="gap-2">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <Stethoscope className="w-4 h-4" />
              Book Consultation
              <ArrowRight className="w-4 h-4" />
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild className="gap-2">
            <Link to="/products">
              Browse Products
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ConsultationCTA;