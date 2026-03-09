import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "exit-popup-dismissed";
const COOLDOWN_DAYS = 7;

const isCoolingDown = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const expiry = Number(raw);
    if (isNaN(expiry)) return false;
    return Date.now() < expiry;
  } catch {
    return false;
  }
};

const setCooldown = () => {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000));
  } catch {}
};

const EXCLUDED_PATHS = ["/checkout", "/order-confirmation", "/order-success"];

const ExitIntentPopup = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const hasTriggered = useRef(false);
  const lastSubmitRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const mobileTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const convertedRef = useRef(false);

  const isExcluded = EXCLUDED_PATHS.some((p) => location.pathname.startsWith(p));

  const showPopup = useCallback(() => {
    if (hasTriggered.current || isCoolingDown() || isExcluded) return;
    hasTriggered.current = true;
    setOpen(true);
  }, [isExcluded]);

  // --- Desktop triggers ---
  useEffect(() => {
    if (isExcluded) return;
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY < window.innerHeight * 0.1) {
        showPopup();
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        showPopup();
      }
    };

    // Delay attaching to avoid false triggers on page load
    const timer = setTimeout(() => {
      document.addEventListener("mousemove", handleMouseMove);
      document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [showPopup, isExcluded]);

  // --- Mobile triggers ---
  useEffect(() => {
    if (isExcluded) return;
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isMobile) return;

    // Mark conversion on CTA clicks
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const el = target.closest("button, a");
      if (!el) return;
      const text = el.textContent?.toLowerCase() || "";
      if (
        text.includes("buy product") ||
        text.includes("add to cart") ||
        text.includes("join the business") ||
        text.includes("order via whatsapp")
      ) {
        convertedRef.current = true;
      }
    };
    document.addEventListener("click", handleClick, true);

    // Timer trigger: 45s without conversion
    mobileTimerRef.current = setTimeout(() => {
      if (!convertedRef.current) showPopup();
    }, 45000);

    // Rapid scroll-up detection
    const handleScroll = () => {
      const now = Date.now();
      const dt = now - lastScrollTime.current;
      const dy = lastScrollY.current - window.scrollY; // positive = scrolling up
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;

      if (dt > 0 && dt < 300 && dy > 150) {
        showPopup();
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("scroll", handleScroll);
      if (mobileTimerRef.current) clearTimeout(mobileTimerRef.current);
    };
  }, [showPopup, isExcluded]);

  const handleClose = () => {
    setOpen(false);
    setCooldown();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }

    const now = Date.now();
    if (now - lastSubmitRef.current < 10000) {
      toast({ title: "Please wait a moment before trying again.", variant: "destructive" });
      return;
    }
    lastSubmitRef.current = now;

    setLoading(true);

    const { error: nsError } = await supabase.from("newsletter_subscribers").insert({
      email: trimmedEmail,
      name: name.trim() || null,
    });

    const { error: leadError } = await supabase.from("leads").insert({
      email: trimmedEmail,
      name: name.trim() || null,
      source: "exit_popup",
    });

    setLoading(false);

    const isDuplicate = nsError?.code === "23505" || leadError?.code === "23505";

    if (nsError && !isDuplicate) {
      toast({ title: "Something went wrong. Try again.", variant: "destructive" });
      return;
    }

    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "generate_lead",
        lead_source: "exit_popup",
        page_location: window.location.href,
      });
    }

    setSubmitted(true);
    setCooldown();

    setTimeout(() => {
      setOpen(false);
      setSubmitted(false);
    }, 4000);
  };

  if (isExcluded) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { handleClose(); setSubmitted(false); } }}>
      <DialogContent
        className="sm:max-w-md border-accent/30 animate-in fade-in duration-300"
        onInteractOutside={() => handleClose()}
      >
        {submitted ? (
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-accent" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">Success! 🎉</DialogTitle>
              <DialogDescription className="text-center text-base">
                Check your email for confirmation and stay tuned for health tips and exclusive promotions.
              </DialogDescription>
            </DialogHeader>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-accent-glow flex items-center justify-center">
                  <Gift className="w-8 h-8 text-accent-foreground" />
                </div>
              </div>
              <DialogTitle className="text-center text-2xl">Wait! Don't Miss Out 🎁</DialogTitle>
              <DialogDescription className="text-center text-base">
                Sign up for our newsletter and get a <span className="font-bold text-accent">Free Wellness Guide</span> plus exclusive health tips delivered to your inbox!
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 mt-4">
              <Input
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
              />
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                maxLength={255}
              />
              <Button type="submit" variant="premium" className="w-full h-12 text-base font-bold" disabled={loading}>
                {loading ? "Subscribing..." : "Get My Free Guide"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">We respect your privacy. Unsubscribe anytime.</p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
