import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How do I join BF Suma Royal?',
    answer: 'Fill out the registration form on this page, or contact us on WhatsApp. You pay a one-time KES 7,000 to get started, and we guide you through the rest.',
  },
  {
    question: 'What exactly does the KES 7,000 cover?',
    answer: 'It splits into two parts. KES 3,000 is your starter kit: a wellness guide covering every formulation and the conditions it supports, a product overview, a branded bag, and a starter product. The remaining KES 4,000 buys products of your choice, worth about 20 PV, which activates your account. That KES 4,000 is stock you can use or sell on, not a fee.',
  },
  {
    question: 'Can I choose which products I get on activation?',
    answer: 'Yes. Your KES 4,000 activation is made up of products you select, so you can pick what suits you or what sells best in your area. Your mentor will help you choose a good starting mix.',
  },
  {
    question: 'Do I need any experience?',
    answer: 'No experience is needed. BF Suma provides full training and mentorship for all new distributors. You learn about the products, how to sell, and how to grow your team step by step.',
  },
  {
    question: 'How do I earn money?',
    answer: 'The plan has eight earning routes: retail profit of up to 20% on products you sell, the Organisation Performance Bonus of up to 28%, the Leadership Development Bonus of up to 25%, the Leader Sponsoring Bonus of 6.5%, the Leader Global Bonus of 3%, the New Product Fund of 7.5% which pays the 4 Star and 7 Star special support awards, the Special Store Service Bonus of up to 6%, and trip and car awards. Everyone begins with retail profit and unlocks more as they rank up. These are maximum shares, not promised income, and results vary.',
  },
  {
    question: 'What can I realistically earn in my first three months?',
    answer: 'Your 20 PV activation places you at 2 Star from day one, so you earn a 5% performance bonus immediately alongside your retail profit. The first cash milestone most new members work towards is the 4 Star special support award of US$50, which needs 4 Star rank, two downlines at 3 Star, and 1,500 PV in group sales. Many reach it within 60 to 90 days of consistent effort, but there is no guarantee.',
  },
  {
    question: 'Do I have to stay active every month?',
    answer: 'Yes, for the monthly bonuses and for trip and car awards. Monthly qualification is based on your own purchases and sales, and the trip and car awards also require you to be active every month of the value year. Rank progression itself is based on your group\'s cumulative sales, so a rank you have reached is not lost.',
  },
  {
    question: 'What support do I get as a new member?',
    answer: 'Every new member receives personal mentorship, product training, marketing materials, and ongoing WhatsApp support from our team. Star 1 to 7 distributors receive extra attention to ensure they build a strong foundation.',
  },
  {
    question: 'What products does BF Suma sell?',
    answer: 'BF Suma sells a wide range of health and wellness products including nutritional supplements, personal care items, and health drinks. All products are internationally certified and sold across Africa and Asia.',
  },
  {
    question: 'Can I do this part-time?',
    answer: 'Yes. Many of our distributors started part-time while keeping their regular jobs. You set your own schedule and grow at your own pace.',
  },
  {
    question: 'What are the travel and car rewards?',
    answer: 'As you advance, you can qualify for all-expenses-paid trips worth US$2,000 or US$4,000 and car awards worth US$12,500 or US$25,000. These require active 7 Star members in different first-generation legs, specific yearly group sales, and staying active every month of the value year.',
  },
  {
    question: 'Is this a pyramid scheme?',
    answer: 'No. BF Suma is a direct selling company with real physical products. Income comes from actual product sales, not from recruitment alone. The company is registered and operates in over 30 countries.',
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
