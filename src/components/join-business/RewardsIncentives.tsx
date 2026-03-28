import { Plane, Car, Trophy, Star, Gift, Sparkles, Store } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import travelImage from '@/assets/travel-reward.jpg';
import carImage from '@/assets/car-reward.jpg';

const RewardsIncentives = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Rewards & Incentives
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            BF Suma doesn't just pay you — it celebrates your success with life-changing rewards.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Travel Rewards */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <img
              src={travelImage}
              alt="International travel rewards for BF Suma top performers"
              className="w-full h-52 object-cover"
              loading="lazy"
              width={800}
              height={544}
            />
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Travel Rewards</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                High-performing distributors earn all-expenses-paid trips worth thousands of dollars:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Intercontinental Trip (US$2,000):</strong> For Star 1–7 distributors with 3+ active 7-Star team members and yearly group sales of 40,000+ PV
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">International Trip (US$4,000):</strong> For Diamond Leaders and above with 3+ active 7-Star team members and yearly group sales of 80,000+ PV
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Senior Leader Trips:</strong> Star 8–12 distributors also qualify for intercontinental (US$2,000) and international (US$4,000) trips based on performance
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Car Awards */}
          <Card className="overflow-hidden border-0 shadow-lg">
            <img
              src={carImage}
              alt="Car awards for BF Suma qualified leaders"
              className="w-full h-52 object-cover"
              loading="lazy"
              width={800}
              height={544}
            />
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Car className="h-5 w-5 text-accent" />
                <h3 className="text-xl font-bold text-foreground">Car Awards</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Top performers qualify for car incentives worth up to US$25,000:
              </p>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Normal Car Award (US$12,500):</strong> For Senior Diamond Leaders with 10-Star+ rank, 3+ active 7-Star downlines, and yearly PGV of 120,000+ PV
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">Luxury Car Award (US$25,000):</strong> For Crown Leaders and above with 11-Star+ rank, 3+ active 7-Star downlines, and yearly PGV of 120,000+ PV
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Must stay active every month — assessed once per BF Suma Value Year</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 7 Star Special Support */}
        <div className="mb-12 p-6 rounded-2xl bg-accent/5 border border-accent/20">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">7-Star Special Support — 3% Cash Bonus</h3>
              <p className="text-sm text-muted-foreground mb-3">
                When you reach 7-Star status and have at least two 7-Star team members, you qualify for a special monthly cash bonus of 3% of your team's group sales volume. This is BF Suma's way of supporting top distributors who are building strong teams.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-background border text-muted-foreground">7-Star rank required</span>
                <span className="px-3 py-1 rounded-full bg-background border text-muted-foreground">2+ 7-Star downlines</span>
                <span className="px-3 py-1 rounded-full bg-background border text-muted-foreground">1,500+ PV minimum</span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Store Service Bonus */}
        <div className="mb-12 p-6 rounded-2xl bg-secondary/5 border border-secondary/20">
          <div className="flex items-start gap-3">
            <Store className="h-6 w-6 text-secondary mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-foreground mb-2">Special Store Service Bonus (SSSB) — Up to 6%</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Successful leaders can qualify to operate a BF Suma special store. You'll earn a monthly bonus of up to 6% based on your store's total PV performance — including operation allowance, maintenance allowance, and a performance bonus.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="px-3 py-1 rounded-full bg-background border text-muted-foreground">2–6% total bonus</span>
                <span className="px-3 py-1 rounded-full bg-background border text-muted-foreground">Based on monthly store TPV</span>
                <span className="px-3 py-1 rounded-full bg-background border text-muted-foreground">Reviewed each value month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Other Benefits */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Performance Bonuses</h4>
            <p className="text-sm text-muted-foreground">Up to 28% OPB and 25% LDB as your team grows</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-accent/5 border border-accent/10">
            <Gift className="h-8 w-8 text-accent mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Up to 20% Retail Profit</h4>
            <p className="text-sm text-muted-foreground">Buy at distributor price, sell at retail price — keep the difference</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
            <Star className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Recognition</h4>
            <p className="text-sm text-muted-foreground">Get recognised at national and international events as you advance</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Leadership</h4>
            <p className="text-sm text-muted-foreground">Lead your own organisation, mentor new members, and build a legacy</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsIncentives;
