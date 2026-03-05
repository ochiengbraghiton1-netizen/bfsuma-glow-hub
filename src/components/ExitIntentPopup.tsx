import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lastSubmitRef = useRef(0);

  const handleMouseLeave = useCallback((e: MouseEvent) => {
    if (e.clientY <= 0 && !hasShown) {
      const dismissed = sessionStorage.getItem("exit-popup-dismissed");
      if (!dismissed) {
        setOpen(true);
        setHasShown(true);
      }
    }
  }, [hasShown]);

  useEffect(() => {
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseLeave]);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("exit-popup-dismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }

    // Rate limit: 10s between submissions
    const now = Date.now();
    if (now - lastSubmitRef.current < 10000) {
      toast({ title: "Please wait a moment before trying again.", variant: "destructive" });
      return;
    }
    lastSubmitRef.current = now;

    setLoading(true);

    // Save to newsletter_subscribers (existing)
    const { error: nsError } = await supabase.from("newsletter_subscribers").insert({
      email: trimmedEmail,
      name: name.trim() || null,
    });

    // Save to leads table
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

    if (isDuplicate && !leadError) {
      // New lead but already a newsletter subscriber
    }

    // Fire GA4 generate_lead event
    if (typeof window !== "undefined" && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: "generate_lead",
        lead_source: "exit_popup",
        page_location: window.location.href,
      });
    }

    setSubmitted(true);

    // Auto-close after 4 seconds
    setTimeout(() => {
      handleClose();
      setSubmitted(false);
    }, 4000);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { handleClose(); setSubmitted(false); } }}>
      <DialogContent className="sm:max-w-md border-accent/30">
        {submitted ? (
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
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
