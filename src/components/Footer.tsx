import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-secondary via-muted to-secondary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-accent to-accent-glow bg-clip-text text-transparent">
              BF SUMA Kenya
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
                <a href="#products" className="text-white/80 hover:text-accent transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="https://wa.me/254795454053" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent transition-colors">
                  Join & Earn
                </a>
              </li>
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
                <span className="text-sm">braghiton.ochieng.125@gmail.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-accent" />
                <span className="text-sm">JKUAT Towers, Westlands, Nairobi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm text-center md:text-left">
            © {currentYear} BF SUMA Kenya | Health, Wealth & Wellness by Braghiton Ochieng
          </p>
          
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/profile.php?id=100067452825041"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://www.instagram.com/ochiengbraghiton254"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-glow"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
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
