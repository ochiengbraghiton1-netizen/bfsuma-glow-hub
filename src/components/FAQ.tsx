import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

export const faqs = [
  {
    question: "What is BF SUMA ROYAL?",
    answer: "BF SUMA ROYAL is an authorized independent distributor of BF Suma, a global health and wellness brand trusted since 2006. Based in Kakamega, we've served Kenyan families for over 8 years with certified natural supplements and free wellness guidance on WhatsApp."
  },
  {
    question: "Are BF SUMA ROYAL products safe and certified?",
    answer: "Yes. Our products are manufactured in GMP-certified facilities and undergo rigorous quality testing. They're made from natural ingredients and hold Halal, ISO 22000, and FDA certification where applicable."
  },
  {
    question: "How do I know the products are genuine?",
    answer: "Every product we sell is sourced directly from BF Suma and carries the certifications above. To guarantee authenticity, order only through our official website or our WhatsApp number, not through unofficial resellers."
  },
  {
    question: "How do I place an order?",
    answer: "Add products to your cart and check out on the website. We'll confirm your order on WhatsApp, then you can pay via M-Pesa or PayPal."
  },
  {
    question: "Do you deliver across Kenya?",
    answer: "Yes, we deliver nationwide. Delivery cost and timing depend on your location and are shown at checkout."
  },
  {
    question: "What products does BF SUMA ROYAL offer?",
    answer: "We carry a wide range of natural health supplements for joint support, immunity, energy, women's and men's health, and more. Browse the full range on our Products page."
  },
  {
    question: "Can I return a product?",
    answer: "Yes, see our Return Policy page for full details on returns and exchanges."
  },
  {
    question: "Interested in becoming a distributor?",
    answer: "Learn more about joining the BF SUMA ROYAL team on our Join the Business page."
  }
];

const FAQ = () => {

  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about BF SUMA ROYAL products and business opportunity
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:border-primary transition-colors"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
