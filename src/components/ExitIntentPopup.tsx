import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ExitIntentPopup = () => {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasShown, setHasShown] = useState(false);

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
    setLoading(true);
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: trimmedEmail,
      name: name.trim() || null,
    });
    setLoading(false);
    if (error) {
      if (error.code === "23505") {
        toast({ title: "You're already subscribed! 🎉" });
      } else {
        toast({ title: "Something went wrong. Try again.", variant: "destructive" });
      }
    } else {
      toast({ title: "Welcome! Check your inbox for your free wellness guide. 🎁" });
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-md border-accent/30">
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
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
