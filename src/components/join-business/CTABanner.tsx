import { MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WHATSAPP_URL = 'https://wa.me/254795454053?text=Hi%20BF%20SUMA%20team%20%F0%9F%91%8B%20I%20want%20to%20join%20the%20business.';

const CTABanner = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-secondary via-primary to-accent text-primary-foreground">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Your Journey Starts Today
        </h2>
        <p className="text-lg text-white/90 mb-8">
          Join thousands of Kenyans who are building their future with BF Suma Royal. 
          Whether you want extra income or a full-time business — we'll help you get there.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg"
            onClick={() => document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Register Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/20 h-14 px-8 text-lg"
            asChild
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Join via WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
