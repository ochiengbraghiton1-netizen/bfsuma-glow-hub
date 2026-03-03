import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const NewsletterSignup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast({ title: "Welcome! You'll receive your free wellness guide soon. 🎁" });
    }
    setEmail("");
    setName("");
  };

  return (
    <div className="bg-gradient-to-r from-secondary to-primary/80 py-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-accent" />
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Exclusive Offer</span>
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Get a Free Wellness Guide!
        </h3>
        <p className="text-white/80 mb-6 max-w-lg mx-auto">
          Subscribe to our newsletter for expert health tips, product updates, and a complimentary wellness guide delivered to your inbox.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
          />
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12"
          />
          <Button type="submit" variant="premium" className="h-12 px-8 font-bold whitespace-nowrap" disabled={loading}>
            <Mail className="w-5 h-5" />
            {loading ? "..." : "Subscribe"}
          </Button>
        </form>
        <p className="text-white/50 text-xs mt-3">No spam. Unsubscribe anytime.</p>
      </div>
    </div>
  );
};

export default NewsletterSignup;
