import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

// International phone: allow +, spaces, dashes, parens; require 7-15 digits total
const isValidPhone = (raw: string): boolean => {
  if (!raw) return false;
  if (!/^[+\d\s\-()]+$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

const WishlistCapturePopup = () => {
  const { pendingWishlistProductId, completeWishlistCapture, cancelWishlistCapture } = useCart();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const open = !!pendingWishlistProductId;
  const phoneValid = isValidPhone(phone);
  const phoneShowError = phone.length > 0 && !phoneValid;

  const reset = () => {
    setPhone("");
    setEmail("");
    setSubmitting(false);
  };

  const handleSkip = () => {
    reset();
    cancelWishlistCapture();
  };

  const handleSave = async () => {
    const productId = pendingWishlistProductId;
    if (!productId || !phoneValid) return;
    setSubmitting(true);
    const trimmedEmail = email.trim();
    try {
      await supabase.from("leads").insert({
        name: null,
        email: trimmedEmail || `wishlist-${Date.now()}@no-email.local`,
        source: `wishlist | product_id:${productId}`,
        subscribed: !!trimmedEmail,
      });
      await supabase.from("wishlist_items").insert({
        product_id: productId,
        lead_phone: phone.trim(),
        lead_email: trimmedEmail || null,
      });
      completeWishlistCapture({ phone: phone.trim(), email: trimmedEmail || undefined });
      reset();
      toast({ title: "Saved to your wishlist" });
    } catch {
      setSubmitting(false);
      toast({ title: "Could not save. Please try again.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleSkip()}>
      <DialogContent className="max-w-sm p-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <Heart className="w-6 h-6 text-primary" />
        </div>
        <DialogTitle className="text-center text-xl font-bold">Save this for later</DialogTitle>
        <DialogDescription className="text-center">
          We'll let you know if it goes on sale or runs low on stock.
        </DialogDescription>

        <div className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="wishlist-phone">Phone number</Label>
            <Input
              id="wishlist-phone"
              type="tel"
              inputMode="tel"
              placeholder="+254 7XX XXX XXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {phoneShowError && (
              <p className="text-xs text-destructive">Enter a valid phone number (at least 7 digits)</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wishlist-email">Email (optional)</Label>
            <Input
              id="wishlist-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <Button
            className="w-full rounded-full"
            disabled={!phoneValid || submitting}
            onClick={handleSave}
          >
            {submitting ? "Saving..." : "Save to Wishlist"}
          </Button>

          <button
            type="button"
            onClick={handleSkip}
            className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WishlistCapturePopup;
