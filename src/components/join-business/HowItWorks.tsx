import { UserPlus, ShoppingBag, DollarSign, Users, Gift } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Join the Program',
    description: 'Register with a one-time entry fee of KES 7,000. You get a starter kit and access to the full product range at distributor prices.',
  },
  {
    icon: ShoppingBag,
    title: 'Purchase or Promote Products',
    description: 'Buy health and wellness products at a discounted distributor price. Sell to customers at retail price and earn up to 20% profit on every sale.',
  },
  {
    icon: DollarSign,
    title: 'Earn Commissions',
    description: 'As your sales volume grows, you earn performance bonuses of up to 28% based on your team\'s total sales. The more your team sells, the more you earn.',
  },
  {
    icon: Users,
    title: 'Grow Your Network',
    description: 'Invite others to join your team. As they succeed, you rise through the ranks — from 1 Star all the way to Senior Crown Leader.',
  },
  {
    icon: Gift,
    title: 'Unlock Rewards',
    description: 'Top performers unlock incredible rewards including international trips, car awards, and leadership bonuses worth thousands of dollars.',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How the Business Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Getting started is simple. Follow these five steps to begin earning with BF Suma Royal.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {steps.map((step, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <step.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
              </div>
              <div className="text-sm font-bold text-accent mb-1">Step {index + 1}</div>
              <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
