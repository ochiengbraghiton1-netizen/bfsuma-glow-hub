import { Star, Award, Crown, Car, Plane } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';

const ranks = [
  { rank: '1★', label: 'Start Here', bonus: '0%', type: 'star', reward: 'KES 7,000 entry' },
  { rank: '2★', label: '2 Star', bonus: '5%', type: 'star' },
  { rank: '3★', label: '3 Star', bonus: '9%', type: 'star' },
  { rank: '4★', label: '4 Star', bonus: '13%', type: 'star' },
  { rank: '5★', label: '5 Star', bonus: '17%', type: 'star' },
  { rank: '6★', label: '6 Star', bonus: '22%', type: 'star' },
  { rank: '7★', label: '7 Star Leader', bonus: '28% OPB', type: 'leader', reward: '3% Cash Bonus' },
  { rank: 'SL', label: 'Senior Leader', bonus: '5% LDB', type: 'leader' },
  { rank: 'DL', label: 'Diamond Leader', bonus: '8–10% LDB', type: 'leader' },
  { rank: 'SDL', label: 'Senior Diamond', bonus: '15% LDB', type: 'crown' },
  { rank: 'CL', label: 'Crown Leader', bonus: '20% LDB', type: 'crown', reward: 'US$4K Trip' },
  { rank: 'SCL', label: 'Senior Crown', bonus: '25% LDB', type: 'crown', reward: 'US$25K Car' },
];

const RankProgressionGraphic = () => {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold: 0.15 });

  const getIcon = (type: string) => {
    if (type === 'crown') return Crown;
    if (type === 'leader') return Award;
    return Star;
  };

  const getRewardIcon = (reward?: string) => {
    if (!reward) return null;
    if (reward.includes('Car')) return Car;
    if (reward.includes('Trip')) return Plane;
    return null;
  };

  return (
    <div ref={ref} className="mb-14">
      <h3 className="text-xl font-bold text-foreground mb-2 text-center">Your Journey to the Top</h3>
      <p className="text-muted-foreground text-center mb-8 text-sm max-w-lg mx-auto">
        Every distributor starts at 1 Star. Each rank unlocks higher bonuses — and at the top, cars and travel rewards.
      </p>

      <div className="relative max-w-2xl mx-auto">
        {/* Vertical line */}
        <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-muted via-primary/40 to-accent" />

        <div className="space-y-1">
          {[...ranks].reverse().map((r, i) => {
            const Icon = getIcon(r.type);
            const RewardIcon = getRewardIcon(r.reward);
            const isTop = r.type === 'crown';
            const isLeader = r.type === 'leader';

            return (
              <div
                key={r.rank}
                className={`relative flex items-center gap-3 md:gap-4 pl-2 md:pl-4 py-2 transition-all duration-500 ${isInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}
                style={{ transitionDelay: isInView ? `${i * 80}ms` : '0ms' }}
              >
                {/* Node dot */}
                <div className={`relative z-10 flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 shadow-sm ${
                  isTop ? 'bg-accent/20 border-accent text-accent' :
                  isLeader ? 'bg-primary/20 border-primary text-primary' :
                  'bg-muted border-border text-muted-foreground'
                }`}>
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </div>

                {/* Content */}
                <div className={`flex-1 flex items-center justify-between gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  isTop ? 'bg-accent/5 border-accent/20 hover:border-accent/40' :
                  isLeader ? 'bg-primary/5 border-primary/20 hover:border-primary/40' :
                  'bg-muted/30 border-border hover:border-muted-foreground/30'
                }`}>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`font-bold text-sm tabular-nums ${isTop ? 'text-accent' : isLeader ? 'text-primary' : 'text-foreground'}`}>
                      {r.rank}
                    </span>
                    <span className="text-sm text-muted-foreground truncate hidden sm:inline">{r.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-foreground tabular-nums">{r.bonus}</span>
                    {r.reward && (
                      <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isTop ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-primary'
                      }`}>
                        {RewardIcon && <RewardIcon className="h-3 w-3" />}
                        {r.reward}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RankProgressionGraphic;
