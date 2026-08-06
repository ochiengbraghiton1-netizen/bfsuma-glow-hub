import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, CheckCircle2, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react";
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

export interface BlogQuizOption {
  id: string;
  label: string;
  reason: string | null;
  product: { id: string; name: string; slug: string } | null;
}

interface BlogLeadCaptureProps {
  contentType: "health" | "business";
  postSlug: string;
  postTitle?: string;
  quizOptions?: BlogQuizOption[];
}

const DURATIONS = [
  { value: "days", label: "A few days" },
  { value: "weeks", label: "A few weeks" },
  { value: "months", label: "Several months" },
] as const;

const Option = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
      active
        ? "border-primary bg-primary/10 text-foreground"
        : "border-border bg-card hover:border-primary/50 text-foreground"
    }`}
  >
    {children}
  </button>
);

const BlogLeadCapture = ({ contentType, postSlug, postTitle, quizOptions = [] }: BlogLeadCaptureProps) => {
  const validOptions = quizOptions.filter((o) => o.product);
  const quizMode = validOptions.length >= 2;

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  // quiz state
  const [step, setStep] = useState(1); // 1=concern, 2=duration, 3=capture, 4=result
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [duration, setDuration] = useState<string | null>(null);

  const copy = COPY[contentType];
  const phoneValid = isValidPhone(phone);
  const phoneShowError = phone.length > 0 && !phoneValid;
  const selected = validOptions.find((o) => o.id === selectedId) || null;

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
        source: `blog_${contentType} | post:${postSlug}`,
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

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid || !selected?.product) {
      toast({ title: "Please enter a valid phone number (at least 7 digits)", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const trimmedEmail = email.trim();
    try {
      await supabase.from("leads").insert({
        name: null,
        email: trimmedEmail || `blog-quiz-${Date.now()}@no-email.local`,
        source: `blog_quiz | post:${postSlug} | concern:${selected.label} | duration:${duration} | product:${selected.product.slug} | phone:${phone}`,
        subscribed: !!trimmedEmail,
      });
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof fbq === "function") fbq("track", "Lead", { content_name: "Blog Quiz Lead" });
      setStep(4);
    } catch {
      toast({ title: "Could not save. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const wrapperClass =
    "my-8 rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-accent/10 overflow-hidden";

  if (quizMode) {
    const waUrl = selected?.product
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          `Hi! I just took the quiz on your article "${postTitle || postSlug}". I'm dealing with ${selected.label}. I'd like to order ${selected.product.name}.`,
        )}`
      : `https://wa.me/${WHATSAPP_NUMBER}`;

    return (
      <aside className={wrapperClass}>
        {step < 4 && (
          <div className="h-1.5 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              {contentType === "business" ? "60-second interest check" : "60-second wellness check"}
            </span>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold">
                {contentType === "business" ? "What's your main interest?" : "What's going on for you?"}
              </h2>
              <div className="space-y-2">
                {validOptions.map((o) => (
                  <Option key={o.id} active={selectedId === o.id} onClick={() => setSelectedId(o.id)}>
                    {o.label}
                  </Option>
                ))}
              </div>
              <Button className="w-full rounded-full" disabled={!selectedId} onClick={() => setStep(2)}>
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold">How long have you experienced this?</h2>
              <div className="space-y-2">
                {DURATIONS.map((d) => (
                  <Option key={d.value} active={duration === d.value} onClick={() => setDuration(d.value)}>
                    {d.label}
                  </Option>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button className="flex-1 rounded-full" disabled={!duration} onClick={() => setStep(3)}>
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <form onSubmit={handleQuizSubmit} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-bold">Almost done! Where should we send your result?</h2>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="blog-quiz-phone">Phone *</Label>
                  <Input
                    id="blog-quiz-phone"
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
                  <Label htmlFor="blog-quiz-email">Email (optional)</Label>
                  <Input
                    id="blog-quiz-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={255}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setStep(2)} disabled={submitting}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button type="submit" className="flex-1 rounded-full" disabled={submitting || !phoneValid}>
                  {submitting ? "Sending..." : "See My Result"}
                </Button>
              </div>
            </form>
          )}

          {step === 4 && selected?.product && (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="w-5 h-5" />
                Your recommendation
              </div>
              <div>
                <p className="text-xl font-bold">{selected.product.name}</p>
                {selected.reason && (
                  <p className="text-sm text-muted-foreground mt-1">Recommended for {selected.reason}.</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild variant="outline" className="rounded-full">
                  <Link to={`/product/${selected.product.slug}`}>View product details</Link>
                </Button>
                <Button asChild className="rounded-full">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Order Now via WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>
    );
  }

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
