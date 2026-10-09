import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import TeamSection from './TeamSection';

const ChampionsSection = () => {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    (supabase as any)
      .from('team_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('profile_group', 'champion')
      .then(({ count }: { count: number | null }) => setCount(count ?? 0));
  }, []);

  if (!count) return null;

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Our Champions</h2>
          <p className="text-lg text-primary font-medium">Real distributors, building real businesses across Kenya.</p>
          <p className="text-xs text-muted-foreground mt-2 max-w-2xl mx-auto">
            Individual results vary and depend on personal effort and sales. Stories and photos are shared with each person's consent.
          </p>
        </div>
        <TeamSection group="champion" />
      </div>
    </section>
  );
};

export default ChampionsSection;
