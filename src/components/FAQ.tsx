import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "What is BF SUMA?",
      answer: "BF SUMA is a global health and wellness company founded in 2011, offering premium natural supplements backed by scientific research. We operate in over 40 countries, helping people improve their health while providing legitimate business opportunities through our network marketing model."
    },
    {
      question: "Are BF SUMA products safe and certified?",
      answer: "Yes, all BF SUMA products are manufactured in GMP-certified facilities and undergo rigorous quality testing. Our products are made from 100% natural ingredients and are certified by relevant health authorities. We hold HALAL certification for applicable products."
    },
    {
      question: "How does the BF SUMA business opportunity work?",
      answer: "You can join as a BF SUMA distributor by paying a one-time registration fee of KES 7,000. As a member, you earn through product sales commissions, team bonuses, and leadership rewards. There's no requirement to buy large inventories - you can start small and grow at your own pace."
    },
    {
      question: "Is BF SUMA a pyramid scheme?",
      answer: "No, BF SUMA is a legitimate network marketing company. Unlike pyramid schemes, our income is based on actual product sales, not recruitment alone. We sell real health products with genuine value, and our compensation plan rewards both sales and team building ethically."
    },
    {
      question: "What products does BF SUMA offer?",
      answer: "We offer a wide range of natural health supplements including: NMN Capsules for cellular health, Ganoderma Spore Capsules for immunity, ArthroXtra for joint support, Feminegy for women's health, X-Power Man for men's vitality, and many more specialized wellness products."
    },
    {
      question: "How much can I earn with BF SUMA?",
      answer: "Earnings vary based on your effort and team size. New distributors can earn 15-30% commission on personal sales. As you build a team and advance in rank, you unlock additional bonuses. Top performers earn significant monthly incomes, but results depend on individual commitment."
    },
    {
      question: "Do I need to be a health expert to sell these products?",
      answer: "No health expertise is required. We provide comprehensive training on all products, their benefits, and how to share them with others. Many successful distributors started with no prior experience in health or sales."
    },
    {
      question: "How do I get started as a BF SUMA distributor in Kenya?",
      answer: "Getting started is simple: 1) Register through our website or contact us on WhatsApp, 2) Pay the KES 7,000 registration fee, 3) Receive your membership and starter resources, 4) Begin sharing products and building your team with our full support."
    },
    {
      question: "What support do new distributors receive?",
      answer: "New members receive comprehensive onboarding including: product training, sales techniques, marketing materials, access to our community of successful distributors, regular webinars, and one-on-one mentorship from experienced team leaders."
    },
    {
      question: "Can I do this business part-time?",
      answer: "Absolutely! Many of our successful distributors started part-time while maintaining other jobs. The flexibility of network marketing allows you to work around your schedule. You can gradually transition to full-time as your business grows."
    }
  ];

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
            Everything you need to know about BF SUMA products and business opportunity
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
