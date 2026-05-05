import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";
import TikTokIcon from "@/components/icons/TikTokIcon";

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-b from-secondary via-muted to-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              BF SUMA ROYAL
            </h3>
            <p className="text-white/80 mb-4">
              Empowering health, enhancing wealth. Premium natural supplements and business opportunities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#products" onClick={(e) => { e.preventDefault(); document.getElementById("products")?.scrollIntoView({ behavior: "smooth" }); }} className="text-white/80 hover:text-accent transition-colors cursor-pointer">
                  Products
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }} className="text-white/80 hover:text-accent transition-colors cursor-pointer">
                  About Us
                </a>
              </li>
              <li>
                <a href="/wellness" className="text-white/80 hover:text-accent transition-colors">
                  Wellness Hubs
                </a>
              </li>
              <li>
                <a href="/faq" className="text-white/80 hover:text-accent transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="/contact" className="text-white/80 hover:text-accent transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="/return-policy" className="text-white/80 hover:text-accent transition-colors">
                  Return & Exchange Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="text-white/80 hover:text-accent transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/join-business" className="text-white/80 hover:text-accent transition-colors">
                  Join & Earn
                </a>
              </li>
            </ul>

            <h4 className="font-bold mt-6 mb-3 text-accent">We Deliver To</h4>
            <ul className="space-y-1.5">
              {[
                { href: "/nairobi", label: "Nairobi" },
                { href: "/mombasa", label: "Mombasa" },
                { href: "/kisumu", label: "Kisumu" },
                { href: "/nakuru", label: "Nakuru" },
                { href: "/eldoret", label: "Eldoret" },
                { href: "/thika", label: "Thika" },
                { href: "/nyeri", label: "Nyeri" },
                { href: "/machakos", label: "Machakos" },
                { href: "/kitale", label: "Kitale" },
                { href: "/kakamega", label: "Kakamega" },
              ].map((loc) => (
                <li key={loc.href}>
                  <a href={loc.href} className="text-white/80 hover:text-accent transition-colors text-sm">
                    Supplements in {loc.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold mb-4 text-accent">Contact</h4>
            <ul className="space-y-3 text-white/80">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                <span>+254 795 454053</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                <span className="text-sm">bfsumaroyal@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm">Kakamega, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Compliance Disclaimer */}
        <div className="pt-8 border-t border-white/20 mb-4">
          <p className="text-[11px] italic text-center text-muted-foreground/60">
            * These statements have not been evaluated by any food or drug regulatory authority. This product is not intended to diagnose, treat, cure, or prevent any disease. Results may vary. Always consult a qualified healthcare professional before starting any supplement regimen.
          </p>
        </div>

        {/* Social Media & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm text-center md:text-left">
            © 2026 BF SUMA Royal | Kakamega
          </p>
          
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/share/1G6uTXLkpw/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/bf_suma_royal?igsh=MXRkNTJtYWJ1bmJwNg=="
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.tiktok.com/@bfsumaroyal"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
              aria-label="TikTok"
            >
              <TikTokIcon className="w-5 h-5" />
            </a>
            <a
              href="https://wa.me/254795454053"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-primary/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
              aria-label="WhatsApp"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
