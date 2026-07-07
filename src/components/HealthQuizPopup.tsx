import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, MessageCircle, Stethoscope } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "health-quiz-state-v1";
const COOLDOWN_DAYS = 30;
const TRIGGER_DELAY_MS = 6000;
const SCROLL_TRIGGER_PCT = 0.3;
const WHATSAPP_NUMBER = "254795454053";
const EXCLUDED_PATHS = ["/checkout", "/order-confirmation", "/order-success", "/admin", "/auth"];

type Concern = "joint" | "energy" | "immunity" | "wellness" | "beauty";
type Duration = "days" | "weeks" | "months";
type Goal = "reduce-pain" | "boost-energy" | "improve-health" | "prevent";

interface Recommendation {
  slug: string;
  name: string;
  reason: string;
}

const RECOMMENDATIONS: Record<Concern, Recommendation> = {
  joint: { slug: "arthroxtra", name: "Arthroxtra", reason: "targeted joint support and mobility" },
  energy: { slug: "4-in-1-cordyceps-coffee", name: "4-in-1 Cordyceps Coffee", reason: "natural energy and stamina boost" },
  immunity: { slug: "quad-reishi-capsules", name: "Quad-Reishi Capsules", reason: "immune system reinforcement" },
  wellness: { slug: "detoxilive", name: "Detoxilive", reason: "overall wellness and detox support" },
  beauty: { slug: "anatic-herbal-essence-soap", name: "Anatic Herbal Essence Soap", reason: "skin health and natural beauty" },
};

const isCoolingDown = (): boolean => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (parsed.completedAt) return true; // never re-show after completion
    return Date.now() < (parsed.expiry ?? 0);
  } catch {
    return false;
  }
};

const setCooldown = (completed = false) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        expiry: Date.now() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000,
        completedAt: completed ? Date.now() : null,
      }),
    );
  } catch {}
};

