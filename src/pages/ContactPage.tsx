import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Facebook, Instagram, Send } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    // Open WhatsApp with the message content as fallback
    const msg = `Hello BF Suma Royal,\n\nName: ${formData.name}\nEmail: ${formData.email}\nSubject: ${formData.subject}\n\nMessage:\n${formData.message}`;
    window.open(`https://wa.me/254795454053?text=${encodeURIComponent(msg)}`, "_blank");
    toast.success("Redirecting to WhatsApp to send your message!");
    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    { icon: Phone, label: "WhatsApp", value: "+254 795 454053", link: "https://wa.me/254795454053" },
    { icon: Mail, label: "Email", value: "bfsumaroyal@gmail.com", link: "mailto:bfsumaroyal@gmail.com" },
    { icon: MapPin, label: "Location", value: "Kakamega, Kenya", link: "https://maps.app.goo.gl/xm2gawF5Qhppqdfv5" },
  ];

  const socialLinks = [
    { icon: Facebook, label: "Facebook", link: "https://www.facebook.com/share/1G6uTXLkpw/", color: "hover:text-[#1877F2]" },
    { icon: Instagram, label: "Instagram", link: "https://www.instagram.com/bf_suma_royal?igsh=MXRkNTJtYWJ1bmJwNg==", color: "hover:text-[#E4405F]" },
    { icon: TikTokIcon, label: "TikTok", link: "https://www.tiktok.com/@bfsumaroyal", color: "hover:text-foreground" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-16">
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Contact Us
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Your Trusted BF SUMA Kenya Partner
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <Card className="p-8 border-border">
                <h2 className="text-2xl font-bold mb-6 text-foreground">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <Label htmlFor="name">Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="What is this about?" />
                  </div>
                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea id="message" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Your message..." rows={5} required />
                  </div>
                  <Button type="submit" variant="premium" className="w-full" size="lg" disabled={isSubmitting}>
                    <Send className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Card>

              {/* Contact Info */}
              <div className="space-y-6">
                <Card className="p-8 border-border hover:border-primary transition-all duration-300 hover:shadow-glow">
                  <h3 className="text-2xl font-bold mb-6 text-foreground">Contact Information</h3>
                  <div className="space-y-4">
                    {contactInfo.map((info, index) => {
                      const Icon = info.icon;
                      return (
                        <a key={index} href={info.link} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 group">
                          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">{info.label}</p>
                            <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{info.value}</p>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                  <div className="mt-8 pt-8 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4">Follow on Social Media</p>
                    <div className="flex gap-4">
                      {socialLinks.map((social, index) => {
                        const Icon = social.icon;
                        return (
                          <a key={index} href={social.link} target="_blank" rel="noopener noreferrer" className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center transition-all duration-300 hover:scale-110 ${social.color}`} aria-label={social.label}>
                            <Icon className="w-6 h-6" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </Card>

                <Card className="overflow-hidden border-border min-h-[300px]">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0876!2d34.7523!3d0.2827!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x178109f27bba9c3d%3A0x5b9a8c9f0e8c9f0e!2sKakamega!5e0!3m2!1sen!2ske!4v1234567890123"
                    width="100%" height="100%" style={{ border: 0, minHeight: "300px" }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Kakamega Location"
                  />
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
