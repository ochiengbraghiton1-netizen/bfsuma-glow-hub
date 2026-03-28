import { ShoppingBag, Users, Award, Star, Globe, Crown } from 'lucide-react';
import { useInView } from '@/hooks/use-in-view';

const streams = [
  { icon: ShoppingBag, label: 'Retail Profit', pct: '20%', desc: 'Markup on every product you sell', color: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' },
  { icon: Users, label: 'OPB', pct: '28%', desc: 'Bonus on your team\'s total sales', color: 'bg-primary/15 border-primary/30 text-primary' },
  { icon: Award, label: 'LDB', pct: '25%', desc: 'Leadership bonus from qualified leaders', color: 'bg-accent/15 border-accent/30 text-accent' },
  { icon: Star, label: '7-Star Support', pct: '3%', desc: 'Cash reward at 7-Star rank', color: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400' },
  { icon: Crown, label: 'LSB', pct: '6.5%', desc: 'Bonus from leaders you\'ve mentored', color: 'bg-purple-500/15 border-purple-500/30 text-purple-600 dark:text-purple-400' },
  { icon: Globe, label: 'LGB', pct: '3%', desc: 'Share of global company profits', color: 'bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-400' },
];

const IncomeStreamsGraphic = () => {
  const [ref, isInView] = useInView<HTMLElement>({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            6 Ways You Earn
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            BF Suma rewards you through multiple income streams — the higher you rise, the more streams you unlock.
          </p>
        </div>

        {/* Central hub */}
        <div className="flex flex-col items-center mb-6">
          <div className={`px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg transition-all duration-500 ${isInView ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
            Your Earnings
          </div>
          <div className={`w-px h-6 bg-primary/40 transition-all duration-300 delay-200 ${isInView ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Stream cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {streams.map((s, i) => (
            <div
              key={s.label}
              className={`relative p-4 md:p-5 rounded-xl border ${s.color} text-center transition-all duration-500 hover:shadow-md hover:-translate-y-0.5 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
              style={{ transitionDelay: isInView ? `${300 + i * 120}ms` : '0ms' }}
            >
              <s.icon className="h-6 w-6 mx-auto mb-2 opacity-80" />
              <div className="font-bold text-2xl tabular-nums mb-1">{s.pct}</div>
              <div className="font-semibold text-sm text-foreground mb-1">{s.label}</div>
              <div className="text-xs text-muted-foreground leading-snug">{s.desc}</div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6 max-w-md mx-auto">
          Everyone starts with Retail Profit. As you grow your team and rank up, you unlock OPB, LDB, and more.
        </p>
      </div>
    </section>
  );
};

export default IncomeStreamsGraphic;
