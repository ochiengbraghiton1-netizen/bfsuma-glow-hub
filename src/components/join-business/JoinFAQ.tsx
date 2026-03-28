import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I join BF Suma Royal?',
    answer: 'Fill out the registration form on this page, or contact us on WhatsApp. You\'ll pay a one-time registration fee of KES 7,000 to get started with a product kit and distributor access.',
  },
  {
    question: 'Do I need any experience?',
    answer: 'No experience is needed. BF Suma provides full training and mentorship for all new distributors. You\'ll learn about the products, how to sell, and how to grow your team step by step.',
  },
  {
    question: 'How do I earn money?',
    answer: 'You earn in three main ways: (1) Retail profit — buy products at distributor price and sell at retail price for up to 20% profit. (2) Performance bonus — earn up to 28% based on your team\'s total sales. (3) Leadership bonus — earn an additional 25% when you develop qualified leaders in your team.',
  },
  {
    question: 'What support do I get as a new member?',
    answer: 'Every new member receives personal mentorship, product training, marketing materials, and ongoing WhatsApp support from our team. Star 1–7 distributors receive extra attention to ensure they build a strong foundation.',
  },
  {
    question: 'What products does BF Suma sell?',
    answer: 'BF Suma sells a wide range of health and wellness products including nutritional supplements, personal care items, and health drinks. All products are internationally certified and sold across Africa and Asia.',
  },
  {
    question: 'Can I do this part-time?',
    answer: 'Absolutely. Many of our most successful distributors started part-time while keeping their regular jobs. You set your own schedule and grow at your own pace.',
  },
  {
    question: 'What are the travel and car rewards?',
    answer: 'As you advance through the ranks, you qualify for all-expenses-paid trips (regional and international) and car incentives. These are real rewards that BF Suma provides to its top-performing distributors worldwide.',
  },
  {
    question: 'Is this a pyramid scheme?',
    answer: 'No. BF Suma is a legitimate direct selling company with real physical products. You earn income from actual product sales, not from recruitment alone. The company is registered and operates in over 30 countries worldwide.',
  },
];

const JoinFAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know before joining.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`faq-${index}`}>
              <AccordionTrigger className="text-left text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default JoinFAQ;
