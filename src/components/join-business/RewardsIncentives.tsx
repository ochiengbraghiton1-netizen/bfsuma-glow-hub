import { Plane, Car, Trophy, Star } from 'lucide-react';
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
                High-performing distributors earn all-expenses-paid trips. As you grow, your travel rewards grow too:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Star 3–5:</strong> Regional trips for recognition and networking</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Star 6+:</strong> International trips to destinations across the world</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground"><strong className="text-foreground">Leaders:</strong> Intercontinental luxury trips for top leaders</span>
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
                Top performers who reach leadership ranks qualify for car incentives. This is BF Suma's way of recognising your hard work.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Qualified leaders with strong, active teams are eligible</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Car value increases with your leadership rank</span>
                </li>
                <li className="flex items-start gap-2">
                  <Star className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Part of BF Suma's global reward program across all markets</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Other Benefits */}
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/10">
            <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Performance Bonuses</h4>
            <p className="text-sm text-muted-foreground">Earn up to 28% OPB and 25% LDB as your team grows and performs</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-accent/5 border border-accent/10">
            <Star className="h-8 w-8 text-accent mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Recognition</h4>
            <p className="text-sm text-muted-foreground">Get recognised at national and international events as you advance through ranks</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-secondary/5 border border-secondary/10">
            <Trophy className="h-8 w-8 text-secondary mx-auto mb-3" />
            <h4 className="font-semibold text-foreground mb-2">Leadership Opportunities</h4>
            <p className="text-sm text-muted-foreground">Lead your own organisation, mentor new members, and build a legacy</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RewardsIncentives;
