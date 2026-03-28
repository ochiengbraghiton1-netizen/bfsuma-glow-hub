import { MessageCircle, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import heroImage from '@/assets/join-business-hero.webp';

const WHATSAPP_URL = 'https://wa.me/254795454053?text=Hi%20BF%20SUMA%20team%20%F0%9F%91%8B%20I%20want%20to%20learn%20more%20about%20joining%20the%20business.';

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-accent/80 text-primary-foreground">
      <div className="absolute inset-0 bg-black/40 z-10" />
      <img
        src={heroImage}
        alt="Successful BF Suma Royal business professional in Kenya"
        className="absolute inset-0 w-full h-full object-cover"
        width={1280}
        height={720}
      />
      <div className="relative z-20 container mx-auto px-4 py-20 md:py-32 text-center">
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight drop-shadow-lg">
          Start Your Own Health &amp; Wellness Business in Kenya
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-white/90">
          Build income, grow your network, and access exclusive rewards — all with the support of BF Suma Royal.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            asChild
            className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 px-8 text-lg shadow-lg"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-5 w-5" />
              Join via WhatsApp
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/20 h-14 px-8 text-lg"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
            <ArrowDown className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
