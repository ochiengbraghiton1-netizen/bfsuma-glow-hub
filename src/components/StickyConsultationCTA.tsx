import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

const WHATSAPP_URL = "https://wa.me/254795454053?text=Hi%2C%20I'd%20like%20to%20book%20a%20free%20health%20consultation.";

/** Hidden pages where the sticky CTA should not appear */
const HIDDEN_PATHS = ["/admin", "/auth", "/checkout", "/reset-password", "/forgot-password", "/order-confirmation", "/order-success"];

const StickyConsultationCTA = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  const isHidden = HIDDEN_PATHS.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (isHidden) return;
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHidden]);

  if (isHidden || !visible) return null;

  return (
    <div className="fixed bottom-6 left-6 z-40 lg:hidden animate-fade-in">
      <Button
        asChild
        size="lg"
        className="rounded-full shadow-[0_4px_20px_hsl(var(--primary)/0.35)] gap-2 px-5"
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
          <Stethoscope className="w-4 h-4" />
          Book Consultation
        </a>
      </Button>
    </div>
  );
};

export default StickyConsultationCTA;