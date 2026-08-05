import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const WHATSAPP_NUMBER = "254795454053";

// International phone: allow +, spaces, dashes, parens; require 7-15 digits total
const isValidPhone = (raw: string): boolean => {
  if (!raw) return false;
  if (!/^[+\d\s\-()]+$/.test(raw)) return false;
  const digits = raw.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

const COPY = {
  health: {
    heading: "Not sure which supplement is right for you?",
    subtext: "Get a free personalized recommendation from our wellness team.",
    button: "Get My Free Recommendation",
  },
  business: {
    heading: "Want to build extra income like this?",
    subtext: "Get our free distributor starter guide with an earnings breakdown.",
    button: "Send Me The Free Guide",
  },
} as const;

interface BlogLeadCaptureProps {
  contentType: "health" | "business";
  postSlug: string;
}

const BlogLeadCapture = ({ contentType, postSlug }: BlogLeadCaptureProps) => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const copy = COPY[contentType];
  const phoneValid = isValidPhone(phone);
  const phoneShowError = phone.length > 0 && !phoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) {
      toast({ title: "Please enter a valid phone number (at least 7 digits)", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const trimmedEmail = email.trim();
    try {
      await supabase.from("leads").insert({
        name: null,
        email: trimmedEmail || `blog-${Date.now()}@no-email.local`,
        source: `blog_${contentType} | post:${postSlug} | phone:${phone.trim()}`,
        subscribed: !!trimmedEmail,
      });
      setPhone("");
      setEmail("");
      setDone(true);
      toast({ title: "Thanks! We'll be in touch on WhatsApp shortly." });
    } catch {
      toast({ title: "Could not save. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="my-8 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent/10 p-5 sm:p-6">
      {done ? (
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 font-semibold text-primary">
            <CheckCircle2 className="w-5 h-5" />
            You're on the list ✓
          </div>
          <p className="text-sm text-muted-foreground">
            Our team will reach out shortly.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-primary underline underline-offset-4"
          >
            Continue on WhatsApp
          </a>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {contentType === "business" ? "Free Starter Guide" : "Free Guidance"}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold mb-1">{copy.heading}</h2>
          <p className="text-sm text-muted-foreground mb-4">{copy.subtext}</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="blog-lead-phone">Phone *</Label>
              <Input
                id="blog-lead-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={20}
                placeholder="e.g. 0712 345 678 or +1 555 123 4567"
                inputMode="tel"
                className={phoneShowError ? "border-destructive" : ""}
                aria-invalid={phoneShowError}
              />
              {phoneShowError && (
                <p className="text-xs text-destructive mt-1">
                  Please enter a valid phone number (at least 7 digits)
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="blog-lead-email">Email (optional)</Label>
              <Input
                id="blog-lead-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                placeholder="you@example.com"
              />
            </div>
            <Button type="submit" className="w-full rounded-full" disabled={submitting || !phoneValid}>
              {submitting ? "Sending..." : copy.button}
            </Button>
          </form>
        </>
      )}
    </aside>
  );
};

export default BlogLeadCapture;
