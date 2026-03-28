import { Star, Crown, Award, TrendingUp, Users, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const beginnerLevels = [
  { rank: '1 Star', condition: 'Purchase starter kit (US$200)', bonus: '0%', description: 'You just joined — welcome! Start by buying and selling products.' },
  { rank: '2 Star', condition: '3 pax, ≥20 PV each', bonus: '5%', description: 'You begin earning performance bonuses as your personal sales grow.' },
  { rank: '3 Star', condition: '≥300 PV, ≥20 PV personal', bonus: '9%', description: 'Your network is building. Enjoy higher bonuses on team performance.' },
  { rank: '4 Star', condition: '≥1,000 PV, ≥30 PV personal', bonus: '13%', description: 'You\'re leading a team. Your earnings increase with your team\'s success.' },
  { rank: '5 Star', condition: '≥3,000 PV, ≥40 PV personal', bonus: '17%', description: 'You\'re a proven leader. Your team generates serious income for you.' },
  { rank: '6 Star', condition: '≥8,000 PV, ≥50 PV personal', bonus: '22%', description: 'Strong team performance unlocks major bonuses and recognition.' },
];

const leaderLevels = [
  { rank: '7 Star (Leader)', condition: '≥10,000 PV, ≥50 PV personal', bonus: '28% OPB', icon: Award },
  { rank: 'Senior Leader (SL)', condition: '1 qualified leader, ≥100 PV', bonus: '5% LDB', icon: Award },
  { rank: 'Diamond Leader (DL)', condition: '2 qualified leaders, ≥100 PV', bonus: '8–10% LDB', icon: Award },
  { rank: 'Senior Diamond (SDL)', condition: '3 qualified leaders, ≥100 PV', bonus: '15% LDB', icon: Crown },
  { rank: 'Crown Leader (CL)', condition: '4 qualified leaders, ≥100 PV', bonus: '20% LDB', icon: Crown },
  { rank: 'Senior Crown Leader (SCL)', condition: '5 qualified leaders, ≥265 PV', bonus: '25% LDB', icon: Crown },
];

const StarLevels = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Your Growth Path
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            As you sell more products and build your team, you move up through levels — unlocking bigger bonuses and rewards at each stage.
          </p>
        </div>

        {/* Beginner to Intermediate */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-bold text-foreground">Star Levels 1–6 (Building Your Foundation)</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Every distributor starts at 1 Star. As your personal and team sales grow, you advance through the star levels and earn higher bonuses.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beginnerLevels.map((level, index) => (
              <Card key={index} className="border-border hover:border-primary/40 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground">{level.rank}</span>
                    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-accent/10 text-accent">
                      Up to {level.bonus}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Advanced Leaders */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Crown className="h-6 w-6 text-accent" />
            <h3 className="text-xl font-bold text-foreground">Leadership Ranks (Advanced)</h3>
          </div>
          <p className="text-muted-foreground mb-6">
            Once you reach 6 Star and have qualified leaders in your team, you advance into the Leadership tier. Here you earn an additional Leadership Development Bonus (LDB) of up to 25%.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leaderLevels.map((level, index) => (
              <Card key={index} className="border-border hover:border-accent/40 transition-colors bg-gradient-to-br from-background to-accent/5">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <level.icon className="h-5 w-5 text-accent" />
                    <span className="font-bold text-foreground text-sm">{level.rank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">{level.condition}</span>
                    <span className="text-sm font-semibold text-accent">{level.bonus}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Additional Bonuses for Leaders */}
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-accent/5 border border-accent/20">
            <div className="flex items-start gap-3">
              <Users className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Leader Sponsoring Bonus (LSB) — 6.5%</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  As a Senior Leader or above, you earn extra bonuses from the sales of qualified leaders you've personally developed — across up to 3 generations of your network.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong className="text-foreground">1st Generation:</strong> 5–10% based on your rank</li>
                  <li>• <strong className="text-foreground">2nd Generation:</strong> 5–10% based on your rank</li>
                  <li>• <strong className="text-foreground">3rd Generation:</strong> 3–6% for top leaders</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-secondary/5 border border-secondary/20">
            <div className="flex items-start gap-3">
              <Globe className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground mb-2">Leader Global Bonus (LGB) — 3%</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  BF Suma sets aside 3% of total company sales into a global bonus pool. Senior Diamond Leaders and above share in this pool — giving you a slice of the company's worldwide success.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Available to SDL, CL, and SCL ranks</li>
                  <li>• Distributed equally and proportionally</li>
                  <li>• Maximum 1.5% (SDL), 2.5% (CL), 3% (SCL)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Simple explainer */}
        <div className="mt-10 p-6 rounded-2xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">How Your Earnings Grow</h4>
              <p className="text-sm text-muted-foreground">
                You earn bonuses based on the difference between your rank's percentage and your team members' percentages. 
                For example, if you're at 28% and your direct team member is at 9%, you earn 19% on their team's sales volume. 
                The higher you rise, the bigger the gap — and the bigger your earnings. At the top, you also unlock sponsoring bonuses, departure bonuses, and a share of global company profits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StarLevels;
