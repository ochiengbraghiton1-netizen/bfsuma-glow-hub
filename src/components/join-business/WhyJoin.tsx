import { Briefcase, Clock, Heart, Globe, ShieldCheck, TrendingUp } from 'lucide-react';

const reasons = [
  { icon: Briefcase, title: 'Extra Income', description: 'Earn commissions, retail profit, and performance bonuses alongside your current job or as a full-time business.' },
  { icon: Clock, title: 'Flexible Work', description: 'Work on your own schedule. Sell products and build your team when it suits you — from anywhere.' },
  { icon: Heart, title: 'Personal Growth', description: 'Develop leadership, communication, and business skills through real experience and mentorship.' },
  { icon: Globe, title: 'Global Rewards', description: 'Unlock travel, car awards, and bonuses as you advance through the ranks.' },
  { icon: ShieldCheck, title: 'Trusted Brand', description: 'BF Suma is a globally recognised health and wellness company with products sold across Africa and beyond.' },
  { icon: TrendingUp, title: 'Unlimited Potential', description: 'There\'s no cap on how much you can earn. Your income grows as your team and performance grow.' },
];

const WhyJoin = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Join BF Suma Royal?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Thousands of people across Kenya are building their future with BF Suma. Here's why.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((reason, index) => (
            <div key={index} className="flex gap-4 p-5 rounded-xl bg-background border border-border hover:border-primary/30 transition-colors">
              <reason.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">{reason.title}</h3>
                <p className="text-sm text-muted-foreground">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyJoin;