const HealthQuizPopup = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0=intro, 1-3=questions, 4=lead, 5=result
  const [concern, setConcern] = useState<Concern | null>(null);
  const [duration, setDuration] = useState<Duration | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const triggered = useRef(false);

  const isExcluded = EXCLUDED_PATHS.some((p) => location.pathname.startsWith(p));

  const trigger = useCallback(() => {
    if (triggered.current || isCoolingDown() || isExcluded) return;
    triggered.current = true;
    setOpen(true);
  }, [isExcluded]);

  useEffect(() => {
    if (isExcluded || isCoolingDown()) return;
    const t = setTimeout(trigger, TRIGGER_DELAY_MS);
    const onScroll = () => {
      const scrolled = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (scrolled >= SCROLL_TRIGGER_PCT) trigger();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, [trigger, isExcluded]);

  const handleClose = () => {
    setOpen(false);
    if (step < 5) setCooldown(false);
  };

  const recommendation = concern ? RECOMMENDATIONS[concern] : null;

  // International phone: allow +, spaces, dashes, parens; require 7-15 digits total
  const isValidPhone = (raw: string): boolean => {
    if (!raw) return false;
    if (!/^[+\d\s\-()]+$/.test(raw)) return false;
    const digits = raw.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  };
  const phoneValid = isValidPhone(phone);
  const phoneShowError = phone.length > 0 && !phoneValid;

  const handleSubmitLead = async () => {
    if (!name.trim()) {
      toast({ title: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!phoneValid) {
      toast({ title: "Please enter a valid phone number (at least 7 digits)", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const source = `health_quiz | concern:${concern} | duration:${duration} | goal:${goal} | phone:${phone}`;
      await supabase.from("leads").insert({
        name: name.trim(),
        email: email.trim() || `quiz-${Date.now()}@no-email.local`,
        source,
        subscribed: !!email.trim(),
      });
      setCooldown(true);
      const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
      if (typeof fbq === "function") {
        fbq("track", "Lead", { content_name: "Health Quiz Lead" });
      }
      setStep(5);
    } catch {
      toast({ title: "Could not save. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = recommendation
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hi! I just took the health quiz. I'm ${name || "interested"} and I'm dealing with ${concern}. I'd like to order ${recommendation.name}.`,
      )}`
    : `https://wa.me/${WHATSAPP_NUMBER}`;

  const consultUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi, I'd like to talk to a wellness expert about ${concern || "my health"}.`,
  )}`;

  const Option = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
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

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md sm:max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        {step > 0 && step < 5 && (
          <div className="h-1.5 bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        )}

        <div className="p-6 sm:p-8">
          {/* Step 0: Intro */}
          {step === 0 && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                Not sure which supplement is right for you?
              </DialogTitle>
              <DialogDescription className="text-base">
                Take this 60-second quiz and get a personalized recommendation.
              </DialogDescription>
              <Button size="lg" className="w-full rounded-full" onClick={() => setStep(1)}>
                Start Quiz <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <button
                onClick={handleClose}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                No thanks
              </button>
            </div>
          )}

          {/* Step 1: Concern */}
          {step === 1 && (
            <div className="space-y-4">
              <DialogTitle className="text-xl font-bold">What are you mainly dealing with?</DialogTitle>
              <DialogDescription className="sr-only">Select your main health concern</DialogDescription>
              <div className="space-y-2">
                <Option active={concern === "joint"} onClick={() => setConcern("joint")}>🦴 Joint pain</Option>
                <Option active={concern === "energy"} onClick={() => setConcern("energy")}>⚡ Low energy / fatigue</Option>
                <Option active={concern === "immunity"} onClick={() => setConcern("immunity")}>🛡️ Weak immunity</Option>
                <Option active={concern === "wellness"} onClick={() => setConcern("wellness")}>💚 Weight / general wellness</Option>
                <Option active={concern === "beauty"} onClick={() => setConcern("beauty")}>✨ Skin / beauty</Option>
              </div>
              <Button className="w-full rounded-full" disabled={!concern} onClick={() => setStep(2)}>
                Next <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div className="space-y-4">
              <DialogTitle className="text-xl font-bold">How long have you experienced this?</DialogTitle>
              <DialogDescription className="sr-only">Select duration</DialogDescription>
              <div className="space-y-2">
                <Option active={duration === "days"} onClick={() => setDuration("days")}>A few days</Option>
                <Option active={duration === "weeks"} onClick={() => setDuration("weeks")}>A few weeks</Option>
                <Option active={duration === "months"} onClick={() => setDuration("months")}>Several months</Option>
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

          {/* Step 3: Goal */}
          {step === 3 && (
            <div className="space-y-4">
              <DialogTitle className="text-xl font-bold">What is your goal?</DialogTitle>
              <DialogDescription className="sr-only">Select your goal</DialogDescription>
              <div className="space-y-2">
                <Option active={goal === "reduce-pain"} onClick={() => setGoal("reduce-pain")}>Reduce pain</Option>
                <Option active={goal === "boost-energy"} onClick={() => setGoal("boost-energy")}>Boost energy</Option>
                <Option active={goal === "improve-health"} onClick={() => setGoal("improve-health")}>Improve overall health</Option>
                <Option active={goal === "prevent"} onClick={() => setGoal("prevent")}>Prevent future issues</Option>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setStep(2)}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button className="flex-1 rounded-full" disabled={!goal} onClick={() => setStep(4)}>
                  Next <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Lead capture */}
          {step === 4 && (
            <div className="space-y-4">
              <DialogTitle className="text-xl font-bold">Almost done! Where should we send your result?</DialogTitle>
              <DialogDescription>Your personalized recommendation is ready.</DialogDescription>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="quiz-name">Name *</Label>
                  <Input id="quiz-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder="Your name" />
                </div>
                <div>
                  <Label htmlFor="quiz-phone">Phone (Kenyan number) *</Label>
                  <Input
                    id="quiz-phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={20}
                    placeholder="0712 345 678"
                    inputMode="tel"
                    className={phoneShowError ? "border-destructive" : ""}
                    aria-invalid={phoneShowError}
                  />
                  {phoneShowError && (
                    <p className="text-xs text-destructive mt-1">Enter a valid Kenyan number e.g. 0712 345 678</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="quiz-email">Email (optional)</Label>
                  <Input id="quiz-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} placeholder="you@example.com" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setStep(3)} disabled={submitting}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button className="flex-1 rounded-full" onClick={handleSubmitLead} disabled={submitting || !name.trim() || !phoneValid}>
                  {submitting ? "Saving..." : "See My Result"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Result */}
          {step === 5 && recommendation && (
            <div className="space-y-4 text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Based on your answers, we recommend:
              </DialogTitle>
              <DialogDescription className="sr-only">Your personalized recommendation</DialogDescription>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-5 border border-primary/20">
                <p className="text-2xl font-bold text-foreground">{recommendation.name}</p>
                <p className="text-sm text-muted-foreground mt-1">For {recommendation.reason}</p>
                <Link
                  to={`/product/${recommendation.slug}`}
                  onClick={handleClose}
                  className="inline-block mt-3 text-sm text-primary underline underline-offset-4"
                >
                  View product details →
                </Link>
              </div>
              <div className="space-y-2">
                <Button asChild size="lg" className="w-full rounded-full bg-green-600 hover:bg-green-700">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
                    <MessageCircle className="mr-2 w-5 h-5" /> Order Now via WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full rounded-full">
                  <a href={consultUrl} target="_blank" rel="noopener noreferrer" onClick={handleClose}>
                    <Stethoscope className="mr-2 w-5 h-5" /> Talk to a Wellness Expert
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HealthQuizPopup;
