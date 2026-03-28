import { useState, useMemo } from 'react';
import { useAnimatedNumber } from '@/hooks/use-animated-number';
import { Calculator, TrendingUp, DollarSign, Users, Star, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ranks = [
  { value: '1', label: '1 Star', opb: 0, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: false },
  { value: '2', label: '2 Star', opb: 5, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: false },
  { value: '3', label: '3 Star', opb: 9, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: false },
  { value: '4', label: '4 Star', opb: 13, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: false },
  { value: '5', label: '5 Star', opb: 17, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: false },
  { value: '6', label: '6 Star', opb: 22, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: false },
  { value: '7', label: '7 Star (Leader)', opb: 28, ldb: 0, hasLSB: false, hasLGB: false, has7StarSupport: true },
  { value: '8', label: 'Senior Leader', opb: 28, ldb: 5, hasLSB: true, hasLGB: false, has7StarSupport: true },
  { value: '9', label: 'Diamond Leader', opb: 28, ldb: 10, hasLSB: true, hasLGB: false, has7StarSupport: true },
  { value: '10', label: 'Senior Diamond', opb: 28, ldb: 15, hasLSB: true, hasLGB: true, has7StarSupport: true },
  { value: '11', label: 'Crown Leader', opb: 28, ldb: 20, hasLSB: true, hasLGB: true, has7StarSupport: true },
  { value: '12', label: 'Senior Crown Leader', opb: 28, ldb: 25, hasLSB: true, hasLGB: true, has7StarSupport: true },
];

const avgTeamOPB = 9; // Average team member OPB percentage (assumed ~3 Star average)

const EarningsCalculator = () => {
  const [selectedRank, setSelectedRank] = useState('3');
  const [personalPV, setPersonalPV] = useState([50]);
  const [teamMembers, setTeamMembers] = useState([5]);
  const [avgTeamPV, setAvgTeamPV] = useState([30]);

  const rank = ranks.find(r => r.value === selectedRank)!;

  const earnings = useMemo(() => {
    const personal = personalPV[0];
    const members = teamMembers[0];
    const avgPV = avgTeamPV[0];
    const totalTeamPV = members * avgPV;
    const totalGroupPV = personal + totalTeamPV;

    // Retail profit: ~20% on personal sales (PV ≈ US$ value approximation)
    const retailProfit = personal * 0.20;

    // OPB differential: your % minus average team member's %
    const opbDiff = Math.max(0, rank.opb - avgTeamOPB);
    const opbEarnings = (totalTeamPV * opbDiff) / 100;

    // LDB: percentage of qualified leaders' group volume
    const ldbEarnings = rank.ldb > 0 ? (totalTeamPV * rank.ldb) / 100 : 0;

    // 7-Star Support: 3% of group PV (if eligible)
    const sevenStarBonus = rank.has7StarSupport ? (totalGroupPV * 3) / 100 : 0;

    // LSB: simplified estimate (~5% of a portion of team volume)
    const lsbEarnings = rank.hasLSB ? (totalTeamPV * 5) / 100 : 0;

    // LGB: simplified estimate (~1% of group volume for eligible ranks)
    const lgbEarnings = rank.hasLGB ? (totalGroupPV * 1) / 100 : 0;

    const total = retailProfit + opbEarnings + ldbEarnings + sevenStarBonus + lsbEarnings + lgbEarnings;

    return {
      retailProfit,
      opbEarnings,
      ldbEarnings,
      sevenStarBonus,
      lsbEarnings,
      lgbEarnings,
      total,
      totalGroupPV,
    };
  }, [selectedRank, personalPV, teamMembers, avgTeamPV, rank]);

  const formatUSD = (val: number) => `US$${val.toFixed(0)}`;

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Calculator className="h-4 w-4" />
            Earnings Estimator
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            See What You Could Earn
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Adjust your rank, personal sales, and team size to get an estimate of your potential monthly income.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardContent className="p-6 space-y-6">
                {/* Rank selector */}
                <div>
                  <label className="text-sm font-semibold text-foreground mb-2 block">Your Rank</label>
                  <Select value={selectedRank} onValueChange={setSelectedRank}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ranks.map(r => (
                        <SelectItem key={r.value} value={r.value}>
                          <span className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-accent" />
                            {r.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Personal PV */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-foreground">Your Monthly PV</label>
                    <span className="text-sm font-bold text-primary">{personalPV[0]} PV</span>
                  </div>
                  <Slider
                    value={personalPV}
                    onValueChange={setPersonalPV}
                    min={10}
                    max={500}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10 PV</span>
                    <span>500 PV</span>
                  </div>
                </div>

                {/* Team members */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-foreground">Team Members</label>
                    <span className="text-sm font-bold text-primary">{teamMembers[0]}</span>
                  </div>
                  <Slider
                    value={teamMembers}
                    onValueChange={setTeamMembers}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Avg team PV */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-foreground">Avg. Team Member PV</label>
                    <span className="text-sm font-bold text-primary">{avgTeamPV[0]} PV</span>
                  </div>
                  <Slider
                    value={avgTeamPV}
                    onValueChange={setAvgTeamPV}
                    min={10}
                    max={200}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>10 PV</span>
                    <span>200 PV</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-6">
            {/* Total */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm font-medium">Estimated Monthly Earnings</p>
                    <p className="text-4xl md:text-5xl font-bold mt-1">{formatUSD(earnings.total)}</p>
                    <p className="text-primary-foreground/70 text-sm mt-2">
                      Total Group PV: {earnings.totalGroupPV.toLocaleString()} PV
                    </p>
                  </div>
                  <TrendingUp className="h-12 w-12 text-primary-foreground/30" />
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card className="border-border">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Earnings Breakdown
                </h3>
                <div className="space-y-3">
                  <EarningRow
                    label="Retail Profit (20%)"
                    value={earnings.retailProfit}
                    tooltip="Profit from selling products at retail price vs. your distributor price"
                    active
                  />
                  <EarningRow
                    label={`Performance Bonus (OPB ${rank.opb}%)`}
                    value={earnings.opbEarnings}
                    tooltip="Earned on the difference between your OPB% and your team members' OPB%"
                    active={rank.opb > 0}
                  />
                  <EarningRow
                    label={`Leadership Bonus (LDB ${rank.ldb}%)`}
                    value={earnings.ldbEarnings}
                    tooltip="Bonus earned from your qualified leaders' group sales volume"
                    active={rank.ldb > 0}
                  />
                  <EarningRow
                    label="7-Star Support (3%)"
                    value={earnings.sevenStarBonus}
                    tooltip="Monthly cash bonus for 7-Star distributors with 2+ 7-Star downlines"
                    active={rank.has7StarSupport}
                  />
                  <EarningRow
                    label="Leader Sponsoring Bonus (LSB)"
                    value={earnings.lsbEarnings}
                    tooltip="Extra bonuses from qualified leaders across up to 3 generations"
                    active={rank.hasLSB}
                  />
                  <EarningRow
                    label="Leader Global Bonus (LGB)"
                    value={earnings.lgbEarnings}
                    tooltip="Share of BF Suma's global bonus pool for Senior Diamond and above"
                    active={rank.hasLGB}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <p className="text-xs text-muted-foreground text-center px-4">
              <strong>Disclaimer:</strong> This is a simplified estimate for illustration only. Actual earnings depend on personal effort, team performance, product sales, and BF Suma's official compensation plan terms. Results are not guaranteed.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const EarningRow = ({ label, value, tooltip, active }: { label: string; value: number; tooltip: string; active: boolean }) => (
  <TooltipProvider>
    <div className={`flex items-center justify-between py-2 px-3 rounded-lg transition-colors ${active ? 'bg-muted/50' : 'opacity-40'}`}>
      <div className="flex items-center gap-2">
        <span className={`text-sm ${active ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[220px]">
            <p className="text-xs">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <span className={`text-sm font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
        US${value.toFixed(0)}
      </span>
    </div>
  </TooltipProvider>
);

export default EarningsCalculator;
