import { GraduationCap, HeartHandshake, BookOpen, Headphones } from 'lucide-react';
import mentorshipImage from '@/assets/support-mentorship.jpg';

const supports = [
  {
    icon: GraduationCap,
    title: 'Step-by-Step Training',
    description: 'New members receive guided training on how to use, market, and sell BF Suma products effectively.',
  },
  {
    icon: HeartHandshake,
    title: 'Personal Mentorship',
    description: 'Every distributor is paired with an experienced mentor who provides one-on-one guidance on growing your business.',
  },
  {
    icon: BookOpen,
    title: 'Business Resources',
    description: 'Access marketing materials, product catalogues, and business planning tools to help you succeed from day one.',
  },
  {
    icon: Headphones,
    title: 'Ongoing Support',
    description: 'Our team is available via WhatsApp to answer questions, resolve issues, and celebrate your wins.',
  },
];

const SupportSystem = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              We Support You Every Step of the Way
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're just starting out at Star 1 or building towards leadership, BF Suma Royal provides dedicated support so you never feel alone on your journey.
            </p>
            <div className="grid gap-6">
              {supports.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <img
              src={mentorshipImage}
              alt="BF Suma Royal team training and mentorship session in Kenya"
              className="rounded-2xl shadow-xl w-full"
              loading="lazy"
              width={800}
              height={544}
            />
            <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground px-6 py-3 rounded-xl shadow-lg font-semibold">
              Special support for Star 1–7
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SupportSystem;
